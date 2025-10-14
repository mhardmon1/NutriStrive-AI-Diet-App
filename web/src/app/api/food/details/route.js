import sql from '../../utils/sql';

const USDA_API_KEY = 'DDyHdGZOh4bhbNsyoTiGyITJu4kK0MGaxCg82lIN';
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/food';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const fdcId = searchParams.get('fdcId');

    if (!fdcId) {
      return new Response(
        JSON.stringify({ error: 'fdcId parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cached = await sql`
      SELECT * FROM usda_food_cache
      WHERE fdc_id = ${parseInt(fdcId)}
      LIMIT 1
    `;

    if (cached.length > 0) {
      await sql`
        UPDATE usda_food_cache
        SET search_count = search_count + 1, updated_at = now()
        WHERE fdc_id = ${parseInt(fdcId)}
      `;

      return new Response(
        JSON.stringify({
          food: formatDetailedFood(cached[0]),
          source: 'cache'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const usdaResponse = await fetch(`${USDA_API_URL}/${fdcId}?api_key=${USDA_API_KEY}`);

    if (!usdaResponse.ok) {
      throw new Error(`USDA API error: ${usdaResponse.status}`);
    }

    const usdaData = await usdaResponse.json();

    const formattedFood = {
      fdcId: usdaData.fdcId,
      description: usdaData.description,
      brandName: usdaData.brandName || usdaData.brandOwner || null,
      dataType: usdaData.dataType,
      ingredients: usdaData.ingredients || null,
      servingSize: usdaData.servingSize || null,
      servingSizeUnit: usdaData.servingSizeUnit || 'g',
      nutrients: extractDetailedNutrients(usdaData.foodNutrients),
      foodPortions: usdaData.foodPortions || []
    };

    await cacheDetailedFood(formattedFood);

    return new Response(
      JSON.stringify({
        food: formattedFood,
        source: 'usda'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Food details error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to get food details', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function extractDetailedNutrients(foodNutrients) {
  const nutrients = {};

  if (!foodNutrients) return nutrients;

  foodNutrients.forEach(nutrient => {
    const nutrientName = nutrient.nutrient?.name || nutrient.nutrientName;
    const value = nutrient.amount || nutrient.value || 0;
    const unit = nutrient.nutrient?.unitName || nutrient.unitName || 'g';

    nutrients[nutrientName] = {
      value: value,
      unit: unit
    };
  });

  return nutrients;
}

async function cacheDetailedFood(food) {
  try {
    const existing = await sql`
      SELECT id FROM usda_food_cache WHERE fdc_id = ${food.fdcId}
    `;

    const mainNutrients = {
      calories: food.nutrients['Energy']?.value || 0,
      protein: food.nutrients['Protein']?.value || 0,
      carbs: food.nutrients['Carbohydrate, by difference']?.value || 0,
      fat: food.nutrients['Total lipid (fat)']?.value || 0,
      fiber: food.nutrients['Fiber, total dietary']?.value || 0,
      sugar: food.nutrients['Sugars, total including NLEA']?.value || 0,
      sodium: food.nutrients['Sodium, Na']?.value || 0
    };

    if (existing.length === 0) {
      await sql`
        INSERT INTO usda_food_cache (
          fdc_id, food_name, brand_name, data_type, description,
          ingredients, serving_size, serving_size_unit,
          calories_per_100g, protein_per_100g, carbs_per_100g,
          fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g,
          raw_data, search_count
        ) VALUES (
          ${food.fdcId},
          ${food.description},
          ${food.brandName},
          ${food.dataType},
          ${food.description},
          ${food.ingredients},
          ${food.servingSize},
          ${food.servingSizeUnit},
          ${mainNutrients.calories},
          ${mainNutrients.protein},
          ${mainNutrients.carbs},
          ${mainNutrients.fat},
          ${mainNutrients.fiber},
          ${mainNutrients.sugar},
          ${mainNutrients.sodium},
          ${JSON.stringify(food)},
          1
        )
      `;
    }
  } catch (error) {
    console.error('Failed to cache detailed food:', error);
  }
}

function formatDetailedFood(cachedFood) {
  const rawData = cachedFood.raw_data || {};

  return {
    fdcId: cachedFood.fdc_id,
    description: cachedFood.food_name,
    brandName: cachedFood.brand_name,
    dataType: cachedFood.data_type,
    ingredients: cachedFood.ingredients,
    servingSize: cachedFood.serving_size,
    servingSizeUnit: cachedFood.serving_size_unit,
    nutrients: {
      'Energy': {
        value: parseFloat(cachedFood.calories_per_100g) || 0,
        unit: 'kcal'
      },
      'Protein': {
        value: parseFloat(cachedFood.protein_per_100g) || 0,
        unit: 'g'
      },
      'Carbohydrate, by difference': {
        value: parseFloat(cachedFood.carbs_per_100g) || 0,
        unit: 'g'
      },
      'Total lipid (fat)': {
        value: parseFloat(cachedFood.fat_per_100g) || 0,
        unit: 'g'
      },
      'Fiber, total dietary': {
        value: parseFloat(cachedFood.fiber_per_100g) || 0,
        unit: 'g'
      },
      'Sugars, total including NLEA': {
        value: parseFloat(cachedFood.sugar_per_100g) || 0,
        unit: 'g'
      },
      'Sodium, Na': {
        value: parseFloat(cachedFood.sodium_per_100g) || 0,
        unit: 'mg'
      }
    },
    foodPortions: rawData.foodPortions || []
  };
}
