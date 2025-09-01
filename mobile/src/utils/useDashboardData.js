import { useState, useEffect, useCallback } from "react";

export default function useDashboardData() {
  const [userData, setUserData] = useState(null);
  const [dailyData, setDailyData] = useState(null);
  const [workouts, setWorkouts] = useState([]);
  const [hydrationData, setHydrationData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      const [
        userResponse,
        dailyResponse,
        workoutsResponse,
        hydrationResponse,
      ] = await Promise.all([
        fetch("/api/users/profile?userId=1"),
        fetch(`/api/nutrition/daily-summary?userId=1&date=${today}`),
        fetch(`/api/workouts?userId=1&date=${today}`),
        fetch(`/api/hydration?userId=1&date=${today}`),
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
    } finally {
      setLoading(false);
    }
  }, []);

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
