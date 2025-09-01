import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client-integrations/shadcn-ui";
import { Button } from "@/client-integrations/shadcn-ui";
import { Progress } from "@/client-integrations/shadcn-ui";
import { Badge } from "@/client-integrations/shadcn-ui";
import { 
  Activity, 
  Clock, 
  Flame, 
  Target, 
  Plus,
  Play,
  CheckCircle,
  Edit3
} from "lucide-react";

function WorkoutsPage() {
  const { data: user, loading: userLoading } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch workouts data
  const { data: workouts, isLoading, refetch } = useQuery({
    queryKey: ['workouts', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/workouts?date=${selectedDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }
      return response.json();
    },
    enabled: !!user,
  });

  const toggleWorkoutCompletion = async (workoutId, completed) => {
    try {
      const response = await fetch('/api/workouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: workoutId,
          completed: !completed,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update workout');
      }

      refetch();
    } catch (error) {
      console.error('Error updating workout:', error);
    }
  };

  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading workouts...</p>
        </div>
      </div>
    );
  }

  const completedWorkouts = workouts?.filter(w => w.completed).length || 0;
  const totalWorkouts = workouts?.length || 0;
  const completionRate = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Workouts</h1>
              <p className="text-gray-600 mt-1">
                Track your training sessions and progress
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Workout
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Today's Progress
            </CardTitle>
            <CardDescription>
              Your workout completion for {new Date(selectedDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {completedWorkouts}/{totalWorkouts}
                </div>
                <p className="text-sm text-gray-600">Workouts completed</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-800">
                  {Math.round(completionRate)}%
                </div>
                <p className="text-sm text-gray-600">Completion rate</p>
              </div>
            </div>
            <Progress value={completionRate} className="mb-2" />
            <p className="text-xs text-gray-500">
              {completionRate >= 100 ? "Great job! All workouts completed!" : 
               completionRate >= 50 ? "You're doing well! Keep it up!" :
               "Let's get moving! Start your next workout."}
            </p>
          </CardContent>
        </Card>

        {/* Workouts List */}
        <Card>
          <CardHeader>
            <CardTitle>Workout Schedule</CardTitle>
            <CardDescription>
              Your planned workouts for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workouts && workouts.length > 0 ? (
              <div className="space-y-4">
                {workouts.map((workout) => (
                  <div 
                    key={workout.id} 
                    className={`border rounded-lg p-4 transition-all ${
                      workout.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          workout.completed ? 'bg-green-500' : 'bg-gray-200'
                        }`}>
                          {workout.completed ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <Play className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{workout.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{workout.workout_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={workout.completed ? "default" : "secondary"}>
                          {workout.completed ? "Completed" : "Pending"}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Clock className="w-4 h-4 text-gray-500 mr-1" />
                        </div>
                        <div className="font-semibold">{workout.duration_minutes}min</div>
                        <div className="text-xs text-gray-600">Duration</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Flame className="w-4 h-4 text-orange-500 mr-1" />
                        </div>
                        <div className="font-semibold">{Math.round(workout.calories_burned || 0)}</div>
                        <div className="text-xs text-gray-600">Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Target className="w-4 h-4 text-purple-500 mr-1" />
                        </div>
                        <div className="font-semibold">{workout.intensity_level || 5}/10</div>
                        <div className="text-xs text-gray-600">Intensity</div>
                      </div>
                    </div>

                    {workout.notes && (
                      <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">{workout.notes}</p>
                      </div>
                    )}

                    <Button 
                      onClick={() => toggleWorkoutCompletion(workout.id, workout.completed)}
                      className="w-full"
                      variant={workout.completed ? "outline" : "default"}
                    >
                      {workout.completed ? "Mark as Incomplete" : "Mark as Complete"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No workouts planned</h3>
                <p className="text-gray-600 mb-6">
                  Start your fitness journey by creating your first workout
                </p>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default WorkoutsPage;