import sql from '../../utils/sql';

const USDA_API_KEY = 'DDyHdGZOh4bhbNsyoTiGyITJu4kK0MGaxCg82lIN';
const USDA_API_URL = 'https://api.nal.usda.gov/fdc/v1/foods/search';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const pageNumber = parseInt(searchParams.get('pageNumber')) || 1;
    const pageSize = parseInt(searchParams.get('pageSize')) || 25;
    const dataType = searchParams.get('dataType') || null;

    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cachedResults = await sql`
      SELECT * FROM usda_food_cache
      WHERE food_name ILIKE ${`%${query}%`}
      ORDER BY search_count DESC
      LIMIT ${pageSize}
      OFFSET ${(pageNumber - 1) * pageSize}
    `;

    if (cachedResults.length >= 5) {
      await Promise.all(
        cachedResults.map(food =>
          sql`UPDATE usda_food_cache SET search_count = search_count + 1 WHERE id = ${food.id}`
        )
      );

      return new Response(
        JSON.stringify({
          foods: cachedResults.map(formatCachedFood),
          totalHits: cachedResults.length,
          currentPage: pageNumber,
          totalPages: Math.ceil(cachedResults.length / pageSize),
          source: 'cache'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const usdaRequestBody = {
      query: query,
      pageNumber: pageNumber,
      pageSize: pageSize,
      sortBy: 'dataType.keyword',
      sortOrder: 'asc'
    };

    if (dataType) {
      usdaRequestBody.dataType = [dataType];
    }

    const usdaResponse = await fetch(`${USDA_API_URL}?api_key=${USDA_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(usdaRequestBody)
    });

    if (!usdaResponse.ok) {
      throw new Error(`USDA API error: ${usdaResponse.status}`);
    }

    const usdaData = await usdaResponse.json();

    const formattedFoods = usdaData.foods.map(food => ({
      fdcId: food.fdcId,
      description: food.description,
      brandName: food.brandName || food.brandOwner || null,
      dataType: food.dataType,
      ingredients: food.ingredients || null,
      servingSize: food.servingSize || null,
      servingSizeUnit: food.servingSizeUnit || 'g',
      nutrients: extractNutrients(food.foodNutrients)
    }));

    await cacheUSDAFoods(formattedFoods);

    return new Response(
      JSON.stringify({
        foods: formattedFoods,
        totalHits: usdaData.totalHits,
        currentPage: usdaData.currentPage,
        totalPages: usdaData.totalPages,
        source: 'usda'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Food search error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to search foods', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

function extractNutrients(foodNutrients) {
  const nutrients = {};
  const nutrientMap = {
    'Energy': 'calories',
    'Protein': 'protein',
    'Carbohydrate, by difference': 'carbs',
    'Total lipid (fat)': 'fat',
    'Fiber, total dietary': 'fiber',
    'Sugars, total including NLEA': 'sugar',
    'Sodium, Na': 'sodium'
  };

  if (!foodNutrients) return nutrients;

  foodNutrients.forEach(nutrient => {
    const nutrientName = nutrient.nutrientName;
    const mappedName = nutrientMap[nutrientName];

    if (mappedName) {
      nutrients[mappedName] = nutrient.value || 0;
    }
  });

  return nutrients;
}

async function cacheUSDAFoods(foods) {
  const cachePromises = foods.map(async (food) => {
    try {
      const existing = await sql`
        SELECT id FROM usda_food_cache WHERE fdc_id = ${food.fdcId}
      `;

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
            ${food.nutrients.calories || 0},
            ${food.nutrients.protein || 0},
            ${food.nutrients.carbs || 0},
            ${food.nutrients.fat || 0},
            ${food.nutrients.fiber || 0},
            ${food.nutrients.sugar || 0},
            ${food.nutrients.sodium || 0},
            ${JSON.stringify(food)},
            1
          )
        `;
      } else {
        await sql`
          UPDATE usda_food_cache
          SET search_count = search_count + 1, updated_at = now()
          WHERE fdc_id = ${food.fdcId}
        `;
      }
    } catch (error) {
      console.error(`Failed to cache food ${food.fdcId}:`, error);
    }
  });

  await Promise.all(cachePromises);
}

function formatCachedFood(cachedFood) {
  return {
    fdcId: cachedFood.fdc_id,
    description: cachedFood.food_name,
    brandName: cachedFood.brand_name,
    dataType: cachedFood.data_type,
    ingredients: cachedFood.ingredients,
    servingSize: cachedFood.serving_size,
    servingSizeUnit: cachedFood.serving_size_unit,
    nutrients: {
      calories: parseFloat(cachedFood.calories_per_100g) || 0,
      protein: parseFloat(cachedFood.protein_per_100g) || 0,
      carbs: parseFloat(cachedFood.carbs_per_100g) || 0,
      fat: parseFloat(cachedFood.fat_per_100g) || 0,
      fiber: parseFloat(cachedFood.fiber_per_100g) || 0,
      sugar: parseFloat(cachedFood.sugar_per_100g) || 0,
      sodium: parseFloat(cachedFood.sodium_per_100g) || 0
    }
  };
}
