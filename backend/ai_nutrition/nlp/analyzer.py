from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional

import spacy


@dataclass
class IngredientAnalysisConfig:
	"""
	Configuration for ingredient analysis behavior.
	"""
	language: str = "en"
	use_spacy: bool = True
	enable_transformer_fuzzy: bool = False  # placeholder for future upgrade
	aggressiveness: str = "balanced"  # "conservative" | "balanced" | "aggressive"
	max_ingredient_length: int = 120


class IngredientAnalyzer:
	"""
	Rule-augmented NLP analyzer for ingredient lists.
	- Tokenizes and splits ingredients
	- Normalizes text
	- Detects harmful additives, added sugars, allergens, unhealthy oils
	- Classifies each ingredient as Healthy / Neutral / Risky
	"""
	def __init__(self, config: Optional[IngredientAnalysisConfig] = None, lexicon_dir: Optional[str] = None) -> None:
		self.config = config or IngredientAnalysisConfig()
		self.lexicon_dir = Path(lexicon_dir or Path(__file__).parent / "lexicons")
		self._nlp = spacy.blank(self.config.language) if self.config.use_spacy else None

		# Load lexicons
		self.additives = self._load_json("additives.json")
		self.sugars = self._load_json("sugars.json")
		self.allergens = self._load_json("allergens.json")
		self.oils = self._load_json("oils.json")

		# Precompile patterns
		self.re_enumber = re.compile(r"\b(e[-\s]?\d{3,4}[a-z]?)\b", re.IGNORECASE)
		self.re_parenthetic = re.compile(r"\([^)]*\)")
		self.re_split = re.compile(r"[,;•]| and | with ", re.IGNORECASE)

	def _load_json(self, filename: str) -> Dict[str, Dict]:
		path = self.lexicon_dir / filename
		if not path.exists():
			return {}
		with path.open("r", encoding="utf-8") as f:
			return json.load(f)

	def _normalize(self, text: str) -> str:
		text = text.lower()
		text = self.re_parenthetic.sub(" ", text)
		text = re.sub(r"[\[\]{}]", " ", text)
		text = re.sub(r"\s+", " ", text).strip()
		return text

	def _split_ingredients(self, text: str) -> List[str]:
		parts = [p.strip() for p in self.re_split.split(text) if p and p.strip()]
		return [p[: self.config.max_ingredient_length] for p in parts]

	def _classify(self, ing: str) -> Dict[str, str]:
		normalized = ing.strip()
		evidence: List[str] = []
		category = "Neutral"
		risk_level = "low"

		# E-number detection
		for match in self.re_enumber.findall(normalized):
			e = match.lower().replace(" ", "").replace("-", "")
			evidence.append(f"E-number:{match}")
			if e in self.additives:
				meta = self.additives[e]
				category = "Risky"
				risk_level = meta.get("risk", "medium")
				evidence.append(f"additive:{e}")

		# Known additives by keyword
		for key, meta in self.additives.items():
			aliases = meta.get("aliases", [])
			if key in normalized or any(a in normalized for a in aliases):
				category = "Risky"
				risk_level = meta.get("risk", "medium")
				evidence.append(f"additive:{key}")

		# Added sugars
		for key, meta in self.sugars.items():
			aliases = meta.get("aliases", [])
			if key in normalized or any(a in normalized for a in aliases):
				category = "Risky"
				risk_level = max(risk_level, "medium", key=self._risk_key)  # escalate
				evidence.append(f"added_sugar:{key}")

		# Allergens
		for key, meta in self.allergens.items():
			aliases = meta.get("aliases", [])
			if key in normalized or any(a in normalized for a in aliases):
				category = "Risky"
				risk_level = max(risk_level, meta.get("risk", "high"), key=self._risk_key)
				evidence.append(f"allergen:{key}")

		# Unhealthy oils
		for key, meta in self.oils.items():
			aliases = meta.get("aliases", [])
			if key in normalized or any(a in normalized for a in aliases):
				category = "Risky"
				risk_level = max(risk_level, meta.get("risk", "medium"), key=self._risk_key)
				evidence.append(f"oil:{key}")

		# Heuristic healthy markers
		if category == "Neutral":
			if any(token in normalized for token in ["whole grain", "oat", "quinoa", "brown rice", "lentil", "chickpea", "spinach", "kale", "almond", "walnut"]):
				category = "Healthy"
				risk_level = "low"
				evidence.append("healthy_keyword")

		return {
			"ingredient": ing,
			"normalized": normalized,
			"category": category,
			"risk_level": risk_level,
			"evidence": evidence
		}

	def _risk_key(self, level: str) -> int:
		order = {"low": 0, "medium": 1, "high": 2}
		return order.get(level, 1)

	def analyze(self, ingredient_text: str) -> Dict[str, List[Dict[str, str]]]:
		if not ingredient_text or not ingredient_text.strip():
			return {"ingredients": [], "notes": ["empty_text"]}
		norm = self._normalize(ingredient_text)
		items = self._split_ingredients(norm)
		results = [self._classify(ing) for ing in items]
		return {"ingredients": results, "notes": []}

