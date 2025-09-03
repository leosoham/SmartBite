// Product info page functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeProductInfo();
});

// Back button functionality
function goBackToHomepage() {
    window.location.href = '/home';
}

// Initialize: read barcode and fetch from Open Food Facts, fallback to sample
async function initializeProductInfo() {
    const urlParams = new URLSearchParams(window.location.search);
    const barcode = urlParams.get('barcode');
    console.log(`here is the obtained code from the params ${barcode}`)

    if (!barcode) {
        // No barcode param; keep graceful sample for now
        const productData = getSampleProduct('3948764012273');
        updateProductDisplay(productData);
        return;
    }

    // Show the scanned barcode immediately while loading
    try {
        document.getElementById('productId').textContent = barcode;
        document.getElementById('productName').textContent = 'Loading…';
    } catch (_) {}

    try {
        // Try OFF v2, then v0, then UPC-A -> EAN-13 fallback
        let offData = await fetchOpenFoodFacts(barcode, 'v2');
        if (!offData) offData = await fetchOpenFoodFacts(barcode, 'v0');
        if (!offData && barcode.length === 12) {
            const eanCandidate = `0${barcode}`;
            offData = await fetchOpenFoodFacts(eanCandidate, 'v2') || await fetchOpenFoodFacts(eanCandidate, 'v0');
        }

        if (offData) return updateProductDisplay(offData);

        // If still not found, show explicit not-found with scanned barcode
        updateProductDisplay({
            name: 'Product not found',
            id: barcode,
            rating: 'AVERAGE',
            ratingNote: 'Nutrition info missing for this product.',
            nutrition: { 'Nutrition': 'N/A' }
        });
    } catch (e) {
        console.error('Error loading product from OFF:', e);
        updateProductDisplay({
            name: 'Error loading product',
            id: barcode,
            rating: 'AVERAGE',
            ratingNote: 'Not enough data to calculate rating.',
            nutrition: { 'Nutrition': 'N/A' }
        });
    }
}

// Map Open Food Facts response to UI model
async function fetchOpenFoodFacts(barcode, version) {
    const base = version === 'v2' ? 'https://world.openfoodfacts.org/api/v2' : 'https://world.openfoodfacts.org/api/v0';
    const resp = await fetch(`${base}/product/${barcode}.json`);
    const json = await resp.json();
    const product = json.product || (json.products && json.products[0]);
    if (!product) return null;

    const p = product;
    const n = p.nutriments || {};
    const servingSize = p.serving_size || null;

    console.log('=== RAW OPEN FOOD FACTS DATA ===');
    console.log('Product:', p.product_name);
    console.log('Serving size:', servingSize);
    console.log('All nutriments:', n);

    // Helpers for safe reads
    const numberOrNull = (value) => {
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return Number.isFinite(num) ? num : null;
    };

    // Extract and convert ALL possible nutrition values
    const nutritionData = {
        // Energy
        energy: {
            per100g: numberOrNull(n['energy-kcal_100g']) || numberOrNull(n['energy_100g']),
            perServing: numberOrNull(n['energy-kcal_serving']) || numberOrNull(n['energy_serving']),
            base: numberOrNull(n['energy-kcal']) || numberOrNull(n['energy'])
        },
        // Fat
        fat: {
            per100g: numberOrNull(n['fat_100g']),
            perServing: numberOrNull(n['fat_serving']),
            base: numberOrNull(n['fat'])
        },
        // Saturated fat
        satFat: {
            per100g: numberOrNull(n['saturated-fat_100g']),
            perServing: numberOrNull(n['saturated-fat_serving']),
            base: numberOrNull(n['saturated-fat'])
        },
        // Sugars
        sugars: {
            per100g: numberOrNull(n['sugars_100g']),
            perServing: numberOrNull(n['sugars_serving']),
            base: numberOrNull(n['sugars'])
        },
        // Salt
        salt: {
            per100g: numberOrNull(n['salt_100g']),
            perServing: numberOrNull(n['salt_serving']),
            base: numberOrNull(n['salt'])
        },
        // Protein
        protein: {
            per100g: numberOrNull(n['proteins_100g']),
            perServing: numberOrNull(n['proteins_serving']),
            base: numberOrNull(n['proteins'])
        },
        // Fiber
        fiber: {
            per100g: numberOrNull(n['fiber_100g']),
            perServing: numberOrNull(n['fiber_serving']),
            base: numberOrNull(n['fiber'])
        }
    };

    console.log('Extracted nutrition data:', nutritionData);

    // Parse serving size
    const parseServingSize = (size) => {
        if (!size) return null;
        const m = String(size).match(/([\d.]+)\s*(g|ml)/i);
        if (!m) return null;
        return parseFloat(m[1]);
    };
    const servingSizeG = parseServingSize(servingSize);
    console.log('Parsed serving size (g):', servingSizeG);

    // Convert all values to per 100g
    const per100gValues = {};
    Object.entries(nutritionData).forEach(([key, data]) => {
        // Priority: per100g > converted from serving > base field
        let per100g = data.per100g;
        
        if (per100g == null && data.perServing != null && servingSizeG != null) {
            per100g = (data.perServing / servingSizeG) * 100;
            console.log(`Converted ${key}: ${data.perServing} per ${servingSizeG}g serving = ${per100g.toFixed(2)} per 100g`);
        }
        
        if (per100g == null) {
            per100g = data.base;
            if (per100g != null) {
                console.log(`Using base field for ${key}: ${per100g}`);
            }
        }
        
        per100gValues[key] = per100g;
    });

    console.log('Final per 100g values:', per100gValues);

    // Build nutrition display
    const nutrition = {};
    if (per100gValues.energy != null) nutrition['Energy'] = `${per100gValues.energy.toFixed(0)} kcal`;
    if (per100gValues.fat != null) nutrition['Total Fats'] = `${per100gValues.fat.toFixed(1)} g / 100g`;
    if (per100gValues.satFat != null) nutrition['Saturated Fat'] = `${per100gValues.satFat.toFixed(1)} g / 100g`;
    if (per100gValues.sugars != null) nutrition['Total Sugars'] = `${per100gValues.sugars.toFixed(1)} g / 100g`;
    if (per100gValues.salt != null) nutrition['Salt'] = `${per100gValues.salt.toFixed(3)} g / 100g`;
    if (per100gValues.protein != null) nutrition['Protein'] = `${per100gValues.protein.toFixed(1)} g / 100g`;
    if (per100gValues.fiber != null) nutrition['Fiber'] = `${per100gValues.fiber.toFixed(2)} g / 100g`;

    // Convert salt to sodium (mg) for display
    if (per100gValues.salt != null) {
        const sodiumMg = Math.round(per100gValues.salt * 1000);
        nutrition['Sodium'] = `${sodiumMg} mg / 100g`;
    }

    if (Object.keys(nutrition).length === 0) {
        nutrition['Nutrition'] = 'Nutrition info not available for this product.';
    }

    // Detailed rule-based scoring (FoodDetector rules)
    let ratingNote = undefined;
    let rating = 'AVERAGE';
    const ingredientsText = p.ingredients_text || '';
    const additivesTags = Array.isArray(p.additives_tags) ? p.additives_tags : [];
    
    if (per100gValues.fat != null || per100gValues.satFat != null || per100gValues.sugars != null || per100gValues.salt != null) {
        const detailed = computeDetailedRating({
            fat: per100gValues.fat,
            satFat: per100gValues.satFat,
            sugar: per100gValues.sugars,
            salt: per100gValues.salt,
            ingredientsText,
            additivesTags
        });
        rating = detailed.categoryToUi;
        ratingNote = detailed.note;
    } else {
        ratingNote = 'Not enough data to calculate rating';
    }

    return {
        name: p.product_name || p.generic_name || 'Unknown Product',
        id: p.code || barcode,
        rating,
        ratingNote,
        nutrition
    };
}

// REMOVED: Old nutrition display and rating functions - replaced with new implementation above

// FoodDetector-inspired detailed scoring
function computeDetailedRating({ fat, satFat, sugar, salt, ingredientsText, additivesTags }) {
    const toNum = (v) => (typeof v === 'string' ? parseFloat(v) : v);
    fat = toNum(fat); satFat = toNum(satFat); sugar = toNum(sugar); salt = toNum(salt);

    const BANNED_INGREDIENTS = [
        'brominated vegetable oil', 'potassium bromate', 'azodicarbonamide',
        'artificial sweetener cyclamate', 'red 2g', 'e123', 'butylated hydroxyanisole',
        'bht', 'propylene glycol', 'refined palm oil'
    ];

    const reasons = [];
    let score = 100;

    // Banned ingredients immediate worst
    const lowerIng = (ingredientsText || '').toLowerCase();
    const bannedFound = BANNED_INGREDIENTS.filter(b => lowerIng.includes(b));
    if (bannedFound.length > 0) {
        return {
            score: 0,
            grade: 'D',
            category: 'Worst',
            categoryToUi: 'WORST',
            note: `Contains banned ingredient(s): ${bannedFound.join(', ')}`,
            reasons: [`Contains banned ingredient(s): ${bannedFound.join(', ')}`]
        };
    }

    // Missing values handling
    if ([fat, satFat, sugar, salt].some(v => v == null || Number.isNaN(v))) {
        return {
            score: 'N/A', grade: 'N/A', category: 'Data Insufficient', categoryToUi: 'AVERAGE',
            note: 'Data insufficient for nutrition analysis', reasons: ['Nutritional data is insufficient']
        };
    }

    // Rules
    if (fat > 17) { reasons.push('High total fat content'); score -= 15; }
    else if (fat < 3) { reasons.push('Low total fat content (Good)'); }

    if (satFat > 5) { reasons.push('High saturated fat content'); score -= 15; }
    else if (satFat < 1.5) { reasons.push('Low saturated fat (Good)'); }

    if (sugar > 22.5) { reasons.push('High sugar content'); score -= 20; }
    else if (sugar < 5) { reasons.push('Low sugar content (Good)'); }

    if (salt > 1.5) { reasons.push('High salt content'); score -= 10; }
    else if (salt < 0.3) { reasons.push('Low salt content (Good)'); }

    // Additives penalties
    const additivesCount = Array.isArray(additivesTags) ? additivesTags.length : 0;
    if (additivesCount >= 6) { reasons.push('Contains many additives'); score -= 20; }
    else if (additivesCount >= 4) { reasons.push('Contains several additives'); score -= 10; }
    else if (additivesCount >= 2) { reasons.push('Contains multiple additives'); score -= 5; }

    // Grade mapping
    let grade, category;
    if (score >= 80) { grade = 'A'; category = 'Good'; }
    else if (score >= 60) { grade = 'B'; category = 'Average'; }
    else if (score >= 40) { grade = 'C'; category = 'Bad'; }
    else { grade = 'D'; category = 'Worst'; }

    const categoryToUi = category === 'Good' ? 'GOOD' : category === 'Average' ? 'AVERAGE' : category === 'Bad' ? 'BAD' : 'WORST';
    const note = reasons.length ? reasons.join(' • ') : 'No specific health issues detected';
    return { score, grade, category, categoryToUi, note, reasons };
}

// REMOVED: Old simple rating function - replaced with detailed FoodDetector rules

// Sample fallback
function getSampleProduct(code) {
    const sampleProducts = {
        '3948764012273': {
            name: 'Coca Cola',
            id: '3948764012273',
            rating: 'BAD',
            nutrition: {
                'Energy': '44.0 kcal',
                'Total Sugars': '10.6 g',
                'Added Sugars': '10.6 g',
                'Sodium': '8.5 mg',
                'Total Fats': '0.0 g',
                'Carbohydrates': '10.9 g',
                'Protein': '0.0 g'
            }
        }
    };
    return sampleProducts[code] || sampleProducts['3948764012273'];
}

// Update product display
function updateProductDisplay(productData) {
    console.log('Updating UI with product data:', productData);
    
    try {
        // Update product name and ID
        document.getElementById('productName').textContent = productData.name;
        document.getElementById('productId').textContent = productData.id;
        
        // Update rating box
        updateRatingBox(productData.rating, productData.ratingNote);
        
        // Update nutrition facts
        updateNutritionFacts(productData.nutrition);
        
        console.log('UI update completed successfully');
    } catch (error) {
        console.error('Error updating UI:', error);
    }
}
// Update rating box based on rating - UPDATED
function updateRatingBox(rating, ratingNote) {
    const ratingBox = document.getElementById('ratingBox');
    const ratingText = document.getElementById('ratingText');
    const ratingDescription = document.getElementById('ratingDescription');
    
    // Remove all rating classes
    ratingBox.className = 'rating-box';
    
    // Add appropriate class and content based on rating
    switch(rating.toLowerCase()) {
        case 'good':
            ratingBox.classList.add('good');
            ratingText.textContent = 'GOOD'; // Uppercase
            ratingDescription.innerHTML = ratingNote ? 
                `Good to go!<br><span style="font-size: 12px; opacity: 0.8;">${ratingNote}</span>` : 
                'Good to go!<br>Enjoy without worry';
            break;
            
        case 'average':
            ratingBox.classList.add('average');
            ratingText.textContent = 'AVERAGE'; // Uppercase
            ratingDescription.innerHTML = ratingNote ? 
                `Okay Sometimes, but not everyday<br><span style="font-size: 12px; opacity: 0.8;">${ratingNote}</span>` : 
                'Okay Sometimes, but not<br>everyday';
            break;
            
        case 'bad':
            ratingBox.classList.add('bad');
            ratingText.textContent = 'BAD'; // Already uppercase
            ratingDescription.innerHTML = ratingNote ? 
                `High in unhealthy ingredients<br><span style="font-size: 12px; opacity: 0.8;">${ratingNote}</span>` : 
                'High in unhealthy ingredients<br>- Avoid regular use';
            break;
            
        case 'worst':
            ratingBox.classList.add('worst');
            ratingText.textContent = 'WORST'; // Uppercase
            ratingDescription.innerHTML = ratingNote ? 
                `Strongly avoid this product<br><span style="font-size: 12px; opacity: 8;">${ratingNote}</span>` : 
                'Strongly avoid this product';
            break;
            
        default:
            ratingBox.classList.add('bad');
            ratingText.textContent = 'BAD';
            ratingDescription.innerHTML = ratingNote ? 
                `High in unhealthy ingredients<br><span style="font-size: 12px; opacity: 0.8;">${ratingNote}</span>` : 
                'High in unhealthy ingredients<br>- Avoid regular use';
    }
}

// Update nutrition facts
function updateNutritionFacts(nutritionData) {
    const nutritionList = document.getElementById('nutritionList');
    nutritionList.innerHTML = '';
    
    // Create nutrition items
    Object.entries(nutritionData).forEach(([nutrient, value]) => {
        const nutritionItem = document.createElement('div');
        nutritionItem.className = 'nutrition-item';
        
        nutritionItem.innerHTML = `
            <span class="nutrient-name">${nutrient}</span>
            <span class="nutrient-value">${value}</span>
        `;
        
        nutritionList.appendChild(nutritionItem);
    });
}

// REMOVED: Old unused function
