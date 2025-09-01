import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/utils/auth/useAuth";

export default function useDashboardData() {
  const { auth } = useAuth();
  const [userData, setUserData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [hydrationData, setHydrationData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!auth?.user?.id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];
      const userId = auth.user.id;

      const [
        userResponse,
        dailyResponse,
        workoutsResponse,
        hydrationResponse,
      ] = await Promise.all([
        fetch(`/api/users/profile?userId=${userId}`),
        fetch(`/api/nutrition/daily-summary?userId=${userId}&date=${today}`),
        fetch(`/api/workouts?userId=${userId}&date=${today}`),
        fetch(`/api/hydration?userId=${userId}&date=${today}`),
      ]);

      const user = await userResponse.json();
      const daily = await dailyResponse.json();
      const workoutsData = await workoutsResponse.json();
      const hydration = await hydrationResponse.json();

      setUserData(user);
      setDailyData(daily);
      setWorkouts(workoutsData);
      setHydrationData(hydration);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Set empty data on error to prevent infinite loading
      setUserData({});
      setDailyData({});
      setWorkouts([]);
      setHydrationData({});
    } finally {
      setLoading(false);
    }
  }, [auth?.user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    userData,
    dailyData,
    workouts,
    hydrationData,
    loading,
    fetchDashboardData,
  };
}
