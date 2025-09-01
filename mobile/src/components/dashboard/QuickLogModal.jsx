import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import useTheme from "@/utils/useTheme";

export default function QuickLogModal({
  visible,
  onClose,
  logType,
  onLogSuccess,
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [logText, setLogText] = useState("");
  const [logAmount, setLogAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setLogText("");
    setLogAmount("");
    onClose();
  };

  const quickLogFood = async () => {
    if (!logText.trim()) {
      Alert.alert("Error", "Please describe the food");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/nutrition/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: logText }),
      });
      if (!response.ok) throw new Error("Failed to analyze food");

      const analysis = await response.json();
      const mealResponse = await fetch("/api/nutrition/log-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          meal_type: "snack",
          foods: analysis.foods,
          date: new Date().toISOString().split("T")[0],
        }),
      });
      if (!mealResponse.ok) throw new Error("Failed to log meal");

      handleClose();
      onLogSuccess();
      Alert.alert("Success", "Food logged successfully!");
    } catch (error) {
      console.error("Error logging food:", error);
      Alert.alert("Error", "Failed to log food");
    } finally {
      setLoading(false);
    }
  };

  const quickLogHydration = async () => {
    const amount = parseInt(logAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount in ML");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/hydration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: 1,
          amount_ml: amount,
          date: new Date().toISOString().split("T")[0],
        }),
      });
      if (!response.ok) throw new Error("Failed to log hydration");

      handleClose();
      onLogSuccess();
      Alert.alert("Success", "Hydration logged successfully!");
    } catch (error) {
      console.error("Error logging hydration:", error);
      Alert.alert("Error", "Failed to log hydration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
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
              paddingBottom: Math.max(insets.bottom + 20, 34),
              maxHeight: "80%",
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
                style={{ fontSize: 18, fontWeight: "600", color: colors.text }}
              >
                Quick Log {logType === "food" ? "Food" : "Hydration"}
              </Text>
              <TouchableOpacity onPress={handleClose}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            {logType === "food" ? (
              <>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    marginBottom: 12,
                  }}
                >
                  Describe what you ate
                </Text>
                <TextInput
                  style={{
                    backgroundColor: colors.surfaceElevated,
                    padding: 16,
                    borderRadius: 12,
                    fontSize: 16,
                    color: colors.text,
                    marginBottom: 20,
                    minHeight: 80,
                    maxHeight: 120,
                  }}
                  placeholder="e.g. grilled chicken breast with rice and vegetables"
                  placeholderTextColor={colors.textTertiary}
                  value={logText}
                  onChangeText={setLogText}
                  multiline
                  autoFocus
                />
                <TouchableOpacity
                  onPress={quickLogFood}
                  disabled={loading}
                  style={{
                    backgroundColor: colors.primary,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    {loading ? "Analyzing..." : "Log Food"}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
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
                    marginBottom: 12,
                  }}
                  placeholder="e.g. 250"
                  placeholderTextColor={colors.textTertiary}
                  value={logAmount}
                  onChangeText={setLogAmount}
                  keyboardType="numeric"
                  autoFocus
                />
                <View
                  style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}
                >
                  {[250, 500, 750, 1000].map((amount) => (
                    <TouchableOpacity
                      key={amount}
                      onPress={() => setLogAmount(amount.toString())}
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
                  onPress={quickLogHydration}
                  disabled={loading}
                  style={{
                    backgroundColor: colors.primary,
                    padding: 16,
                    borderRadius: 12,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 16,
                      fontWeight: "600",
                    }}
                  >
                    Log Water
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
