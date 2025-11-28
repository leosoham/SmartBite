from __future__ import annotations

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from pydantic import BaseModel
import orjson
import requests

from ai_nutrition.nlp import IngredientAnalyzer, IngredientAnalysisConfig

# Optional OCR import - only needed for image processing
try:
	from ai_nutrition.ocr import OCRConfig, extract_ingredients_text
	OCR_AVAILABLE = True
except ImportError as e:
	OCR_AVAILABLE = False
	OCRConfig = None
	extract_ingredients_text = None
	print(f"Warning: OCR not available: {e}")


class AnalyzeRequest(BaseModel):
	text: str
	language: str | None = "en"
	aggressiveness: str | None = "balanced"


class AnalyzeResponse(BaseModel):
	ingredients: list[dict]
	notes: list[str]


class UnifiedAnalyzeJsonRequest(BaseModel):
	barcode: str | None = None
	ingredients_text: str | None = None
	language: str | None = "en"
	aggressiveness: str | None = "balanced"


class UnifiedAnalyzeResponse(BaseModel):
	product: dict | None
	ingredients_text: str | None
	nlp: AnalyzeResponse
	ready_for_ml: bool
	nutrition_facts: dict | None = None
	category: str | None = None


def _json_dumps(v, *, default):
	return orjson.dumps(v, default=default).decode()


app = FastAPI(title="AI Nutrition NLP Service", version="0.1.0")

# Lazy initialization of analyzer to avoid startup errors
analyzer = None
_analyzer_error = None

def get_analyzer():
	global analyzer, _analyzer_error
	if analyzer is None and _analyzer_error is None:
		try:
			analyzer = IngredientAnalyzer(IngredientAnalysisConfig())
		except Exception as e:
			_analyzer_error = str(e)
			print(f"Warning: Failed to initialize analyzer: {e}")
	if analyzer is None:
		raise RuntimeError(f"Analyzer not available: {_analyzer_error}")
	return analyzer


@app.get("/")
def root():
	try:
		return {"service": "AI Nutrition NLP Service", "status": "running", "version": "0.1.0"}
	except Exception as e:
		return {"error": str(e), "status": "error"}


@app.get("/health")
def health():
	try:
		analyzer_status = "ready"
		try:
			get_analyzer()
		except Exception as e:
			analyzer_status = f"error: {str(e)}"
		return {"status": "healthy", "analyzer": analyzer_status}
	except Exception as e:
		return {"status": "error", "error": str(e)}


@app.post("/api/nlp/analyze-ingredients", response_model=AnalyzeResponse)
def analyze_ingredients(req: AnalyzeRequest):
	analyzer = get_analyzer()
	if req.language and req.language != analyzer.config.language:
		analyzer.config.language = req.language
	if req.aggressiveness:
		analyzer.config.aggressiveness = req.aggressiveness
	result = analyzer.analyze(req.text)
	return AnalyzeResponse(**result)

@app.post("/api/ocr/extract")
async def ocr_extract(image: UploadFile = File(...), language: str = Form("eng")):
	content = await image.read()
	ocr_result = extract_ingredients_text(content, OCRConfig(language=language))
	return ocr_result


def _fetch_off_product(barcode: str) -> dict | None:
	try:
		base = "https://world.openfoodfacts.org/api/v2"
		resp = requests.get(f"{base}/product/{barcode}.json", timeout=10)
		if resp.status_code != 200:
			return None
		data = resp.json()
		product = data.get("product")
		if not product:
			return None
		return product
	except Exception:
		return None


def _merge_ingredients_text(*texts: str | None) -> str | None:
	parts = [t.strip() for t in texts if t and isinstance(t, str) and t.strip()]
	if not parts:
		return None
	# Deduplicate by tokens order-preserving
	seen = set()
	merged = []
	for t in parts:
		if t.lower() not in seen:
			merged.append(t)
			seen.add(t.lower())
	return " | ".join(merged)


def _infer_category(ingredients_text: str, nutrition_facts: dict | None = None) -> str | None:
	"""
	Infer product category from ingredients and nutrition facts.
	"""
	if not ingredients_text:
		return None
	
	ingredients_lower = ingredients_text.lower()
	
	# Category keywords mapping
	categories = {
		'Beverages': ['water', 'juice', 'soda', 'cola', 'drink', 'beverage', 'tea', 'coffee', 'milk', 'smoothie'],
		'Snacks': ['chips', 'crackers', 'cookies', 'biscuits', 'pretzels', 'nuts', 'popcorn'],
		'Dairy': ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'dairy'],
		'Bakery': ['bread', 'cake', 'pastry', 'muffin', 'bagel', 'croissant', 'flour', 'wheat'],
		'Candy & Sweets': ['chocolate', 'candy', 'sugar', 'sweet', 'gum', 'lollipop', 'caramel'],
		'Frozen Foods': ['frozen', 'ice cream', 'frozen'],
		'Cereals': ['cereal', 'oats', 'granola', 'breakfast'],
		'Condiments': ['sauce', 'ketchup', 'mayonnaise', 'mustard', 'dressing', 'vinegar'],
		'Meat & Poultry': ['chicken', 'beef', 'pork', 'turkey', 'meat', 'poultry'],
		'Seafood': ['fish', 'salmon', 'tuna', 'shrimp', 'seafood'],
		'Fruits & Vegetables': ['fruit', 'vegetable', 'apple', 'banana', 'tomato', 'carrot'],
		'Grains & Pasta': ['pasta', 'rice', 'noodles', 'quinoa', 'barley'],
	}
	
	# Score each category
	scores = {}
	for category, keywords in categories.items():
		score = sum(1 for keyword in keywords if keyword in ingredients_lower)
		if score > 0:
			scores[category] = score
	
	# Additional hints from nutrition facts
	if nutrition_facts:
		if nutrition_facts.get('energy', 0) < 50 and 'water' in ingredients_lower:
			scores['Beverages'] = scores.get('Beverages', 0) + 2
		if nutrition_facts.get('sugars', 0) > 20:
			scores['Candy & Sweets'] = scores.get('Candy & Sweets', 0) + 1
		if nutrition_facts.get('protein', 0) > 15:
			if 'meat' in ingredients_lower or 'chicken' in ingredients_lower:
				scores['Meat & Poultry'] = scores.get('Meat & Poultry', 0) + 2
	
	if scores:
		return max(scores.items(), key=lambda x: x[1])[0]
	
	return 'Food Product'  # Default fallback


@app.post("/api/analyze", response_model=UnifiedAnalyzeResponse)
def analyze_unified(req: UnifiedAnalyzeJsonRequest):
	try:
		# Optional OFF fetch
		off_product = _fetch_off_product(req.barcode) if req.barcode else None
		off_ingredients = (off_product or {}).get("ingredients_text")
		ingredients_text = _merge_ingredients_text(off_ingredients, req.ingredients_text)

		# Get analyzer (lazy initialization)
		analyzer = get_analyzer()
		
		# NLP config
		if req.language and req.language != analyzer.config.language:
			analyzer.config.language = req.language
		if req.aggressiveness:
			analyzer.config.aggressiveness = req.aggressiveness

		# NLP run
		nlp_result = analyzer.analyze(ingredients_text or "")

		product_info = None
		if off_product:
			product_info = {
				"id": off_product.get("code"),
				"name": off_product.get("product_name") or off_product.get("generic_name"),
				"source": "OFF"
			}

		return UnifiedAnalyzeResponse(
			product=product_info,
			ingredients_text=ingredients_text,
			nlp=AnalyzeResponse(**nlp_result),
			ready_for_ml=bool(ingredients_text and nlp_result.get("ingredients"))
		)
	except Exception as e:
		import traceback
		error_detail = traceback.format_exc()
		print(f"Error in analyze_unified: {e}")
		print(error_detail)
		raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.post("/api/analyze-multipart", response_model=UnifiedAnalyzeResponse)
async def analyze_unified_multipart(
	image: UploadFile | None = File(None),
	barcode: str | None = Form(None),
	language: str = Form("en"),
	aggressiveness: str = Form("balanced")
):
	# OFF
	off_product = _fetch_off_product(barcode) if barcode else None
	off_ingredients = (off_product or {}).get("ingredients_text")

	# OCR
	ocr_text = None
	ocr_product_name = None
	ocr_nutrition = None
	if image is not None:
		if not OCR_AVAILABLE:
			raise HTTPException(status_code=503, detail="OCR functionality not available. Please install opencv-python and pytesseract.")
		content = await image.read()
		ocr_result = extract_ingredients_text(content, OCRConfig(language="eng"))
		ocr_text = ocr_result.get("clean_text")
		ocr_product_name = ocr_result.get("product_name")
		ocr_nutrition = ocr_result.get("nutrition_facts") or {}

	ingredients_text = _merge_ingredients_text(off_ingredients, ocr_text)

	# Get analyzer (lazy initialization)
	analyzer = get_analyzer()
	
	# NLP config
	if language and language != analyzer.config.language:
		analyzer.config.language = language
	if aggressiveness:
		analyzer.config.aggressiveness = aggressiveness

	# NLP run
	nlp_result = analyzer.analyze(ingredients_text or "")

	# Build product info
	product_info = None
	nutrition_facts = None
	category = None
	
	if off_product:
		product_info = {
			"id": off_product.get("code"),
			"name": off_product.get("product_name") or off_product.get("generic_name"),
			"source": "OFF"
		}
		# Extract nutrition from OFF if available
		off_nutriments = off_product.get("nutriments") or {}
		if off_nutriments:
			nutrition_facts = {
				"energy": off_nutriments.get("energy-kcal_100g") or off_nutriments.get("energy_100g"),
				"fat": off_nutriments.get("fat_100g"),
				"saturated_fat": off_nutriments.get("saturated-fat_100g"),
				"sugars": off_nutriments.get("sugars_100g"),
				"salt": off_nutriments.get("salt_100g"),
				"protein": off_nutriments.get("proteins_100g"),
				"carbohydrates": off_nutriments.get("carbohydrates_100g")
			}
			# Remove None values
			nutrition_facts = {k: v for k, v in nutrition_facts.items() if v is not None}
		category = off_product.get("categories") or off_product.get("categories_tags", [None])[0] if off_product.get("categories_tags") else None
	elif image is not None:
		# Use OCR-extracted data
		product_info = {
			"id": None,
			"name": ocr_product_name or "Product from Label",
			"source": "OCR"
		}
		nutrition_facts = ocr_nutrition if ocr_nutrition else None
	
	# Infer category from ingredients if not available
	if not category and ingredients_text:
		category = _infer_category(ingredients_text, nutrition_facts)

	return UnifiedAnalyzeResponse(
		product=product_info,
		ingredients_text=ingredients_text,
		nlp=AnalyzeResponse(**nlp_result),
		ready_for_ml=bool(ingredients_text and nlp_result.get("ingredients")),
		nutrition_facts=nutrition_facts,
		category=category
	)


# Local dev entrypoint:
# uvicorn ai_nutrition.api.main:app --reload --port 8085

