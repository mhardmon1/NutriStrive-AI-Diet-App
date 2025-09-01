import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ChefHat,
  Camera,
  Search,
  Plus,
  Sparkles,
  CheckCircle,
  ArrowRight,
  Utensils,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "@/utils/useTheme";
import SelectionPill from "@/components/SelectionPill";
import * as ImagePicker from "expo-image-picker";
import useUpload from "@/utils/useUpload";
import { useAuth } from "@/utils/auth/useAuth";

export default function BuildPlateScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { auth } = useAuth();
  const [selectedMode, setSelectedMode] = useState("Camera");
  const [currentMeal, setCurrentMeal] = useState([]);
  const [optimization, setOptimization] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);

  const [upload, { loading: uploading }] = useUpload();

  const modes = ["Camera", "Search", "Manual"];

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const shouldShowBorder = scrollY > 10;

    if (shouldShowBorder !== showHeaderBorder) {
      setShowHeaderBorder(shouldShowBorder);
    }
  };

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        analyzeFoodImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        analyzeFoodImage(result.assets[0]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  }, []);

  const analyzeFoodImage = async (imageAsset) => {
    try {
      setLoading(true);

      // Upload image first
      const { url, error } = await upload({ reactNativeAsset: imageAsset });
      if (error) {
        throw new Error(error);
      }

      // Analyze the uploaded image
      const response = await fetch("/api/nutrition/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: url }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze food");
      }

      const analysis = await response.json();
      setCurrentMeal(analysis.foods);
    } catch (error) {
      console.error("Error analyzing food:", error);
      Alert.alert("Error", "Failed to analyze food image");
    } finally {
      setLoading(false);
    }
  };

  const searchFoodByText = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);

      const response = await fetch("/api/nutrition/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: searchQuery }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze food");
      }

      const analysis = await response.json();
      setCurrentMeal(analysis.foods);
    } catch (error) {
      console.error("Error searching food:", error);
      Alert.alert("Error", "Failed to analyze food description");
    } finally {
      setLoading(false);
    }
  };

  const optimizeMeal = async () => {
    if (currentMeal.length === 0) return;

    try {
      setLoading(true);

      // Convert current meal to the format expected by the API
      const mealFoods = currentMeal.map((food) => ({
        name: food.name,
        quantity_grams: food.estimated_portion_grams,
        preparation_method: food.preparation_method,
        calories_per_100g: (food.calories / food.estimated_portion_grams) * 100,
        protein_per_100g: (food.protein / food.estimated_portion_grams) * 100,
        carbs_per_100g: (food.carbs / food.estimated_portion_grams) * 100,
        fat_per_100g: (food.fat / food.estimated_portion_grams) * 100,
      }));

      const response = await fetch("/api/nutrition/optimize-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meal_foods: mealFoods,
          training_state: "active", // Could be dynamic based on user's schedule
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to optimize meal");
      }

      const optimizationResult = await response.json();
      setOptimization(optimizationResult);
    } catch (error) {
      console.error("Error optimizing meal:", error);
      Alert.alert("Error", "Failed to optimize meal");
    } finally {
      setLoading(false);
    }
  };

  const logMeal = async (mealToLog = null) => {
    const meal = mealToLog || currentMeal;
    if (meal.length === 0) return;
    
    if (!auth?.user?.id) {
      Alert.alert("Error", "Please sign in to log meals");
      return;
    }

    try {
      setLoading(true);

      // Log the meal to the database
      const response = await fetch("/api/nutrition/log-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: auth.user.id,
          meal_type: "meal", // Could be dynamic (breakfast, lunch, dinner, snack)
          foods: meal,
          date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log meal");
      }

      Alert.alert("Success", "Meal logged successfully!", [
        {
          text: "OK",
          onPress: () => {
            // Clear the current meal and optimization
            setCurrentMeal([]);
            setOptimization(null);
          },
        },
      ]);
    } catch (error) {
      console.error("Error logging meal:", error);
      Alert.alert("Error", "Failed to log meal");
    } finally {
      setLoading(false);
    }
  };

  const logOptimizedMeal = () => {
    if (!optimization?.optimized_meal?.foods) return;

    // Convert optimized meal format to expected format
    const optimizedFoods = optimization.optimized_meal.foods.map((food) => ({
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      estimated_portion_grams: food.quantity_grams,
      preparation_method: food.preparation_method,
    }));

    logMeal(optimizedFoods);
  };

  const EmptyStateComponent = ({ onButtonPress }) => (
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
        <ChefHat size={40} color={colors.textTertiary} />
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
        Start building your optimized meal
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
        Use the camera to scan your food or search by description to get
        AI-powered nutrition recommendations
      </Text>

      <TouchableOpacity
        onPress={onButtonPress}
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
          Take Photo
        </Text>
      </TouchableOpacity>
    </View>
  );

  const FoodItem = ({ food, isOptimized = false }) => (
    <View
      style={{
        backgroundColor: colors.surfaceElevated,
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: isOptimized && food.is_replacement ? 1 : 0,
        borderColor: colors.success,
      }}
    >
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}
      >
        {isOptimized && food.is_replacement && (
          <CheckCircle
            size={16}
            color={colors.success}
            style={{ marginRight: 8 }}
          />
        )}
        <Text
          style={{
            fontWeight: "600",
            fontSize: 16,
            color: colors.text,
            flex: 1,
          }}
        >
          {food.name}
        </Text>
        <Text
          style={{
            fontWeight: "500",
            fontSize: 14,
            color: colors.textSecondary,
          }}
        >
          {Math.round(food.estimated_portion_grams || food.quantity_grams)}g
        </Text>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>
          Calories: {Math.round(food.calories)} • Protein:{" "}
          {Math.round(food.protein)}g
        </Text>
      </View>

      {food.preparation_method && (
        <Text
          style={{
            fontSize: 12,
            color: colors.textTertiary,
            fontStyle: "italic",
          }}
        >
          {food.preparation_method}
        </Text>
      )}

      {isOptimized && food.replacement_reason && (
        <View
          style={{
            backgroundColor: colors.success + "20",
            padding: 8,
            borderRadius: 8,
            marginTop: 8,
          }}
        >
          <Text
            style={{ fontSize: 12, color: colors.success, fontWeight: "500" }}
          >
            ✨ {food.replacement_reason}
          </Text>
        </View>
      )}
    </View>
  );

  const CurrentMealCard = () => {
    if (currentMeal.length === 0) return null;

    const totalCalories = currentMeal.reduce(
      (sum, food) => sum + food.calories,
      0,
    );
    const totalProtein = currentMeal.reduce(
      (sum, food) => sum + food.protein,
      0,
    );

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginHorizontal: 20,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <Text style={{ fontWeight: "600", fontSize: 18, color: colors.text }}>
            Current Meal
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                marginRight: 8,
              }}
            >
              {Math.round(totalCalories)} cal
            </Text>
            <TouchableOpacity
              onPress={optimizeMeal}
              disabled={loading}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Sparkles size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text
                style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}
              >
                {loading ? "Optimizing..." : "Optimize"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {currentMeal.map((food, index) => (
          <FoodItem key={index} food={food} />
        ))}

        {/* Log Meal Button */}
        <TouchableOpacity
          onPress={() => logMeal()}
          disabled={loading}
          style={{
            backgroundColor: colors.success,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>
            Log This Meal
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const OptimizationCard = () => {
    if (!optimization) return null;

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 20,
          marginHorizontal: 20,
          marginBottom: 20,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Sparkles
            size={20}
            color={colors.success}
            style={{ marginRight: 8 }}
          />
          <Text style={{ fontWeight: "600", fontSize: 18, color: colors.text }}>
            AI Optimized Meal
          </Text>
          <View
            style={{
              backgroundColor: colors.success,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              marginLeft: "auto",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>
              +{Math.round(optimization.optimized_meal.improvement_score)}%
              Better
            </Text>
          </View>
        </View>

        {/* Rationale */}
        <View
          style={{
            backgroundColor: colors.primaryGradientStart + "20",
            padding: 12,
            borderRadius: 8,
            marginBottom: 16,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.text, lineHeight: 18 }}>
            {optimization.rationale}
          </Text>
        </View>

        {/* Optimized foods */}
        {optimization.optimized_meal.foods.map((food, index) => (
          <FoodItem key={index} food={food} isOptimized={true} />
        ))}

        {/* Key improvements */}
        <View style={{ marginTop: 16 }}>
          <Text
            style={{
              fontWeight: "600",
              fontSize: 16,
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Key Improvements:
          </Text>
          {optimization.key_improvements.map((improvement, index) => (
            <Text
              key={index}
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
            >
              • {improvement}
            </Text>
          ))}
        </View>

        {/* Log Optimized Meal Button */}
        <TouchableOpacity
          onPress={logOptimizedMeal}
          disabled={loading}
          style={{
            backgroundColor: colors.success,
            paddingVertical: 12,
            borderRadius: 8,
            alignItems: "center",
            marginTop: 16,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "600" }}>
            Log Optimized Meal
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

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
          Build Plate
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 24 + 28 + 24 + 24,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Mode Selector */}
        <ScrollView
          horizontal
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          showsHorizontalScrollIndicator={false}
        >
          {modes.map((mode) => (
            <SelectionPill
              key={mode}
              title={mode}
              isSelected={selectedMode === mode}
              onPress={() => setSelectedMode(mode)}
              variant="outlined"
            />
          ))}
        </ScrollView>

        {/* AI Introduction Card */}
        <LinearGradient
          colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
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
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Sparkles size={24} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text
              style={{
                fontWeight: "600",
                fontSize: 18,
                color: "#FFFFFF",
              }}
            >
              AI-Powered Meal Optimization
            </Text>
          </View>
          <Text
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 14,
              lineHeight: 20,
            }}
          >
            Take a photo or describe your meal, and our AI will analyze it and
            suggest healthier alternatives optimized for your training and
            goals.
          </Text>
        </LinearGradient>

        {/* Input Methods */}
        {selectedMode === "Camera" && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={takePhoto}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Camera size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>
                  Take Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={pickImage}
                disabled={loading}
                style={{
                  flex: 1,
                  backgroundColor: colors.surfaceElevated,
                  padding: 16,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Plus
                  size={20}
                  color={colors.text}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  Gallery
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedMode === "Search" && (
          <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TextInput
                style={{
                  flex: 1,
                  backgroundColor: colors.surfaceElevated,
                  padding: 16,
                  borderRadius: 12,
                  color: colors.text,
                  fontSize: 16,
                }}
                placeholder="Describe your meal (e.g., grilled chicken with rice)"
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={searchFoodByText}
              />
              <TouchableOpacity
                onPress={searchFoodByText}
                disabled={loading || !searchQuery.trim()}
                style={{
                  backgroundColor: colors.primary,
                  padding: 16,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Search size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Current Meal */}
        <CurrentMealCard />

        {/* Optimization Results */}
        <OptimizationCard />

        {/* Empty State */}
        {currentMeal.length === 0 && !loading && (
          <EmptyStateComponent onButtonPress={takePhoto} />
        )}

        {loading && (
          <View style={{ alignItems: "center", padding: 40 }}>
            <Text style={{ color: colors.text, fontSize: 16 }}>
              {uploading ? "Uploading image..." : "Analyzing with AI..."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
