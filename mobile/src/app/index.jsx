import { useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/utils/auth/useAuth";
import useAuthModal from "@/utils/auth/useAuthModal";
import useUser from "@/utils/auth/useUser";
import useTheme from "@/utils/useTheme";
import { Image } from "expo-image";

export default function Index() {
  const { colors } = useTheme();
  const { isReady, auth } = useAuth();
  const { data: user, loading: userLoading } = useUser();
  const { open: openAuthModal } = useAuthModal();

  useEffect(() => {
    if (!isReady) return;

    if (!auth) {
      // User is not authenticated, stay on index and let them sign in
      return;
    }

    if (userLoading) return;

    if (user && user.name && user.sport) {
      // User has completed onboarding, go to main app
      router.replace("/(tabs)");
    } else if (user) {
      // User exists but hasn't completed onboarding
      router.replace("/onboarding");
    } else {
      // User is authenticated but profile doesn't exist, go to onboarding
      router.replace("/onboarding");
    }
  }, [isReady, auth, user, userLoading]);

  if (!isReady || userLoading) {
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
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: colors.textSecondary,
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  if (!auth) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surfaceHighest,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 40,
        }}
      >
        {/* MOBA Logo */}
        <View
          style={{
            width: 120,
            height: 120,
            marginBottom: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image
            source="https://ucarecdn.com/3a44d265-ac39-42c0-a389-72ff41caf6f6/-/format/auto/"
            style={{
              width: 120,
              height: 120,
            }}
            contentFit="contain"
            transition={100}
          />
        </View>

        <Text
          style={{
            fontSize: 32,
            fontWeight: "700",
            color: colors.text,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Welcome to MOBA
        </Text>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: colors.primary,
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Performance Nutrition
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 22,
            marginBottom: 48,
          }}
        >
          Optimize your athletic performance with personalized nutrition
          tracking and insights
        </Text>

        {/* Sign In Button */}
        <TouchableOpacity
          onPress={() => openAuthModal({ mode: "signin" })}
          style={{
            backgroundColor: colors.primary,
            paddingHorizontal: 48,
            paddingVertical: 16,
            borderRadius: 28,
            marginBottom: 16,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: "#FFFFFF",
            }}
          >
            Sign In
          </Text>
        </TouchableOpacity>

        {/* Sign Up Button */}
        <TouchableOpacity
          onPress={() => openAuthModal({ mode: "signup" })}
          style={{
            backgroundColor: "transparent",
            paddingHorizontal: 48,
            paddingVertical: 16,
            borderRadius: 28,
            borderWidth: 2,
            borderColor: colors.primary,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.primary,
            }}
          >
            Create Account
          </Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 12,
            color: colors.textTertiary,
            textAlign: "center",
            marginTop: 24,
            lineHeight: 18,
          }}
        >
          Track your nutrition • Monitor performance • Achieve your goals
        </Text>
      </View>
    );
  }

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
    </View>
  );
}
