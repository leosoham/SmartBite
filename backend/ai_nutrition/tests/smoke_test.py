from ai_nutrition.nlp import IngredientAnalyzer, IngredientAnalysisConfig


def run():
	config = IngredientAnalysisConfig(language="en", aggressiveness="balanced")
	analyzer = IngredientAnalyzer(config)
	text = "Ingredients: sugar, refined palm oil, milk powder, E211 (sodium benzoate), whole grain oats"
	result = analyzer.analyze(text)
	print(result)


if __name__ == "__main__":
	run()

