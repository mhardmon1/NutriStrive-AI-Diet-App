import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Bell, Plus } from "lucide-react-native";
import useTheme from "@/utils/useTheme";

export default function DashboardHeader({
  insets,
  showHeaderBorder,
  userData,
  onPlusPress,
}) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        paddingTop: insets.top + 24,
        paddingBottom: 20,
        paddingHorizontal: 24,
        borderBottomWidth: showHeaderBorder ? 1 : 0,
        borderBottomColor: colors.border,
        zIndex: 1000,
      }}
    >
      {/* Top Bar */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        {/* MOBA Logo */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              backgroundColor: colors.primary,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 8,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontWeight: "700",
                fontSize: 16,
              }}
            >
              M
            </Text>
          </View>
          <Text
            style={{
              color: colors.text,
              fontWeight: "600",
              fontSize: 18,
            }}
          >
            MOBA
          </Text>
        </View>

        {/* Right buttons */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={onPlusPress}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Plus size={16} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={{ position: "relative", marginRight: 12 }}>
            <TouchableOpacity
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: colors.surfaceElevated,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Bell size={16} color={colors.text} />
            </TouchableOpacity>
            <View
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.notification,
              }}
            />
          </View>

          <TouchableOpacity>
            <Image
              source={{
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userData?.name || "User",
                )}&background=random`,
              }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
              }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Greeting */}
      <View>
        <Text
          style={{
            fontWeight: "300",
            fontSize: 24,
            lineHeight: 28,
            color: colors.text,
          }}
        >
          Hello,
        </Text>
        <Text
          style={{
            fontWeight: "600",
            fontSize: 24,
            lineHeight: 28,
            color: colors.text,
          }}
        >
          {userData?.name || "Athlete"}
        </Text>
      </View>
    </View>
  );
}
