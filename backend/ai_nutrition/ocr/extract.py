from __future__ import annotations

import os
import re
from dataclasses import dataclass
from io import BytesIO
from typing import Optional

import cv2
import numpy as np
import pytesseract
from PIL import Image


@dataclass
class OCRConfig:
	language: str = "eng"
	tesseract_cmd: Optional[str] = None  # e.g., "C:\\Program Files\\Tesseract-OCR\\tesseract.exe"
	psm: int = 6  # Assume a block of text
	oem: int = 3  # Default engine


def _setup_tesseract(cfg: OCRConfig) -> None:
	cmd = cfg.tesseract_cmd or os.getenv("TESSERACT_CMD")
	if cmd:
		pytesseract.pytesseract.tesseract_cmd = cmd


def _preprocess(image: Image.Image) -> np.ndarray:
	img = np.array(image.convert("RGB"))
	gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
	# Denoise and enhance contrast
	gray = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)
	gray = cv2.equalizeHist(gray)
	# Adaptive threshold
	th = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 31, 10)
	# Morph open to remove noise
	kernel = np.ones((1, 1), np.uint8)
	th = cv2.morphologyEx(th, cv2.MORPH_OPEN, kernel)
	return th


def _clean_text(text: str) -> str:
	text = text.replace("\n", " ")
	text = re.sub(r"\s+", " ", text)
	return text.strip()


def _extract_product_name(text: str) -> Optional[str]:
	"""
	Try to extract product name from OCR text.
	Looks for common patterns like brand names, product titles, etc.
	"""
	lines = text.split('\n')
	
	# Common patterns for product names
	patterns = [
		r'^([A-Z][A-Za-z\s&]+?)(?:\s+(?:NET|WT|OZ|ML|G|KG|LB|LBS|FL\s*OZ))',  # Product name before weight
		r'^([A-Z][A-Za-z0-9\s&.,-]{3,40})(?:\s+INGREDIENTS)',  # Product name before ingredients
		r'^([A-Z][A-Za-z\s&]{3,40})(?:\s+NUTRITION)',  # Product name before nutrition
	]
	
	# Check first few lines (product name usually at top)
	for line in lines[:5]:
		line = line.strip()
		if len(line) < 3 or len(line) > 60:
			continue
		
		# Skip common label headers
		if any(skip in line.upper() for skip in ['INGREDIENTS', 'NUTRITION', 'FACTS', 'SERVING', 'PER', 'NET WT']):
			continue
		
		# Check if line looks like a product name (starts with capital, reasonable length)
		if re.match(r'^[A-Z][A-Za-z0-9\s&.,-]{3,50}$', line):
			# Additional check: not all caps (likely a header) unless short
			if not (line.isupper() and len(line) > 15):
				return line.strip()
		
		# Try pattern matching
		for pattern in patterns:
			match = re.search(pattern, line, re.IGNORECASE)
			if match:
				name = match.group(1).strip()
				if 3 <= len(name) <= 60:
					return name
	
	return None


def _extract_nutrition_facts(text: str) -> dict:
	"""
	Extract nutrition facts from OCR text using regex patterns.
	Returns a dict with nutrition values.
	"""
	nutrition = {}
	text_lower = text.lower()
	
	# Common nutrition patterns
	patterns = {
		'energy': [
			r'energy[:\s]+(\d+(?:\.\d+)?)\s*(?:kcal|cal)',
			r'calories[:\s]+(\d+(?:\.\d+)?)',
			r'(\d+(?:\.\d+)?)\s*(?:kcal|cal)'
		],
		'fat': [
			r'total\s*fat[:\s]+(\d+(?:\.\d+)?)\s*g',
			r'fat[:\s]+(\d+(?:\.\d+)?)\s*g'
		],
		'saturated_fat': [
			r'saturated\s*fat[:\s]+(\d+(?:\.\d+)?)\s*g',
			r'sat\s*fat[:\s]+(\d+(?:\.\d+)?)\s*g'
		],
		'sugars': [
			r'total\s*sugars?[:\s]+(\d+(?:\.\d+)?)\s*g',
			r'sugars?[:\s]+(\d+(?:\.\d+)?)\s*g'
		],
		'salt': [
			r'salt[:\s]+(\d+(?:\.\d+)?)\s*g',
			r'sodium[:\s]+(\d+(?:\.\d+)?)\s*(?:mg|g)'
		],
		'protein': [
			r'protein[:\s]+(\d+(?:\.\d+)?)\s*g'
		],
		'carbohydrates': [
			r'total\s*carbohydrates?[:\s]+(\d+(?:\.\d+)?)\s*g',
			r'carbs?[:\s]+(\d+(?:\.\d+)?)\s*g'
		]
	}
	
	for key, pattern_list in patterns.items():
		for pattern in pattern_list:
			match = re.search(pattern, text_lower)
			if match:
				try:
					value = float(match.group(1))
					# Convert sodium (mg) to salt (g) if needed
					if key == 'salt' and 'sodium' in pattern and 'mg' in text_lower[match.start():match.end()+10]:
						value = value / 1000  # Convert mg to g
					nutrition[key] = value
					break
				except (ValueError, IndexError):
					continue
	
	return nutrition


def extract_ingredients_text(image_bytes: bytes, cfg: Optional[OCRConfig] = None) -> dict:
	"""
	Run OCR on an ingredient panel photo and return raw and cleaned text.
	"""
	cfg = cfg or OCRConfig()
	_setup_tesseract(cfg)

	image = Image.open(BytesIO(image_bytes))
	pre = _preprocess(image)

	custom = f"--oem {cfg.oem} --psm {cfg.psm}"
	raw = pytesseract.image_to_string(pre, lang=cfg.language, config=custom)
	clean = _clean_text(raw)
	
	# Extract additional information
	product_name = _extract_product_name(raw)
	nutrition_facts = _extract_nutrition_facts(raw)
	
	return {
		"raw_text": raw,
		"clean_text": clean,
		"product_name": product_name,
		"nutrition_facts": nutrition_facts
	}

