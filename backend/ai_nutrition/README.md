AI Nutrition - NLP Ingredient Analyzer (Phase 1)
================================================

Overview
--------
Standalone NLP microservice to analyze ingredient lists and return per-ingredient classifications:
- Detects E-numbers/additives, added sugars, allergens, and unhealthy oils
- Classifies each ingredient as Healthy / Neutral / Risky
- Returns structured JSON suitable for frontend integration

Quickstart
----------
1) Create a virtual environment and install deps:
   - python -m venv .venv
   - .venv\Scripts\activate  (Windows)  |  source .venv/bin/activate (Linux/Mac)
   - pip install -r backend/ai_nutrition/requirements.txt

2) Run the API:
   - uvicorn ai_nutrition.api.main:app --reload --port 8085

3) Test with curl:
   - curl -X POST http://localhost:8085/api/nlp/analyze-ingredients ^
       -H "Content-Type: application/json" ^
       -d "{ \"text\": \"Ingredients: sugar, refined palm oil, milk powder, E211 (sodium benzoate), whole grain oats\", \"language\": \"en\", \"aggressiveness\": \"balanced\" }"

Unified Analyze (Simple Flow)
-----------------------------
Option A single-call flow that orchestrates OpenFoodFacts + OCR (if image) + NLP and returns a combined payload ready for ML.

JSON (barcode and/or raw ingredients text):
- curl -X POST http://localhost:8085/api/analyze ^
    -H "Content-Type: application/json" ^
    -d "{ \"barcode\": \"8901234567890\", \"ingredients_text\": null, \"language\": \"en\", \"aggressiveness\": \"balanced\" }"

Multipart (image + optional barcode):
- curl -X POST http://localhost:8085/api/analyze-multipart ^
    -F "barcode=8901234567890" ^
    -F "image=@C:\path\to\ingredients.jpg"

Response:
{
  "product": { "id": "8901234567890", "name": "Product name", "source": "OFF" },
  "ingredients_text": "merged and cleaned ingredients...",
  "nlp": {
    "ingredients": [ { "ingredient": "...", "category": "Risky", "risk_level": "high", "evidence": ["..."] } ],
    "notes": []
  },
  "ready_for_ml": true
}

OCR Usage
---------
Prerequisite on Windows (Tesseract engine):
- Install Tesseract OCR from: https://github.com/UB-Mannheim/tesseract/wiki
- Optionally set env var TESSERACT_CMD to the full path, e.g.:
  - setx TESSERACT_CMD "C:\\Program Files\\Tesseract-OCR\\tesseract.exe"

Test OCR endpoint with an image:
- curl -X POST http://localhost:8085/api/ocr/extract ^
    -F "image=@C:\path\to\ingredients.jpg" ^
    -F "language=eng"

Response:
{
  "raw_text": "...\n...\n",
  "clean_text": "cleaned single-line string"
}

Response Schema
---------------
{
  "ingredients": [
    {
      "ingredient": "sugar",
      "normalized": "sugar",
      "category": "Risky",
      "risk_level": "medium",
      "evidence": ["added_sugar:sugar"]
    },
    ...
  ],
  "notes": []
}

Local Smoke Test
----------------
- python backend/ai_nutrition/tests/smoke_test.py

Structure
---------
- ai_nutrition/
  - api/main.py                  FastAPI app with /api/nlp/analyze-ingredients
  - nlp/
    - analyzer.py                IngredientAnalyzer implementation
    - lexicons/                  JSON lexicons for additives/sugars/allergens/oils
  - ocr/
    - extract.py                 OCR preprocessing and extraction (Tesseract)
  - tests/smoke_test.py          Minimal script to exercise analyzer

Config
------
- Defaults: language=en, aggressiveness=balanced
- You can override per-request via POST body: { "language": "en", "aggressiveness": "balanced" }

Notes
-----
- The analyzer uses rule/pattern matching for speed and determinism, with a spaCy blank pipeline for tokenization where needed.
- Lexicons are intentionally small and can be expanded without code changes.

