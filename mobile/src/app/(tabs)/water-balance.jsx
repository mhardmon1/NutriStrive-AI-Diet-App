import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Droplet, Clock3, Plus, X } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import useTheme from "@/utils/useTheme";
import SelectionPill from "@/components/SelectionPill";

export default function WaterBalanceScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState("Daily");
  const [hydrationData, setHydrationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHeaderBorder, setShowHeaderBorder] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const scrollViewRef = React.useRef(null);

  const periods = ["Daily", "Weekly", "Monthly"];

  useEffect(() => {
    fetchHydrationData();
  }, []);

  const fetchHydrationData = async () => {
    try {
      setLoading(true);

      const today = new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/hydration?userId=1&date=${today}`);
      const data = await response.json();
      setHydrationData(data);
    } catch (error) {
      console.error("Error fetching hydration data:", error);
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

  const addHydration = async () => {
    const amount = parseInt(newAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }

    try {
      const response = await fetch("/api/hydration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          amount_ml: amount,
          date: new Date().toISOString().split("T")[0],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to log hydration");
      }

      setShowAddModal(false);
      setNewAmount("");
      fetchHydrationData(); // Refresh data
    } catch (error) {
      console.error("Error adding hydration:", error);
      Alert.alert("Error", "Failed to log hydration");
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const HydrationTipBanner = () => (
    <LinearGradient
      colors={[colors.primaryGradientStart, colors.primaryGradientEnd]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        borderRadius: 12,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 20,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Bubble pattern */}
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "100%",
          height: "100%",
        }}
      >
        {[...Array(12)].map((_, i) => {
          const size = Math.random() * 20 + 10;
          const top = Math.random() * 80;
          const right = Math.random() * 40;
          return (
            <View
              key={i}
              style={{
                position: "absolute",
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: "rgba(255, 255, 255, 0.15)",
                top: `${top}%`,
                right: `${right}%`,
              }}
            />
          );
        })}
      </View>

      <Text
        style={{
          color: "#FFFFFF",
          fontWeight: "400",
          fontSize: 14,
          lineHeight: 20,
          textAlign: "center",
        }}
      >
        Humans need to consume about {hydrationData?.target || 2500} ml of water
        daily to stay properly hydrated.
      </Text>
    </LinearGradient>
  );

  const HydrateCard = () => {
    if (!hydrationData) return null;

    const progress = Math.min(
      (hydrationData.total / hydrationData.target) * 100,
      100,
    );

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 24,
          marginHorizontal: 20,
          marginBottom: 20,
        }}
      >
        {/* Header Row */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
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
            <Text
              style={{
                fontWeight: "500",
                fontSize: 14,
                color: colors.text,
              }}
            >
              Hydrate
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text
              style={{
                fontWeight: "700",
                fontSize: 40,
                color: colors.text,
                lineHeight: 44,
              }}
            >
              {hydrationData.total}
            </Text>
            <Text
              style={{
                fontWeight: "400",
                fontSize: 14,
                color: colors.textSecondary,
                marginLeft: 4,
              }}
            >
              ML
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              height: 8,
              backgroundColor: colors.border,
              borderRadius: 4,
              overflow: "hidden",
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

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                fontWeight: "400",
                fontSize: 12,
                color: colors.textTertiary,
              }}
            >
              0 ML
            </Text>
            <Text
              style={{
                fontWeight: "400",
                fontSize: 12,
                color: colors.textTertiary,
              }}
            >
              {hydrationData.target} ML Goal
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const ConsumptionLogItem = ({ time, amount, isOld = false }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        opacity: isOld ? 0.5 : 1,
      }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.border,
          alignItems: "center",
          justifyContent: "center",
          marginRight: 12,
        }}
      >
        <Clock3 size={24} color={colors.textTertiary} />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontWeight: "500",
            fontSize: 14,
            color: colors.text,
            marginBottom: 2,
          }}
        >
          Water Consumption
        </Text>
        <Text
          style={{
            fontWeight: "400",
            fontSize: 12,
            color: colors.textTertiary,
          }}
        >
          {time}
        </Text>
      </View>

      <Text
        style={{
          fontWeight: "600",
          fontSize: 14,
          color: colors.text,
        }}
      >
        {amount} ML
      </Text>
    </View>
  );

  const AddHydrationModal = () => (
    <Modal
      visible={showAddModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowAddModal(false)}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: insets.bottom + 20,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              Add Water Intake
            </Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              marginBottom: 12,
            }}
          >
            Amount (ML)
          </Text>

          <TextInput
            style={{
              backgroundColor: colors.surfaceElevated,
              padding: 16,
              borderRadius: 12,
              fontSize: 16,
              color: colors.text,
              marginBottom: 20,
            }}
            placeholder="e.g. 250"
            placeholderTextColor={colors.textTertiary}
            value={newAmount}
            onChangeText={setNewAmount}
            keyboardType="numeric"
            autoFocus
          />

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
            {[250, 500, 750, 1000].map((amount) => (
              <TouchableOpacity
                key={amount}
                onPress={() => setNewAmount(amount.toString())}
                style={{
                  flex: 1,
                  backgroundColor: colors.surfaceElevated,
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.text, fontWeight: "500" }}>
                  {amount}ml
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={addHydration}
            style={{
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: "#FFFFFF",
                fontSize: 16,
                fontWeight: "600",
              }}
            >
              Add Water Intake
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const EmptyState = () => (
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
        <Droplet size={40} color={colors.textTertiary} />
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
        No hydration logged today
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
        Start tracking your water intake to stay hydrated throughout the day
      </Text>

      <TouchableOpacity
        onPress={() => setShowAddModal(true)}
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
          Log Water Intake
        </Text>
      </TouchableOpacity>
    </View>
  );

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
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  const hasLogs = hydrationData?.logs && hydrationData.logs.length > 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.surfaceHighest }}>
      <StatusBar style={colors.isDark ? "light" : "dark"} />

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
          Water Balance
        </Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 24 + 28 + 24 + 24, // Header height + title + padding + extra spacing
          paddingBottom: insets.bottom + 120, // Space for floating bottom bar
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Period Selector */}
        <ScrollView
          horizontal
          style={{ marginBottom: 20 }}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          showsHorizontalScrollIndicator={false}
        >
          {periods.map((period) => (
            <SelectionPill
              key={period}
              title={period}
              isSelected={selectedPeriod === period}
              onPress={() => setSelectedPeriod(period)}
              variant="outlined"
            />
          ))}
        </ScrollView>

        {/* Hydration Tip Banner */}
        <HydrationTipBanner />

        {/* Main Hydrate Card */}
        <HydrateCard />

        {/* Consumption Log - Conditional rendering */}
        {hasLogs ? (
          hydrationData.logs.map((log, index) => {
            const isOld = index >= 1; // Mark items after the first as "old"
            return (
              <ConsumptionLogItem
                key={index}
                time={formatTime(log.logged_at)}
                amount={log.amount_ml}
                isOld={isOld}
              />
            );
          })
        ) : (
          <EmptyState />
        )}
      </ScrollView>

      {/* Floating Bottom Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          paddingTop: 16,
          paddingBottom: insets.bottom + 16,
          paddingHorizontal: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <Plus size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text
            style={{
              fontWeight: "600",
              fontSize: 16,
              color: "#FFFFFF",
            }}
          >
            Add New Hydration
          </Text>
        </TouchableOpacity>
      </View>

      <AddHydrationModal />
    </View>
  );
}
