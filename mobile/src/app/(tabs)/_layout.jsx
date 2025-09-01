import { Tabs } from "expo-router";
import { LayoutDashboard, ChefHat, User } from "lucide-react-native";
import useTheme from "@/utils/useTheme";

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderColor: colors.border,
          paddingBottom: 10,
          paddingTop: 10,
          height: 80,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="build-plate"
        options={{
          title: "Build Plate",
          tabBarIcon: ({ color, size }) => <ChefHat color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={24} />,
        }}
      />

      {/* Hide other screens that might still exist */}
      <Tabs.Screen
        name="nutrition"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="workouts"
        options={{
          href: null, // Hide from tab bar
        }}
      />
      <Tabs.Screen
        name="water-balance"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
