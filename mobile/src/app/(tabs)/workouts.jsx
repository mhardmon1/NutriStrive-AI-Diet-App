import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  MoreHorizontal,
  Dumbbell,
  Clock,
  Plus,
  Flame,
  Target,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "@/utils/useTheme";

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = React.useRef(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/workouts?userId=1&date=${today}`);
      const data = await response.json();
      setWorkouts(data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const shouldShowBorder = scrollY > 10;

    if (shouldShowBorder !== showHeaderBorder) {
      setShowHeaderBorder(shouldShowBorder);
    }
  };

  const toggleWorkoutCompletion = async (workoutId, completed) => {
    try {
      const response = await fetch("/api/workouts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: workoutId,
          completed: !completed,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update workout");
      }

      // Update local state
      setWorkouts((prevWorkouts) =>
        prevWorkouts.map((workout) =>
          workout.id === workoutId
            ? { ...workout, completed: !completed }
            : workout,
        ),
      );
    } catch (error) {
      console.error("Error updating workout:", error);
    }
  };

  const WorkoutCard = ({ workout }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 16,
        shadowColor: isDark ? "#000" : "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "600",
              fontSize: 18,
              color: colors.text,
              marginBottom: 4,
            }}
          >
            {workout.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Clock size={14} color={colors.textTertiary} />
            <Text
              style={{
                fontWeight: "400",
                fontSize: 14,
                color: colors.textTertiary,
                marginLeft: 4,
              }}
            >
              {workout.duration_minutes} min
            </Text>
          </View>
        </View>

        <View
          style={{
            backgroundColor: workout.completed
              ? isDark
                ? "rgba(76, 175, 80, 0.2)"
                : "#E8F5E8"
              : colors.surfaceElevated,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              fontWeight: "500",
              fontSize: 12,
              color: workout.completed ? colors.success : colors.textTertiary,
            }}
          >
            {workout.completed ? "Completed" : "Pending"}
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.warningBackground,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <Dumbbell size={16} color={colors.warning} />
          </View>
          <Text
            style={{
              fontWeight: "400",
              fontSize: 12,
              color: colors.textTertiary,
              marginBottom: 2,
            }}
          >
            Duration
          </Text>
          <Text
            style={{
              fontWeight: "600",
              fontSize: 14,
              color: colors.text,
            }}
          >
            {workout.duration_minutes}min
          </Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.warningBackground,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <Flame size={16} color={colors.warning} />
          </View>
          <Text
            style={{
              fontWeight: "400",
              fontSize: 12,
              color: colors.textTertiary,
              marginBottom: 2,
            }}
          >
            Calories
          </Text>
          <Text
            style={{
              fontWeight: "600",
              fontSize: 14,
              color: colors.text,
            }}
          >
            {Math.round(workout.calories_burned || 0)}
          </Text>
        </View>

        <View style={{ alignItems: "center" }}>
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: isDark ? "rgba(76, 175, 80, 0.2)" : "#E8F5E8",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <Target size={16} color={colors.success} />
          </View>
          <Text
            style={{
              fontWeight: "400",
              fontSize: 12,
              color: colors.textTertiary,
              marginBottom: 2,
            }}
          >
            Intensity
          </Text>
          <Text
            style={{
              fontWeight: "600",
              fontSize: 14,
              color: colors.text,
            }}
          >
            {workout.intensity_level || 5}/10
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={() => toggleWorkoutCompletion(workout.id, workout.completed)}
        style={{
          backgroundColor: workout.completed
            ? colors.success
            : colors.categoryActive,
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontWeight: "600",
            fontSize: 14,
            color: "#FFFFFF",
          }}
        >
          {workout.completed ? "View Workout" : "Start Workout"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const StatsHeader = () => {
    const completedWorkouts = workouts.filter((w) => w.completed).length;
    const totalWorkouts = workouts.length;
    const progressPercentage =
      totalWorkouts > 0
        ? Math.round((completedWorkouts / totalWorkouts) * 100)
        : 0;

    return (
      <LinearGradient
        colors={[colors.successGradientStart, colors.successGradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 16,
          padding: 20,
          marginHorizontal: 20,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#FFFFFF",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Dumbbell size={20} color={colors.success} />
          </View>
          <TouchableOpacity>
            <MoreHorizontal size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        <Text
          style={{
            fontWeight: "600",
            fontSize: 16,
            color: "#FFFFFF",
            marginBottom: 8,
          }}
        >
          Today's Progress
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "baseline",
            marginBottom: 8,
          }}
        >
          <Text
            style={{
              fontWeight: "800",
              fontSize: 32,
              color: "#FFFFFF",
            }}
          >
            {completedWorkouts}
          </Text>
          <Text
            style={{
              fontWeight: "400",
              fontSize: 14,
              color: "rgba(255,255,255,0.8)",
              marginLeft: 4,
            }}
          >
            of {totalWorkouts} workouts
          </Text>
        </View>

        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.2)",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            alignSelf: "flex-start",
          }}
        >
          <Text
            style={{
              fontWeight: "400",
              fontSize: 10,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {progressPercentage}% Complete
          </Text>
        </View>
      </LinearGradient>
    );
  };

  const EmptyState = () => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: 40,
        marginHorizontal: 20,
        marginBottom: 20,
        alignItems: "center",
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.surfaceElevated,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <Dumbbell size={40} color={colors.textTertiary} />
      </View>

      <Text
        style={{
          fontWeight: "600",
          fontSize: 18,
          color: colors.text,
          marginBottom: 8,
          textAlign: "center",
        }}
      >
        No workouts planned
      </Text>

      <Text
        style={{
          fontWeight: "400",
          fontSize: 14,
          color: colors.textTertiary,
          textAlign: "center",
          lineHeight: 20,
          marginBottom: 24,
        }}
      >
        Start your fitness journey by creating your first workout plan
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: colors.categoryActive,
          paddingHorizontal: 24,
          paddingVertical: 12,
          borderRadius: 20,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <Plus
          size={16}
          color={colors.categoryActiveText}
          style={{ marginRight: 8 }}
        />
        <Text
          style={{
            fontWeight: "600",
            fontSize: 14,
            color: colors.categoryActiveText,
          }}
        >
          Create Workout
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surfaceHighest,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  const hasWorkouts = workouts && workouts.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceHighest }}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Fixed Header */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surfaceHighest,
          paddingTop: insets.top + 24,
          paddingBottom: 24,
          paddingHorizontal: 20,
          borderBottomWidth: showHeaderBorder ? 1 : 0,
          borderBottomColor: colors.border,
          zIndex: 1000,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontWeight: "600",
              fontSize: 28,
              color: colors.text,
            }}
          >
            Workouts
          </Text>
          {hasWorkouts && (
            <TouchableOpacity>
              <Plus size={24} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 24 + 28 + 24 + 24, // Header height + title + padding + extra spacing
          paddingBottom: insets.bottom + 100, // Extra space for tab bar
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {hasWorkouts && <StatsHeader />}

        {/* Workouts Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text
            style={{
              fontWeight: "600",
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Today's Workouts
          </Text>
        </View>

        {/* Conditional rendering based on workouts data */}
        {hasWorkouts ? (
          workouts.map((workout) => (
            <WorkoutCard key={workout.id} workout={workout} />
          ))
        ) : (
          <EmptyState />
        )}
      </ScrollView>
    </View>
  );
}
