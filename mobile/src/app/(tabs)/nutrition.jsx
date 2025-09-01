import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Animated,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Flame, Plus, Clock, Edit3, Trash2 } from "lucide-react-native";
import { router } from "expo-router";
import { useRequireAuth } from "@/utils/auth/useAuth";
import useUser from "@/utils/auth/useUser";
import useTheme from "@/utils/useTheme";

export default function NutritionScreen() {
  useRequireAuth(); // Require authentication

  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { data: user } = useUser();
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef(null);

  // Data states
  const [dailyData, setDailyData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchNutritionData();
    }
  }, [user?.id]);

  const fetchNutritionData = async () => {
    try {
      setLoading(true);

      // Fetch daily nutrition summary
      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(
        `/api/nutrition/daily-summary?userId=${user?.id || 1}&date=${today}`,
      );
      const data = await response.json();
      setDailyData(data);

      // Animate the donut chart progress from 0 to actual value
      const caloriesProgress =
        data.totals?.total_calories && data.targets?.target_calories
          ? data.totals.total_calories / data.targets.target_calories
          : 0;

      Animated.timing(progressAnimation, {
        toValue: Math.min(caloriesProgress, 1), // Cap at 100%
        duration: 1200,
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.error("Error fetching nutrition data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNutritionData();
    setRefreshing(false);
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const shouldShowBorder = scrollY > 10;

    if (shouldShowBorder !== showHeaderBorder) {
      setShowHeaderBorder(shouldShowBorder);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getMealTypeColor = (mealType) => {
    const colors_map = {
      breakfast: "#FF6B35",
      lunch: "#4ECDC4",
      dinner: "#45B7D1",
      snack: "#96CEB4",
      meal: "#DDA0DD",
    };
    return colors_map[mealType.toLowerCase()] || colors.primary;
  };

  const CaloriesSummaryCard = () => {
    if (!dailyData) return null;

    const segmentCount = 36;
    const segments = [];
    const caloriesConsumed = dailyData.totals?.total_calories || 0;
    const caloriesTarget = dailyData.targets?.target_calories || 2500;
    const progress = Math.min(caloriesConsumed / caloriesTarget, 1); // Cap at 100%

    for (let i = 0; i < segmentCount; i++) {
      const angle = (i / segmentCount) * 2 * Math.PI - Math.PI / 2; // Start from top
      const isActive = i < segmentCount * progress;

      // Color transition from blue to purple - adjusted for dark mode
      const colorProgress = i / (segmentCount * progress);
      const red = isDark
        ? Math.round(187 + (187 - 187) * colorProgress)
        : Math.round(48 + (173 - 48) * colorProgress);
      const green = isDark
        ? Math.round(134 + (125 - 134) * colorProgress)
        : Math.round(118 + (125 - 118) * colorProgress);
      const blue = isDark
        ? Math.round(252 + (255 - 252) * colorProgress)
        : Math.round(255 + (255 - 255) * colorProgress);
      const color = `rgb(${red}, ${green}, ${blue})`;

      segments.push(
        <View
          key={i}
          style={{
            position: "absolute",
            width: 6,
            height: 24,
            backgroundColor: isActive ? color : `${color}33`, // 20% opacity for inactive
            borderRadius: 3,
            transform: [
              { translateX: Math.cos(angle) * 80 },
              { translateY: Math.sin(angle) * 80 },
              { rotate: `${angle + Math.PI / 2}rad` },
            ],
          }}
        />,
      );
    }

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 24,
          padding: 24,
          marginHorizontal: 20,
          marginBottom: 20,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.warningBackground,
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <Flame size={18} color={colors.warning} />
            </View>
            <Text
              style={{
                fontWeight: "500",
                fontSize: 16,
                color: colors.text,
              }}
            >
              Calories
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/build-plate")}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Plus size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Donut Chart */}
        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 200,
              height: 200,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Segments */}
            {segments}

            {/* Inner dotted ring */}
            <View
              style={{
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: 60,
              }}
            >
              {Array.from({ length: 24 }).map((_, i) => {
                const angle = (i / 24) * 2 * Math.PI - Math.PI / 2;
                return (
                  <View
                    key={i}
                    style={{
                      position: "absolute",
                      width: 3,
                      height: 3,
                      backgroundColor: colors.text,
                      borderRadius: 1.5,
                      transform: [
                        { translateX: Math.cos(angle) * 50 + 58.5 },
                        { translateY: Math.sin(angle) * 50 + 58.5 },
                      ],
                    }}
                  />
                );
              })}
            </View>

            {/* Center content */}
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  fontWeight: "500",
                  fontSize: 48,
                  color: colors.text,
                  lineHeight: 56,
                }}
              >
                {Math.round(caloriesConsumed)}
              </Text>
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: 16,
                  color: colors.nutrition,
                }}
              >
                KCal
              </Text>
            </View>
          </View>
        </View>

        {/* Legend */}
        <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
          {[
            {
              label: "Carbs",
              color: isDark ? "#5A8AFF" : "#3366FF",
              value: Math.round(dailyData.totals?.total_carbs || 0),
            },
            {
              label: "Protein",
              color: colors.nutrition,
              value: Math.round(dailyData.totals?.total_protein || 0),
            },
            {
              label: "Fat",
              color: isDark ? "#8BB7FF" : "#BFD2F6",
              value: Math.round(dailyData.totals?.total_fat || 0),
            },
            {
              label: "Target",
              color: colors.text,
              value: Math.round(caloriesTarget),
            },
          ].map((item) => (
            <View key={item.label} style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: item.color,
                  marginBottom: 4,
                }}
              />
              <Text
                style={{
                  fontWeight: "400",
                  fontSize: 12,
                  color: colors.textTertiary,
                  marginBottom: 2,
                }}
              >
                {item.label}
              </Text>
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 12,
                  color: colors.text,
                }}
              >
                {item.value}
                {item.label !== "Target" ? "g" : ""}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const FoodItem = ({ name, description, calories, imageUrl, prepMethod }) => (
    <View
      style={{
        backgroundColor: colors.surfaceElevated,
        borderRadius: 12,
        padding: 12,
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
      }}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            marginRight: 12,
          }}
        />
      ) : (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.border,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Flame size={20} color={colors.textTertiary} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontWeight: "500",
            fontSize: 14,
            color: colors.text,
            marginBottom: 2,
          }}
        >
          {name}
        </Text>
        <Text
          style={{
            fontWeight: "400",
            fontSize: 12,
            color: colors.textTertiary,
          }}
        >
          {description}
          {prepMethod && ` • ${prepMethod}`}
        </Text>
      </View>
      <Text
        style={{
          fontWeight: "500",
          fontSize: 14,
          color: colors.text,
        }}
      >
        {calories} cal
      </Text>
    </View>
  );

  const MealCard = ({ meal }) => {
    if (!meal || !meal.foods || meal.foods.length === 0) return null;

    const mealTypeColor = getMealTypeColor(meal.meal_type);

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 24,
          padding: 20,
          marginHorizontal: 20,
          marginBottom: 16,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: mealTypeColor,
                marginRight: 8,
              }}
            />
            <Text
              style={{
                fontWeight: "600",
                fontSize: 18,
                color: colors.text,
                textTransform: "capitalize",
              }}
            >
              {meal.meal_type}
            </Text>
            {meal.logged_at && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginLeft: 12,
                }}
              >
                <Clock
                  size={12}
                  color={colors.textTertiary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    fontWeight: "400",
                    fontSize: 12,
                    color: colors.textTertiary,
                  }}
                >
                  {formatTime(meal.logged_at)}
                </Text>
              </View>
            )}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontWeight: "600",
                fontSize: 14,
                color: colors.text,
                marginRight: 8,
              }}
            >
              {Math.round(meal.total_calories || 0)} cal
            </Text>
            <TouchableOpacity
              style={{
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: colors.surfaceElevated,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Edit3 size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Macros Summary */}
        <View
          style={{
            flexDirection: "row",
            marginBottom: 16,
            paddingHorizontal: 12,
            paddingVertical: 8,
            backgroundColor: colors.surfaceHighest,
            borderRadius: 8,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>
            Protein: {Math.round(meal.total_protein || 0)}g
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>
            Carbs: {Math.round(meal.total_carbs || 0)}g
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, flex: 1 }}>
            Fat: {Math.round(meal.total_fat || 0)}g
          </Text>
        </View>

        {/* Food Items */}
        {meal.foods.map((foodData, index) => {
          if (!foodData.food_name) return null;

          const portionCalories = foodData.calories_per_100g
            ? Math.round(
                (foodData.calories_per_100g * foodData.quantity_grams) / 100,
              )
            : 0;

          return (
            <FoodItem
              key={`${meal.id}-${index}`}
              name={foodData.food_name}
              description={`${foodData.quantity_grams}g`}
              calories={portionCalories}
              imageUrl={foodData.image_url}
              prepMethod={foodData.preparation_method}
            />
          );
        })}
      </View>
    );
  };

  const EmptyMealsState = () => (
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
        <Plus size={40} color={colors.textTertiary} />
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
        No meals logged yet
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
        Start tracking your nutrition by logging your first meal
      </Text>

      <TouchableOpacity
        onPress={() => router.push("/(tabs)/build-plate")}
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
          Log First Meal
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Don't render until user is loaded
  if (!user) {
    return null;
  }

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
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.text, marginTop: 16 }}>
          Loading nutrition data...
        </Text>
      </View>
    );
  }

  const hasMeals = dailyData?.meals && dailyData.meals.length > 0;

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
        <Text
          style={{
            fontWeight: "600",
            fontSize: 28,
            color: colors.text,
          }}
        >
          Nutrition
        </Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Calories Summary Card */}
        <CaloriesSummaryCard />

        {/* Food Diary Section */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text
            style={{
              fontWeight: "600",
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Food Diary
          </Text>
        </View>

        {/* Conditional rendering based on meals data */}
        {hasMeals ? (
          dailyData.meals.map((meal, index) => (
            <MealCard key={meal.id || index} meal={meal} />
          ))
        ) : (
          <EmptyMealsState />
        )}
      </ScrollView>
    </View>
  );
}
