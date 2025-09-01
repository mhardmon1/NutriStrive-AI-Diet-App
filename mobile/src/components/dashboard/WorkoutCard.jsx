import React from "react";
import { View, Text } from "react-native";
import { Clock } from "lucide-react-native";
import useTheme from "@/utils/useTheme";

export default function WorkoutCard({ workout }) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: "600",
              fontSize: 16,
              color: colors.text,
              marginBottom: 4,
            }}
          >
            {workout.name}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Clock size={12} color={colors.textTertiary} />
            <Text
              style={{
                fontWeight: "400",
                fontSize: 12,
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
              ? colors.success + "20"
              : colors.surfaceElevated,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              fontWeight: "500",
              fontSize: 10,
              color: workout.completed ? colors.success : colors.textTertiary,
            }}
          >
            {workout.completed ? "Done" : "Pending"}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>
          {Math.round(workout.calories_burned || 0)} cal burned
        </Text>
        <Text style={{ fontSize: 12, color: colors.textTertiary }}>
          Intensity: {workout.intensity_level || 5}/10
        </Text>
      </View>
    </View>
  );
}
