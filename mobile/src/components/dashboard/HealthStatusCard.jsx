import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { HeartPulse, MoreHorizontal } from "lucide-react-native";
import useTheme from "@/utils/useTheme";

export default function HealthStatusCard({ score, sport }) {
  const { colors } = useTheme();

  const getStatus = () => {
    if (score >= 80) return { text: "Excellent", color: "#00FF00" };
    if (score >= 60) return { text: "Good", color: "#FFD700" };
    return { text: "Needs improvement", color: "#FF6B6B" };
  };

  const status = getStatus();

  return (
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
          justifyContent: "space-between",
          alignItems: "flex-start",
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
          <HeartPulse size={20} color="#000000" />
        </View>
        <TouchableOpacity>
          <MoreHorizontal size={20} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>

      <Text
        style={{
          fontWeight: "600",
          fontSize: 16,
          lineHeight: 20,
          color: "#FFFFFF",
          marginBottom: 8,
        }}
      >
        Your nutrition score today!
      </Text>

      <Text
        style={{
          fontWeight: "800",
          fontSize: 40,
          lineHeight: 44,
          color: "#FFFFFF",
          marginBottom: 8,
        }}
      >
        {score}%
      </Text>

      <View
        style={{
          backgroundColor: "rgba(255,255,255,0.2)",
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 12,
          flexDirection: "row",
          alignItems: "center",
          alignSelf: "flex-start",
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: status.color,
            marginRight: 4,
          }}
        />
        <Text
          style={{
            fontWeight: "400",
            fontSize: 10,
            color: "rgba(255,255,255,0.8)",
          }}
        >
          {status.text}
        </Text>
      </View>

      <Text style={{ fontWeight: "600", fontSize: 13, color: "#FFFFFF" }}>
        {score >= 80 ? "Keep it up!" : "You can do better"}{" "}
        <Text
          style={{
            fontWeight: "400",
            fontSize: 12,
            color: "rgba(255,255,255,0.7)",
          }}
        >
          {sport
            ? `${sport} nutrition on track`
            : "Nutrition tracking active"}
        </Text>
      </Text>
    </LinearGradient>
  );
}
