import React from "react";
import { View, Text } from "react-native";
import { Droplet } from "lucide-react-native";
import useTheme from "@/utils/useTheme";

export default function HydrationCard({ consumed, target }) {
  const { colors } = useTheme();
  const progress = target > 0 ? Math.min((consumed / target) * 100, 100) : 0;

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
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.hydration,
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
          }}
        >
          <Droplet size={20} color="#000000" />
        </View>
        <Text style={{ fontWeight: "600", fontSize: 18, color: colors.text }}>
          Water Intake
        </Text>
      </View>

      <Text
        style={{
          fontWeight: "700",
          fontSize: 32,
          color: colors.text,
          marginBottom: 8,
        }}
      >
        {consumed} ML
      </Text>

      <View
        style={{
          height: 8,
          backgroundColor: colors.border,
          borderRadius: 4,
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${progress}%`,
            backgroundColor: colors.hydration,
            borderRadius: 4,
          }}
        />
      </View>

      <Text style={{ fontSize: 12, color: colors.textTertiary }}>
        Goal: {target} ML ({Math.round(progress)}% complete)
      </Text>
    </View>
  );
}
