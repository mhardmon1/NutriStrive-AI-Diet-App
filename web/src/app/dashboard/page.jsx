import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client-integrations/shadcn-ui";
import { Button } from "@/client-integrations/shadcn-ui";
import { Progress } from "@/client-integrations/shadcn-ui";
import { Separator } from "@/client-integrations/shadcn-ui";
import { Badge } from "@/client-integrations/shadcn-ui";
import { 
  Activity, 
  Droplet, 
  Flame, 
  Target, 
  TrendingUp, 
  Plus,
  Camera,
  Search,
  Utensils
} from "lucide-react";

function DashboardPage() {
  const { data: user, loading: userLoading } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch dashboard data
  const { data: dashboardData, isLoading, refetch } = useQuery({
    queryKey: ['dashboard', selectedDate],
    queryFn: async () => {
      const [nutritionRes, hydrationRes, workoutsRes] = await Promise.all([
        fetch(`/api/nutrition/daily-summary?date=${selectedDate}`),
        fetch(`/api/hydration?date=${selectedDate}`),
        fetch(`/api/workouts?date=${selectedDate}`)
      ]);

      const [nutrition, hydration, workouts] = await Promise.all([
        nutritionRes.json(),
        hydrationRes.json(), 
        workoutsRes.json()
      ]);

      return { nutrition, hydration, workouts };
    },
    enabled: !!user,
  });

  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const nutrition = dashboardData?.nutrition || {};
  const hydration = dashboardData?.hydration || {};
  const workouts = dashboardData?.workouts || [];

  const caloriesProgress = nutrition.targets?.target_calories 
    ? (nutrition.totals?.total_calories || 0) / nutrition.targets.target_calories * 100
    : 0;

  const hydrationProgress = hydration.target 
    ? (hydration.total || 0) / hydration.target * 100
    : 0;

  const completedWorkouts = workouts.filter(w => w.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Welcome back, {user.name}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here's your nutrition and performance overview
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Camera className="w-4 h-4 mr-2" />
                Log Meal
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
            </div>
          </div>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Calories Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(nutrition.totals?.total_calories || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                of {Math.round(nutrition.targets?.target_calories || 2500)} target
              </p>
              <Progress value={caloriesProgress} className="mt-2" />
            </CardContent>
          </Card>

          {/* Protein Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Protein</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(nutrition.totals?.total_protein || 0)}g
              </div>
              <p className="text-xs text-muted-foreground">
                of {Math.round(nutrition.targets?.target_protein || 150)}g target
              </p>
              <Progress 
                value={nutrition.targets?.target_protein 
                  ? (nutrition.totals?.total_protein || 0) / nutrition.targets.target_protein * 100
                  : 0
                } 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          {/* Hydration Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hydration</CardTitle>
              <Droplet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(hydration.total || 0)}ml
              </div>
              <p className="text-xs text-muted-foreground">
                of {Math.round(hydration.target || 2500)}ml target
              </p>
              <Progress value={hydrationProgress} className="mt-2" />
            </CardContent>
          </Card>

          {/* Workouts Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workouts</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedWorkouts}/{workouts.length}
              </div>
              <p className="text-xs text-muted-foreground">
                completed today
              </p>
              <Progress 
                value={workouts.length > 0 ? (completedWorkouts / workouts.length) * 100 : 0} 
                className="mt-2" 
              />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Meals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Utensils className="w-5 h-5 mr-2" />
                Recent Meals
              </CardTitle>
              <CardDescription>
                Your latest nutrition entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {nutrition.meals && nutrition.meals.length > 0 ? (
                <div className="space-y-4">
                  {nutrition.meals.slice(0, 3).map((meal, index) => (
                    <div key={meal.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium capitalize">{meal.meal_type}</p>
                        <p className="text-sm text-gray-600">
                          {Math.round(meal.total_calories || 0)} calories
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {new Date(meal.logged_at).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No meals logged today</p>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Log First Meal
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nutrition Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Nutrition Score
              </CardTitle>
              <CardDescription>
                AI-powered nutrition analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {Math.round(nutrition.dietScore?.overall_score || 65)}%
                </div>
                <p className="text-gray-600 mb-4">Overall nutrition quality</p>
                
                {nutrition.dietScore && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Macro Balance</span>
                      <span>{Math.round(nutrition.dietScore.macro_balance_score || 0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Food Quality</span>
                      <span>{Math.round(nutrition.dietScore.food_quality_score || 0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Meal Timing</span>
                      <span>{Math.round(nutrition.dietScore.meal_timing_score || 0)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Camera className="w-6 h-6 mb-2" />
              <span className="text-sm">Scan Food</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Search className="w-6 h-6 mb-2" />
              <span className="text-sm">Search Food</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Droplet className="w-6 h-6 mb-2" />
              <span className="text-sm">Log Water</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Activity className="w-6 h-6 mb-2" />
              <span className="text-sm">Add Workout</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;