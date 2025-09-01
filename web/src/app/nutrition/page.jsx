import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client-integrations/shadcn-ui";
import { Button } from "@/client-integrations/shadcn-ui";
import { Progress } from "@/client-integrations/shadcn-ui";
import { Badge } from "@/client-integrations/shadcn-ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/client-integrations/shadcn-ui";
import { 
  Flame, 
  Target, 
  TrendingUp, 
  Plus,
  Clock,
  Edit3,
  Trash2,
  Camera,
  Search
} from "lucide-react";

function NutritionPage() {
  const { data: user, loading: userLoading } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch nutrition data
  const { data: nutritionData, isLoading, refetch } = useQuery({
    queryKey: ['nutrition', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/nutrition/daily-summary?date=${selectedDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch nutrition data');
      }
      return response.json();
    },
    enabled: !!user,
  });

  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading nutrition data...</p>
        </div>
      </div>
    );
  }

  const nutrition = nutritionData || {};
  const meals = nutrition.meals || [];
  const totals = nutrition.totals || {};
  const targets = nutrition.targets || {};

  const caloriesProgress = targets.target_calories 
    ? (totals.total_calories || 0) / targets.target_calories * 100
    : 0;

  const proteinProgress = targets.target_protein 
    ? (totals.total_protein || 0) / targets.target_protein * 100
    : 0;

  const carbsProgress = targets.target_carbs 
    ? (totals.total_carbs || 0) / targets.target_carbs * 100
    : 0;

  const fatProgress = targets.target_fat 
    ? (totals.total_fat || 0) / targets.target_fat * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Nutrition Tracking</h1>
              <p className="text-gray-600 mt-1">
                Monitor your daily nutrition intake and goals
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Scan Food
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Meal
              </Button>
            </div>
          </div>
        </div>

        {/* Macronutrient Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(totals.total_calories || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                of {Math.round(targets.target_calories || 2500)} target
              </p>
              <Progress value={caloriesProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protein</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(totals.total_protein || 0)}g
              </div>
              <p className="text-xs text-muted-foreground">
                of {Math.round(targets.target_protein || 150)}g target
              </p>
              <Progress value={proteinProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carbs</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(totals.total_carbs || 0)}g
              </div>
              <p className="text-xs text-muted-foreground">
                of {Math.round(targets.target_carbs || 300)}g target
              </p>
              <Progress value={carbsProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fat</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(totals.total_fat || 0)}g
              </div>
              <p className="text-xs text-muted-foreground">
                of {Math.round(targets.target_fat || 83)}g target
              </p>
              <Progress value={fatProgress} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Nutrition Score Card */}
        {nutrition.dietScore && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                Daily Nutrition Score
              </CardTitle>
              <CardDescription>
                AI-powered analysis of your nutrition quality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {Math.round(nutrition.dietScore.overall_score || 0)}%
                  </div>
                  <p className="text-sm text-gray-600">Overall Score</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{Math.round(nutrition.dietScore.macro_balance_score || 0)}%</div>
                    <div className="text-gray-600">Macro Balance</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{Math.round(nutrition.dietScore.food_quality_score || 0)}%</div>
                    <div className="text-gray-600">Food Quality</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{Math.round(nutrition.dietScore.micronutrient_score || 0)}%</div>
                    <div className="text-gray-600">Micronutrients</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{Math.round(nutrition.dietScore.meal_timing_score || 0)}%</div>
                    <div className="text-gray-600">Meal Timing</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Meals List */}
        <Card>
          <CardHeader>
            <CardTitle>Food Diary</CardTitle>
            <CardDescription>
              Your meals for {new Date(selectedDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {meals.length > 0 ? (
              <div className="space-y-4">
                {meals.map((meal, index) => (
                  <div key={meal.id || index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="capitalize">
                          {meal.meal_type}
                        </Badge>
                        <span className="font-medium">{meal.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {Math.round(meal.total_calories || 0)} cal
                        </span>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>Protein: {Math.round(meal.total_protein || 0)}g</div>
                      <div>Carbs: {Math.round(meal.total_carbs || 0)}g</div>
                      <div>Fat: {Math.round(meal.total_fat || 0)}g</div>
                    </div>

                    {meal.foods && meal.foods.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="space-y-1">
                          {meal.foods.map((food, foodIndex) => (
                            <div key={foodIndex} className="flex justify-between text-sm">
                              <span>{food.food_name}</span>
                              <span className="text-gray-500">{food.quantity_grams}g</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(meal.logged_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No meals logged yet</h3>
                <p className="text-gray-600 mb-6">
                  Start tracking your nutrition by logging your first meal
                </p>
                <div className="flex justify-center space-x-3">
                  <Button>
                    <Camera className="w-4 h-4 mr-2" />
                    Scan Food
                  </Button>
                  <Button variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Search Food
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default NutritionPage;