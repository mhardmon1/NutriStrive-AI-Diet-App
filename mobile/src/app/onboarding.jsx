import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import {
  User,
  Scale,
  Ruler,
  Calendar,
  Activity,
  Target,
  ChevronRight,
  ChevronLeft,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";
import SelectionPill from "@/components/SelectionPill";
import useTheme from "@/utils/useTheme";
import useUser from "@/utils/auth/useUser";

const STEPS = [
  { id: 'basic', title: 'Basic Info', icon: User },
  { id: 'physical', title: 'Physical Stats', icon: Scale },
  { id: 'goals', title: 'Goals & Sport', icon: Target },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { refetch: refetchUser } = useUser();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    sex: '',
    dateOfBirth: '',
    heightCm: '',
    weightKg: '',
    sport: '',
    position: '',
    goals: '',
    activityLevel: '',
  });

  const scrollViewRef = useRef(null);
  const focusedPadding = 12;
  const paddingAnimation = useRef(
    new Animated.Value(insets.bottom + focusedPadding)
  ).current;

  const animateTo = (value) => {
    Animated.timing(paddingAnimation, {
      toValue: value,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputFocus = () => {
    if (Platform.OS === 'web') return;
    animateTo(focusedPadding);
  };

  const handleInputBlur = () => {
    if (Platform.OS === 'web') return;
    animateTo(insets.bottom + focusedPadding);
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 0: // Basic Info
        return formData.name.trim() && formData.sex;
      case 1: // Physical Stats
        return formData.heightCm && formData.weightKg;
      case 2: // Goals
        return formData.sport && formData.goals.trim();
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      Alert.alert('Required Fields', 'Please fill in all required fields before continuing.');
      return;
    }
    
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const completeOnboarding = async () => {
    try {
      setLoading(true);
      
      // Calculate birth year from age if provided
      let dateOfBirth = null;
      if (formData.dateOfBirth) {
        const age = parseInt(formData.dateOfBirth);
        if (age > 0 && age < 120) {
          const currentYear = new Date().getFullYear();
          const birthYear = currentYear - age;
          dateOfBirth = `${birthYear}-01-01`;
        }
      }

      const response = await fetch('/api/users/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          sex: formData.sex,
          date_of_birth: dateOfBirth,
          height_cm: parseInt(formData.heightCm),
          weight_kg: parseFloat(formData.weightKg),
          sport: formData.sport,
          position: formData.position || null,
          goals: formData.goals,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save profile');
      }

      // Create initial nutrition targets based on user data
      const targetsResponse = await fetch('/api/users/targets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight_kg: parseFloat(formData.weightKg),
          height_cm: parseInt(formData.heightCm),
          sex: formData.sex,
          activity_level: formData.activityLevel || 'moderate',
        }),
      });

      if (!targetsResponse.ok) {
        console.warn('Failed to create nutrition targets');
      }

      await refetchUser();
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Error', 'Failed to save your profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 32 }}>
      {STEPS.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        
        return (
          <View key={step.id} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isActive 
                  ? colors.primary 
                  : isCompleted 
                    ? colors.success 
                    : colors.surfaceElevated,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 4,
              }}
            >
              <step.icon 
                size={20} 
                color={isActive || isCompleted ? '#FFFFFF' : colors.textTertiary} 
              />
            </View>
            {index < STEPS.length - 1 && (
              <View
                style={{
                  width: 24,
                  height: 2,
                  backgroundColor: isCompleted ? colors.success : colors.border,
                  marginHorizontal: 4,
                }}
              />
            )}
          </View>
        );
      })}
    </View>
  );

  const renderBasicInfo = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
        Let's get to know you
      </Text>
      <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 32 }}>
        We'll use this info to personalize your nutrition plan
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          What's your name? *
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.surfaceElevated,
            padding: 16,
            borderRadius: 12,
            fontSize: 16,
            color: colors.text,
          }}
          placeholder="Enter your name"
          placeholderTextColor={colors.textTertiary}
          value={formData.name}
          onChangeText={(value) => updateFormData('name', value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Gender *
        </Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <SelectionPill
            text="Male"
            selected={formData.sex === 'male'}
            onPress={() => updateFormData('sex', 'male')}
            style={{ flex: 1 }}
          />
          <SelectionPill
            text="Female"
            selected={formData.sex === 'female'}
            onPress={() => updateFormData('sex', 'female')}
            style={{ flex: 1 }}
          />
        </View>
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Age (optional)
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.surfaceElevated,
            padding: 16,
            borderRadius: 12,
            fontSize: 16,
            color: colors.text,
          }}
          placeholder="e.g. 25"
          placeholderTextColor={colors.textTertiary}
          value={formData.dateOfBirth}
          onChangeText={(value) => updateFormData('dateOfBirth', value)}
          keyboardType="numeric"
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </View>
    </View>
  );

  const renderPhysicalStats = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
        Physical Stats
      </Text>
      <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 32 }}>
        This helps us calculate your nutrition needs
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Height (cm) *
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.surfaceElevated,
            padding: 16,
            borderRadius: 12,
            fontSize: 16,
            color: colors.text,
          }}
          placeholder="e.g. 175"
          placeholderTextColor={colors.textTertiary}
          value={formData.heightCm}
          onChangeText={(value) => updateFormData('heightCm', value)}
          keyboardType="numeric"
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Weight (kg) *
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.surfaceElevated,
            padding: 16,
            borderRadius: 12,
            fontSize: 16,
            color: colors.text,
          }}
          placeholder="e.g. 70"
          placeholderTextColor={colors.textTertiary}
          value={formData.weightKg}
          onChangeText={(value) => updateFormData('weightKg', value)}
          keyboardType="numeric"
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Activity Level
        </Text>
        <View style={{ gap: 8 }}>
          {[
            { id: 'low', label: 'Low - Sedentary lifestyle' },
            { id: 'moderate', label: 'Moderate - Exercise 2-3 times/week' },
            { id: 'high', label: 'High - Exercise 4+ times/week' },
            { id: 'athlete', label: 'Athlete - Daily training' },
          ].map((level) => (
            <SelectionPill
              key={level.id}
              text={level.label}
              selected={formData.activityLevel === level.id}
              onPress={() => updateFormData('activityLevel', level.id)}
            />
          ))}
        </View>
      </View>
    </View>
  );

  const renderGoals = () => (
    <View style={{ paddingHorizontal: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: '700', color: colors.text, marginBottom: 8 }}>
        Goals & Sport
      </Text>
      <Text style={{ fontSize: 16, color: colors.textSecondary, marginBottom: 32 }}>
        Tell us about your athletic goals
      </Text>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Primary Sport *
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.surfaceElevated,
            padding: 16,
            borderRadius: 12,
            fontSize: 16,
            color: colors.text,
          }}
          placeholder="e.g. Basketball, Soccer, Swimming"
          placeholderTextColor={colors.textTertiary}
          value={formData.sport}
          onChangeText={(value) => updateFormData('sport', value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          Position (optional)
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.surfaceElevated,
            padding: 16,
            borderRadius: 12,
            fontSize: 16,
            color: colors.text,
          }}
          placeholder="e.g. Point Guard, Midfielder"
          placeholderTextColor={colors.textTertiary}
          value={formData.position}
          onChangeText={(value) => updateFormData('position', value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </View>

      <View style={{ marginBottom: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 }}>
          What are your goals? *
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.surfaceElevated,
            padding: 16,
            borderRadius: 12,
            fontSize: 16,
            color: colors.text,
            minHeight: 100,
          }}
          placeholder="e.g. Improve performance, build muscle, lose weight..."
          placeholderTextColor={colors.textTertiary}
          value={formData.goals}
          onChangeText={(value) => updateFormData('goals', value)}
          multiline
          textAlignVertical="top"
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
        />
      </View>
    </View>
  );

  const renderContent = () => {
    switch (currentStep) {
      case 0:
        return renderBasicInfo();
      case 1:
        return renderPhysicalStats();
      case 2:
        return renderGoals();
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingAnimatedView style={{ flex: 1 }} behavior="padding">
      <View style={{ flex: 1, backgroundColor: colors.surfaceHighest }}>
        <StatusBar style={isDark ? "light" : "dark"} />

        {/* Header */}
        <View
          style={{
            paddingTop: insets.top + 20,
            paddingHorizontal: 20,
            paddingBottom: 20,
            backgroundColor: colors.surfaceHighest,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {currentStep > 0 ? (
              <TouchableOpacity
                onPress={prevStep}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: colors.surfaceElevated,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ChevronLeft size={20} color={colors.text} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}
            
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textSecondary }}>
              {currentStep + 1} of {STEPS.length}
            </Text>
            
            <TouchableOpacity
              onPress={() => router.replace('/(tabs)')}
              style={{ padding: 8 }}
            >
              <Text style={{ fontSize: 14, color: colors.textTertiary }}>Skip</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {renderStepIndicator()}
          {renderContent()}
        </ScrollView>

        {/* Footer */}
        <Animated.View
          style={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: paddingAnimation,
            backgroundColor: colors.surfaceHighest,
          }}
        >
          <TouchableOpacity
            onPress={nextStep}
            disabled={loading || !validateStep(currentStep)}
            style={{
              backgroundColor: validateStep(currentStep) ? colors.primary : colors.border,
              padding: 16,
              borderRadius: 12,
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                color: validateStep(currentStep) ? '#FFFFFF' : colors.textTertiary,
                fontSize: 16,
                fontWeight: '600',
                marginRight: 8,
              }}
            >
              {loading ? 'Saving...' : currentStep === STEPS.length - 1 ? 'Complete Setup' : 'Continue'}
            </Text>
            {!loading && <ChevronRight size={20} color={validateStep(currentStep) ? '#FFFFFF' : colors.textTertiary} />}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingAnimatedView>
  );
}