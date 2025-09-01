import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import useUser from "@/utils/useUser";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/client-integrations/shadcn-ui";
import { Button } from "@/client-integrations/shadcn-ui";
import { Progress } from "@/client-integrations/shadcn-ui";
import { Input } from "@/client-integrations/shadcn-ui";
import { Badge } from "@/client-integrations/shadcn-ui";
import { 
  Droplet, 
  Clock, 
  Plus,
  TrendingUp,
  Target
} from "lucide-react";

function HydrationPage() {
  const { data: user, loading: userLoading } = useUser();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAmount, setNewAmount] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Fetch hydration data
  const { data: hydrationData, isLoading, refetch } = useQuery({
    queryKey: ['hydration', selectedDate],
    queryFn: async () => {
      const response = await fetch(`/api/hydration?date=${selectedDate}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hydration data');
      }
      return response.json();
    },
    enabled: !!user,
  });

  const addHydration = async () => {
    const amount = parseInt(newAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setIsAdding(true);
      const response = await fetch('/api/hydration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount_ml: amount,
          date: selectedDate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log hydration');
      }

      setNewAmount("");
      refetch();
    } catch (error) {
      console.error('Error adding hydration:', error);
      alert('Failed to log hydration');
    } finally {
      setIsAdding(false);
    }
  };

  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hydration data...</p>
        </div>
      </div>
    );
  }

  const hydration = hydrationData || {};
  const logs = hydration.logs || [];
  const total = hydration.total || 0;
  const target = hydration.target || 2500;
  const progress = target > 0 ? Math.min((total / target) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Hydration Tracking</h1>
              <p className="text-gray-600 mt-1">
                Monitor your daily water intake and stay hydrated
              </p>
            </div>
          </div>
        </div>

        {/* Main Hydration Card */}
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-white">
              <Droplet className="w-6 h-6 mr-2" />
              Daily Hydration
            </CardTitle>
            <CardDescription className="text-blue-100">
              Your water intake for {new Date(selectedDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-4xl font-bold">{total}ml</div>
                <p className="text-blue-100">of {target}ml target</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{Math.round(progress)}%</div>
                <p className="text-blue-100">Complete</p>
              </div>
            </div>
            <Progress value={progress} className="mb-4 bg-blue-400" />
            <div className="flex justify-between text-sm text-blue-100">
              <span>0ml</span>
              <span>{target}ml Goal</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Hydration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2 text-blue-600" />
                Log Water Intake
              </CardTitle>
              <CardDescription>
                Add your water consumption
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (ml)
                  </label>
                  <Input
                    type="number"
                    placeholder="e.g. 250"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="mb-3"
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[250, 500, 750, 1000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setNewAmount(amount.toString())}
                      className="text-xs"
                    >
                      {amount}ml
                    </Button>
                  ))}
                </div>

                <Button 
                  onClick={addHydration}
                  disabled={isAdding || !newAmount}
                  className="w-full"
                >
                  {isAdding ? "Adding..." : "Log Water Intake"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Hydration Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Target className="w-5 h-5 mr-2 text-cyan-600" />
                Hydration Tips
              </CardTitle>
              <CardDescription>
                Stay optimally hydrated
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p>Drink water consistently throughout the day rather than large amounts at once</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p>Increase intake during and after exercise to replace lost fluids</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p>Monitor urine color - pale yellow indicates good hydration</p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p>Consider electrolyte replacement during intense training sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hydration Log */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Hydration Log</CardTitle>
            <CardDescription>
              Your water intake history for today
            </CardDescription>
          </CardHeader>
          <CardContent>
            {logs.length > 0 ? (
              <div className="space-y-3">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Droplet className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Water Intake</p>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {new Date(log.logged_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">{log.amount_ml}ml</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Droplet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">No hydration logged yet</h3>
                <p className="text-gray-600 mb-6">
                  Start tracking your water intake to stay properly hydrated
                </p>
                <Button onClick={() => setNewAmount("250")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log First Intake
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default HydrationPage;