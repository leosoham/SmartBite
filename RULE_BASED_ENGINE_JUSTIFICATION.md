# Rule-Based Engine: Scientific Justification and Methodology

## Executive Summary

This document provides scientific justification for the rule-based scoring engine used in the food product evaluation system. The scoring system employs a deductive approach (starting at 100 points) with penalties based on established nutritional guidelines, public health recommendations, and validated nutrient profiling models.

---

## 1. Scoring System Overview

### 1.1 Methodology
- **Approach**: Deductive scoring system starting at 100 points
- **Unit of Analysis**: Per 100g of product (standardized for comparison)
- **Output**: Score (0-100), Grade (A-D), Category (Good/Worst), and detailed reasons

### 1.2 Core Principles
1. **Banned Ingredients**: Immediate failure (score = 0) for ingredients with known health risks
2. **Nutrient Thresholds**: Based on WHO and public health guidelines
3. **Progressive Penalties**: Higher penalties for nutrients with greater health impact
4. **Additive Assessment**: Progressive penalties based on processing level

---

## 2. Scientific Basis for Penalty Variations

### 2.1 Why Different Penalties?

The variation in penalty points reflects the **relative health impact** of different nutrients based on:
- Epidemiological evidence linking nutrients to disease
- Public health guidelines (WHO, FDA, EFSA)
- Validated nutrient profiling models (Nutri-Score, FSA Model)
- Meta-analyses and systematic reviews

---

## 3. Detailed Rule Justification

### 3.1 Sugar: -20 Points (Highest Penalty)

**Threshold**: >22.5g per 100g

**Scientific Justification**:
1. **WHO Guidelines (2015)**: Recommends <10% of total energy intake from free sugars, ideally <5%
   - For a 2000 kcal diet: <50g/day total, <25g/day ideal
   - Products with >22.5g/100g exceed daily recommendations in small portions

2. **Health Impact Evidence**:
   - **Obesity**: Strong association with excessive sugar consumption (Malik et al., 2013)
   - **Type 2 Diabetes**: Meta-analysis shows 1.1-fold increased risk per serving/day of sugar-sweetened beverages (Imamura et al., 2015)
   - **Dental Caries**: Direct causal relationship established (WHO, 2015)
   - **Cardiovascular Disease**: Association with increased CVD risk (Yang et al., 2014)

3. **Comparison with Established Models**:
   - **Nutri-Score**: Sugar receives highest negative points (up to 10 points)
   - **FSA Model**: Sugar contributes significantly to "A points" (negative points)

**Rationale for -20 Penalty**: Sugar has the strongest and most consistent evidence for negative health impacts across multiple disease categories.

---

### 3.2 Saturated Fat: -15 Points (High Penalty)

**Threshold**: >5g per 100g

**Scientific Justification**:
1. **WHO Guidelines**: Recommends <10% of total energy from saturated fats
   - For a 2000 kcal diet: <22g/day (since fat = 9 kcal/g)
   - Products with >5g/100g contribute significantly to daily limit

2. **Health Impact Evidence**:
   - **Cardiovascular Disease**: Strong evidence linking saturated fat to increased LDL cholesterol and CVD risk (Sacks et al., 2017)
   - **Meta-analysis**: Replacement of saturated fat with polyunsaturated fat reduces CVD events by 19% (Mozaffarian et al., 2010)

3. **Comparison with Established Models**:
   - **Nutri-Score**: Saturated fat receives high negative points (up to 10 points)
   - **FSA Model**: Saturated fat is a key component of negative scoring

**Rationale for -15 Penalty**: High cardiovascular risk, but slightly lower than sugar due to some debate about fat types and context.

---

### 3.3 Total Fat: -15 Points (Moderate-High Penalty)

**Threshold**: >17g per 100g

**Scientific Justification**:
1. **WHO Guidelines**: Recommends 15-30% of total energy from fats
   - For a 2000 kcal diet: 33-67g/day total fat
   - Products with >17g/100g are high-fat items

2. **Health Impact Evidence**:
   - **Energy Density**: High-fat foods are energy-dense, contributing to obesity risk
   - **Context-Dependent**: Some fats (monounsaturated, polyunsaturated) are beneficial
   - **Note**: This rule doesn't distinguish fat types, which is a limitation

3. **Comparison with Established Models**:
   - **Nutri-Score**: Energy (calories) is considered, which correlates with fat content
   - **FSA Model**: Energy density is a key factor

**Rationale for -15 Penalty**: High energy density and obesity risk, but acknowledges that not all fats are harmful.

---

### 3.4 Salt: -10 Points (Moderate Penalty)

**Threshold**: >1.5g per 100g

**Scientific Justification**:
1. **WHO Guidelines (2012)**: Recommends <5g salt per day (<2g sodium)
   - Products with >1.5g/100g contribute significantly to daily limit
   - Many processed foods exceed this threshold

2. **Health Impact Evidence**:
   - **Hypertension**: Strong causal relationship (He & MacGregor, 2009)
   - **Cardiovascular Disease**: Meta-analysis shows 17% reduction in stroke risk with salt reduction (He et al., 2013)
   - **Stomach Cancer**: Association with high salt intake (D'Elia et al., 2012)

3. **Comparison with Established Models**:
   - **Nutri-Score**: Sodium receives moderate negative points (up to 10 points)
   - **FSA Model**: Sodium is included but with moderate weighting

**Rationale for -10 Penalty**: Important health impact, but the effect size per unit is generally considered moderate compared to sugar's broader metabolic impacts.

---

### 3.5 Additives: -5 to -20 Points (Progressive Penalty)

**Thresholds**: 
- 2-3 additives: -5 points
- 4-5 additives: -10 points
- 6+ additives: -20 points

**Scientific Justification**:
1. **Ultra-Processed Foods (NOVA Classification)**:
   - Higher additive count indicates higher processing level
   - Ultra-processed foods associated with obesity, metabolic syndrome (Monteiro et al., 2019)

2. **Health Impact Evidence**:
   - **Hyperactivity in Children**: Some additives (artificial colors) linked to ADHD symptoms (McCann et al., 2007)
   - **Gut Health**: High processing may affect gut microbiota (Zinöcker & Lindseth, 2018)
   - **Cumulative Effects**: Multiple additives may have synergistic effects

3. **Regulatory Context**:
   - **EFSA**: Each additive has Acceptable Daily Intake (ADI), but cumulative effects less studied
   - **FDA**: Generally Recognized as Safe (GRAS) status, but concerns about long-term effects

**Rationale for Progressive Penalties**: 
- Higher additive count = higher processing level = greater health concerns
- Progressive system reflects cumulative risk
- Aligns with NOVA classification system for ultra-processed foods

---

## 4. Threshold Justification

### 4.1 Threshold Selection Criteria

Thresholds are based on:
1. **WHO Dietary Recommendations**: Converted to per-100g equivalents
2. **Public Health Labeling Standards**: EU "high in" thresholds, UK traffic light system
3. **Nutrient Profiling Models**: Nutri-Score and FSA model thresholds
4. **Practical Application**: Thresholds that distinguish between healthy and unhealthy products

### 4.2 Specific Thresholds

| Nutrient | Threshold | Basis |
|----------|-----------|-------|
| Sugar | >22.5g/100g | WHO <10% energy = ~22.5g/100g for typical energy density |
| Saturated Fat | >5g/100g | WHO <10% energy = ~5.5g/100g for typical energy density |
| Total Fat | >17g/100g | ~30% of 2000 kcal diet = 67g/day, high-fat products exceed this |
| Salt | >1.5g/100g | WHO <5g/day, processed foods often exceed 1.5g/100g |

---

## 5. Comparison with Established Models

### 5.1 Nutri-Score (European Front-of-Pack Label)

**Similarities**:
- Uses negative points for sugar, saturated fat, sodium, and energy
- Higher penalties for sugar and saturated fat
- Per-100g basis for comparison

**Differences**:
- Nutri-Score includes positive points for beneficial nutrients (fiber, protein, fruits/vegetables)
- More complex algorithm with multiple thresholds per nutrient
- Validated through multiple studies

**Our Approach**: Simplified version focusing on negative aspects, suitable for quick consumer guidance.

### 5.2 UK Food Standards Agency (FSA) Nutrient Profile Model

**Similarities**:
- Evaluates energy, saturated fat, sugar, and sodium
- Used for regulatory purposes (food marketing to children)
- Per-100g basis

**Differences**:
- FSA model uses point allocation system (A points vs C points)
- More granular thresholds
- Validated for regulatory use

**Our Approach**: Simplified scoring that captures the essence of FSA model for consumer use.

---

## 6. Banned Ingredients List

### 6.1 Scientific Basis

The banned ingredients list includes substances that are:
1. **Banned in some jurisdictions**: Brominated vegetable oil (banned in EU, Japan)
2. **Known carcinogens**: Potassium bromate (IARC Group 2B)
3. **Linked to health issues**: Azodicarbonamide (respiratory issues)
4. **Controversial additives**: Artificial colors, BHA, BHT (potential hyperactivity, carcinogenicity concerns)

### 6.2 Justification for Immediate Failure

Products containing banned ingredients receive score = 0 because:
- These ingredients have known or suspected serious health risks
- Regulatory bodies have restricted or banned their use
- Precautionary principle: When in doubt, err on the side of caution

---

## 7. Limitations and Future Improvements

### 7.1 Current Limitations

1. **No Positive Points**: System doesn't reward beneficial nutrients (fiber, protein, vitamins)
2. **Fat Type Distinction**: Doesn't differentiate between healthy and unhealthy fats
3. **Additive Specificity**: Penalizes by count rather than specific additive types
4. **Energy Density**: Not explicitly considered (though fat content correlates)
5. **Context Dependency**: Doesn't account for product category (e.g., nuts are naturally high in fat)

### 7.2 Recommended Improvements

1. **Align with Nutri-Score**: Incorporate positive points for beneficial nutrients
2. **Fat Differentiation**: Distinguish between saturated, trans, and unsaturated fats
3. **Additive Classification**: Penalize specific harmful additives more heavily
4. **Category-Specific Rules**: Different thresholds for different food categories
5. **Energy Density**: Explicit consideration of calories per 100g

---

## 8. Validation and Testing

### 8.1 Recommended Validation Steps

1. **Compare with Nutri-Score**: Test products scored by both systems
2. **Expert Review**: Have nutritionists review scoring for various products
3. **Consumer Testing**: Validate that scores align with consumer health perceptions
4. **Correlation Analysis**: Compare scores with health outcomes (if data available)

### 8.2 Expected Outcomes

- Products with high sugar/saturated fat should score lower
- Products with banned ingredients should score 0
- Products with minimal processing should score higher
- Scores should correlate with established models (Nutri-Score, FSA)

---

## 9. References and Sources

### 9.1 WHO Guidelines
- WHO (2015). "Guideline: Sugars intake for adults and children"
- WHO (2012). "Guideline: Sodium intake for adults and children"

### 9.2 Scientific Studies
- Malik, V. S., et al. (2013). "Sugar-sweetened beverages and weight gain in children and adults: a systematic review and meta-analysis"
- Imamura, F., et al. (2015). "Consumption of sugar sweetened beverages, artificially sweetened beverages, and fruit juice and incidence of type 2 diabetes"
- Sacks, F. M., et al. (2017). "Dietary Fats and Cardiovascular Disease: A Presidential Advisory from the American Heart Association"
- He, F. J., & MacGregor, G. A. (2009). "A comprehensive review on salt and health and current experience of worldwide salt reduction programmes"
- Monteiro, C. A., et al. (2019). "Ultra-processed foods: what they are and how to identify them"

### 9.3 Established Models
- Nutri-Score: https://en.wikipedia.org/wiki/Nutri-Score
- UK FSA Nutrient Profile Model: Food Standards Agency, UK
- NOVA Food Classification: Monteiro et al., Public Health Nutrition (2016)

### 9.4 Regulatory Sources
- European Food Safety Authority (EFSA): Additive safety assessments
- US Food and Drug Administration (FDA): GRAS substances
- International Agency for Research on Cancer (IARC): Carcinogen classifications

---

## 10. Conclusion

The rule-based scoring engine is based on:
1. **Established public health guidelines** (WHO recommendations)
2. **Validated nutrient profiling models** (Nutri-Score, FSA Model)
3. **Peer-reviewed scientific evidence** (meta-analyses, systematic reviews)
4. **Regulatory standards** (banned ingredients, additive safety)

The variation in penalty points reflects the **relative health impact** of different nutrients, with sugar receiving the highest penalty due to its strong association with multiple health conditions, followed by saturated fat (cardiovascular risk), total fat (energy density), and salt (hypertension risk).

While the system is simplified compared to comprehensive models like Nutri-Score, it provides a practical, evidence-based approach to helping consumers make healthier food choices.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Prepared For**: Rule-Based Engine Justification

