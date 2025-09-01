import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  User,
  Edit3,
  Target,
  TrendingUp,
  Award,
  Settings,
  LogOut,
  ChevronRight,
  Scale,
  Ruler,
  Calendar,
  Activity,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "@/utils/useTheme";
import { useAuth } from "@/utils/auth/useAuth";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { auth } = useAuth();
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const scrollViewRef = React.useRef(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (!auth?.user?.id) {
      console.log('No authenticated user for profile data');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`/api/users/profile?userId=${auth.user.id}`);
      const data = await response.json();
      setUserData(data);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
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

  // Conversion functions
  const kgToLbs = (kg) => Math.round(kg * 2.20462);
  const cmToFeetInches = (cm) => {
    const totalInches = cm * 0.393701;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}''`;
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const ProfileHeader = () => (
    <LinearGradient
      colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        borderRadius: 20,
        padding: 24,
        marginHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
      }}
    >
      <Image
        source={{
          uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData?.name || 'User')}&background=random&size=120`,
        }}
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          marginBottom: 16,
          borderWidth: 3,
          borderColor: '#FFFFFF',
        }}
      />
      
      <Text
        style={{
          fontWeight: '700',
          fontSize: 24,
          color: '#FFFFFF',
          marginBottom: 4,
        }}
      >
        {userData?.name || 'Athlete'}
      </Text>
      
      <Text
        style={{
          fontWeight: '400',
          fontSize: 16,
          color: 'rgba(255,255,255,0.8)',
          marginBottom: 16,
        }}
      >
        {userData?.sport || 'Fitness Enthusiast'}
        {userData?.position && ` • ${userData.position}`}
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          paddingHorizontal: 20,
          paddingVertical: 10,
          borderRadius: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Edit3 size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
        <Text
          style={{
            fontWeight: '600',
            fontSize: 14,
            color: '#FFFFFF',
          }}
        >
          Edit Profile
        </Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  const StatsCard = () => {
    if (!userData) return null;

    const age = calculateAge(userData.date_of_birth);
    const weightLbs = userData.weight_kg ? kgToLbs(userData.weight_kg) : null;
    const heightFeet = userData.height_cm ? cmToFeetInches(userData.height_cm) : null;

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
        <Text
          style={{
            fontWeight: '600',
            fontSize: 18,
            color: colors.text,
            marginBottom: 16,
          }}
        >
          Physical Stats
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {age && (
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.primaryGradientStart + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Calendar size={20} color={colors.primary} />
              </View>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 20,
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                {age}
              </Text>
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 12,
                  color: colors.textTertiary,
                }}
              >
                Years Old
              </Text>
            </View>
          )}

          {weightLbs && (
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.success + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Scale size={20} color={colors.success} />
              </View>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 20,
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                {weightLbs}
              </Text>
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 12,
                  color: colors.textTertiary,
                }}
              >
                lbs
              </Text>
            </View>
          )}

          {heightFeet && (
            <View style={{ alignItems: 'center', flex: 1 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: colors.warning + '20',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Ruler size={20} color={colors.warning} />
              </View>
              <Text
                style={{
                  fontWeight: '700',
                  fontSize: 20,
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                {heightFeet}
              </Text>
              <Text
                style={{
                  fontWeight: '400',
                  fontSize: 12,
                  color: colors.textTertiary,
                }}
              >
                Height
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const NutritionTargetsCard = () => {
    if (!userData) return null;

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
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontWeight: '600',
              fontSize: 18,
              color: colors.text,
            }}
          >
            Daily Targets
          </Text>
          <TouchableOpacity>
            <Edit3 size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text
              style={{
                fontWeight: '700',
                fontSize: 18,
                color: colors.text,
                marginBottom: 4,
              }}
            >
              {Math.round(userData.target_calories || 2500)}
            </Text>
            <Text
              style={{
                fontWeight: '400',
                fontSize: 12,
                color: colors.textTertiary,
              }}
            >
              Calories
            </Text>
          </View>

          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text
              style={{
                fontWeight: '700',
                fontSize: 18,
                color: colors.text,
                marginBottom: 4,
              }}
            >
              {Math.round(userData.target_protein || 150)}g
            </Text>
            <Text
              style={{
                fontWeight: '400',
                fontSize: 12,
                color: colors.textTertiary,
              }}
            >
              Protein
            </Text>
          </View>

          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text
              style={{
                fontWeight: '700',
                fontSize: 18,
                color: colors.text,
                marginBottom: 4,
              }}
            >
              {Math.round(userData.target_water_ml || 2500)}ml
            </Text>
            <Text
              style={{
                fontWeight: '400',
                fontSize: 12,
                color: colors.textTertiary,
              }}
            >
              Water
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const GoalsCard = () => {
    if (!userData?.goals) return null;

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
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Target size={20} color={colors.primary} style={{ marginRight: 8 }} />
          <Text
            style={{
              fontWeight: '600',
              fontSize: 18,
              color: colors.text,
            }}
          >
            Goals
          </Text>
        </View>

        <Text
          style={{
            fontWeight: '400',
            fontSize: 14,
            color: colors.textSecondary,
            lineHeight: 20,
          }}
        >
          {userData.goals}
        </Text>
      </View>
    );
  };

  const MenuItem = ({ icon: Icon, title, subtitle, onPress, color = colors.textTertiary }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.surface,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 8,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
      }}
      onPress={onPress}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: color + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}
      >
        <Icon size={20} color={color} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontWeight: '500',
            fontSize: 16,
            color: colors.text,
            marginBottom: 2,
          }}
        >
          {title}
        </Text>
        {subtitle && (
          <Text
            style={{
              fontWeight: '400',
              fontSize: 12,
              color: colors.textTertiary,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      <ChevronRight size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.surfaceHighest, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

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
          Profile
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 24 + 28 + 24 + 24,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Header */}
        <ProfileHeader />

        {/* Physical Stats */}
        <StatsCard />

        {/* Nutrition Targets */}
        <NutritionTargetsCard />

        {/* Goals */}
        <GoalsCard />

        {/* Menu Items */}
        <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
          <Text
            style={{
              fontWeight: "600",
              fontSize: 20,
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Settings
          </Text>
        </View>

        <MenuItem
          icon={TrendingUp}
          title="Performance Analytics"
          subtitle="View detailed nutrition and fitness insights"
          color={colors.primary}
        />

        <MenuItem
          icon={Award}
          title="Achievements"
          subtitle="Track your nutrition and fitness milestones"
          color={colors.success}
        />

        <MenuItem
          icon={Settings}
          title="App Settings"
          subtitle="Notifications, units, and preferences"
          color={colors.textTertiary}
        />

        <MenuItem
          icon={LogOut}
          title="Sign Out"
          onPress={() => Alert.alert('Sign Out', 'Are you sure you want to sign out?')}
          color={colors.error}
        />
      </ScrollView>
    </View>
  );
}