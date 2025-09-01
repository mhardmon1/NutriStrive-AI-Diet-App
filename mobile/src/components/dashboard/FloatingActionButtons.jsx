import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Droplet, Plus } from "lucide-react-native";
import useTheme from "@/utils/useTheme";

export default function FloatingActionButtons({
  insets,
  onLogHydration,
  onLogFood,
}) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        position: "absolute",
        bottom: insets.bottom + 100,
        right: 20,
        flexDirection: "column",
        gap: 12,
      }}
    >
      <TouchableOpacity
        onPress={onLogHydration}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.hydration,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Droplet size={24} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onLogFood}
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <Plus size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
