import React, { useState, useRef, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Flame, Droplet, Footprints, Dumbbell } from "lucide-react-native";

import { useRequireAuth } from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";
import useTheme from "@/utils/useTheme";
import useDashboardData from "@/utils/useDashboardData";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import CategoryPills from "@/components/dashboard/CategoryPills";
import HealthStatusCard from "@/components/dashboard/HealthStatusCard";
import StatCard from "@/components/dashboard/StatCard";
import WorkoutCard from "@/components/dashboard/WorkoutCard";
import HydrationCard from "@/components/dashboard/HydrationCard";
import QuickLogModal from "@/components/dashboard/QuickLogModal";
import FloatingActionButtons from "@/components/dashboard/FloatingActionButtons";

export default function DashboardScreen() {
  useRequireAuth({ mode: 'signin' }); // This will show auth modal if user is not signed in

  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { data: authUser, loading: userLoading } = useUser();
  const scrollViewRef = useRef(null);

  const [selectedCategory, setSelectedCategory] = useState("Daily Summary");
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [showQuickLogModal, setShowQuickLogModal] = useState(false);
  const [quickLogType, setQuickLogType] = useState("food");

  const {
    userData,
    dailyData,
    workouts,
    hydrationData,
    loading,
    fetchDashboardData,
  } = useDashboardData();

  const categories = ["Daily Summary", "Nutrition", "Workouts", "Hydration"];

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setShowHeaderBorder(scrollY > 10);
  };

  const openQuickLogModal = (type) => {
    setQuickLogType(type);
    setShowQuickLogModal(true);
  };

  const healthScore = useMemo(() => {
    if (!dailyData?.dietScore) return 65;
    return Math.round(dailyData.dietScore.overall_score || 65);
  }, [dailyData]);

  const caloriesProgress = useMemo(() => {
    if (!dailyData?.totals || !dailyData?.targets)
      return { consumed: 0, target: 2500 };
    return {
      consumed: Math.round(dailyData.totals.total_calories || 0),
      target: Math.round(dailyData.targets.target_calories || 2500),
    };
  }, [dailyData]);

  const hydrationProgress = useMemo(() => {
    if (!hydrationData) return { consumed: 0, target: 2500 };
    return {
      consumed: Math.round(hydrationData.total || 0),
      target: Math.round(hydrationData.target || 2500),
    };
  }, [hydrationData]);

  // Don't render content until user is authenticated
  if (!authUser || userLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>
          {userLoading ? "Loading user data..." : "Authenticating..."}
        </Text>
      </View>
    );
  }

  const renderTabContent = () => {
    switch (selectedCategory) {
      case "Daily Summary":
        return (
          <>
            <HealthStatusCard score={healthScore} sport={userData?.sport} />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginHorizontal: 20,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: 18,
                  lineHeight: 22,
                  color: colors.text,
                }}
              >
                Today's Summary
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                flexWrap: "wrap",
                paddingHorizontal: 20,
              }}
            >
              <StatCard
                title="Calories"
                value={caloriesProgress.consumed.toString()}
                unit={`/${caloriesProgress.target}`}
                iconColor={colors.calories}
                IconComponent={Flame}
              />
              <StatCard
                title="Protein"
                value={Math.round(
                  dailyData?.totals?.total_protein || 0,
                ).toString()}
                unit={`/${Math.round(dailyData?.targets?.target_protein || 150)}g`}
                iconColor={colors.nutrition}
                IconComponent={Footprints}
              />
            </View>
            <View style={{ paddingHorizontal: 20 }}>
              <StatCard
                title="Hydrate"
                value={hydrationProgress.consumed.toString()}
                unit={`/${hydrationProgress.target} ML`}
                iconColor={colors.hydration}
                IconComponent={Droplet}
                isWide={true}
              />
            </View>
          </>
        );

      case "Nutrition":
        return (
          <View style={{ paddingHorizontal: 20 }}>
            <StatCard
              title="Calories"
              value={caloriesProgress.consumed.toString()}
              unit={`/${caloriesProgress.target}`}
              iconColor={colors.calories}
              IconComponent={Flame}
              isWide={true}
            />
            <StatCard
              title="Protein"
              value={Math.round(
                dailyData?.totals?.total_protein || 0,
              ).toString()}
              unit={`/${Math.round(dailyData?.targets?.target_protein || 150)}g`}
              iconColor={colors.nutrition}
              IconComponent={Footprints}
              isWide={true}
            />
            <StatCard
              title="Carbs"
              value={Math.round(dailyData?.totals?.total_carbs || 0).toString()}
              unit={`/${Math.round(dailyData?.targets?.target_carbs || 250)}g`}
              iconColor={colors.primary}
              IconComponent={Footprints}
              isWide={true}
            />
          </View>
        );

      case "Workouts":
        return (
          <View>
            <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
              <Text
                style={{ fontWeight: "600", fontSize: 18, color: colors.text }}
              >
                Today's Workouts
              </Text>
            </View>
            {workouts.length > 0 ? (
              workouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))
            ) : (
              <View style={{ alignItems: "center", padding: 40 }}>
                <Dumbbell
                  size={40}
                  color={colors.textTertiary}
                  style={{ marginBottom: 12 }}
                />
                <Text style={{ color: colors.textTertiary, fontSize: 16 }}>
                  No workouts planned for today
                </Text>
              </View>
            )}
          </View>
        );

      case "Hydration":
        return (
          <HydrationCard
            consumed={hydrationProgress.consumed}
            target={hydrationProgress.target}
          />
        );

      default:
        return null;
    }
  };

  if (loading && !userData) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <DashboardHeader
        insets={insets}
        showHeaderBorder={showHeaderBorder}
        userData={userData}
        onPlusPress={() => openQuickLogModal("food")}
      />

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 168,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <CategoryPills
          categories={categories}
          selectedCategory={selectedCategory}
          onPress={setSelectedCategory}
        />
        {renderTabContent()}
      </ScrollView>

      <FloatingActionButtons
        insets={insets}
        onLogHydration={() => openQuickLogModal("hydration")}
        onLogFood={() => openQuickLogModal("food")}
      />

      <QuickLogModal
        visible={showQuickLogModal}
        onClose={() => setShowQuickLogModal(false)}
        logType={quickLogType}
        onLogSuccess={fetchDashboardData}
      />
    </View>
  );
}
