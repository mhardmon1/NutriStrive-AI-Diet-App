export async function POST(request) {
  try {
    const body = await request.json();
    const { image_url, description } = body;

    if (!image_url && !description) {
      return Response.json({ error: 'Either image_url or description is required' }, { status: 400 });
    }

    const prompt = image_url 
      ? `Analyze this food image and identify the foods shown. For each food item, estimate the portion size and provide nutritional information.`
      : `Analyze this food description: "${description}". Identify the foods mentioned and provide nutritional information.`;

    const messages = [
      {
        role: "system",
        content: "You are a nutrition expert that analyzes food images and descriptions. Return structured data about the foods identified, including nutritional information and portion estimates."
      },
      {
        role: "user", 
        content: image_url ? [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: image_url } }
        ] : prompt
      }
    ];

    const response = await fetch('/integrations/anthropic-claude-sonnet-3-5/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        json_schema: {
          name: "food_analysis",
          schema: {
            type: "object",
            properties: {
              foods: {
                type: "array",
                items: {
                  type: "object", 
                  properties: {
                    name: { type: "string" },
                    estimated_portion_grams: { type: "number" },
                    confidence: { type: "number" },
                    calories: { type: "number" },
                    protein: { type: "number" },
                    carbs: { type: "number" },
                    fat: { type: "number" },
                    fiber: { type: "number" },
                    sugar: { type: "number" },
                    sodium: { type: "number" },
                    preparation_method: { type: "string" },
                    health_score: { type: "number" },
                    notes: { type: "string" }
                  },
                  required: ["name", "estimated_portion_grams", "confidence", "calories", "protein", "carbs", "fat", "fiber", "sugar", "sodium", "preparation_method", "health_score", "notes"],
                  additionalProperties: false
                }
              },
              total_calories: { type: "number" },
              meal_suggestions: {
                type: "array",
                items: { type: "string" }
              }
            },
            required: ["foods", "total_calories", "meal_suggestions"],
            additionalProperties: false
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.statusText}`);
    }

    const result = await response.json();
    const analysisData = JSON.parse(result.choices[0].message.content);

    return Response.json(analysisData);
  } catch (error) {
    console.error('Error analyzing food:', error);
    return Response.json({ error: 'Failed to analyze food' }, { status: 500 });
  }
}