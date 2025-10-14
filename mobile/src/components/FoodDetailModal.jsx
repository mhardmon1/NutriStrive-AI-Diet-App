import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { X, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTheme from '@/utils/useTheme';
import apiService from '@/utils/api';

export default function FoodDetailModal({ visible, food, onClose, onAdd }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [detailedFood, setDetailedFood] = useState(null);
  const [quantity, setQuantity] = useState('100');
  const [selectedPortion, setSelectedPortion] = useState(null);

  useEffect(() => {
    if (visible && food?.fdcId) {
      loadFoodDetails();
    }
  }, [visible, food]);

  const loadFoodDetails = async () => {
    try {
      setLoading(true);
      const response = await apiService.getFoodDetails(food.fdcId);
      setDetailedFood(response.food);
    } catch (error) {
      console.error('Failed to load food details:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNutrients = () => {
    if (!detailedFood) return null;

    const grams = parseFloat(quantity) || 0;
    const multiplier = grams / 100;

    const nutrients = detailedFood.nutrients || {};

    return {
      calories: (nutrients['Energy']?.value || 0) * multiplier,
      protein: (nutrients['Protein']?.value || 0) * multiplier,
      carbs: (nutrients['Carbohydrate, by difference']?.value || 0) * multiplier,
      fat: (nutrients['Total lipid (fat)']?.value || 0) * multiplier,
      fiber: (nutrients['Fiber, total dietary']?.value || 0) * multiplier,
      sugar: (nutrients['Sugars, total including NLEA']?.value || 0) * multiplier,
      sodium: (nutrients['Sodium, Na']?.value || 0) * multiplier,
    };
  };

  const handleAdd = () => {
    const grams = parseFloat(quantity) || 100;
    const calculated = calculateNutrients();

    const foodToAdd = {
      fdcId: detailedFood.fdcId,
      name: detailedFood.description,
      brandName: detailedFood.brandName,
      quantity_grams: grams,
      calories_per_100g: detailedFood.nutrients['Energy']?.value || 0,
      protein_per_100g: detailedFood.nutrients['Protein']?.value || 0,
      carbs_per_100g: detailedFood.nutrients['Carbohydrate, by difference']?.value || 0,
      fat_per_100g: detailedFood.nutrients['Total lipid (fat)']?.value || 0,
      ...calculated,
    };

    onAdd(foodToAdd);
    onClose();
  };

  const NutrientRow = ({ label, value, unit }) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ fontSize: 15, color: colors.text }}>{label}</Text>
      <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
        {Math.round(value * 10) / 10} {unit}
      </Text>
    </View>
  );

  if (!food) return null;

  const calculated = detailedFood ? calculateNutrients() : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View style={{ flex: 1, backgroundColor: colors.surfaceHighest }}>
        <View
          style={{
            paddingTop: insets.top + 16,
            paddingBottom: 16,
            paddingHorizontal: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700',
                color: colors.text,
                flex: 1,
                marginRight: 16,
              }}
            >
              Food Details
            </Text>

            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.surfaceElevated,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
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
              Loading details...
            </Text>
          </View>
        ) : (
          <>
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{
                paddingBottom: insets.bottom + 100,
              }}
              showsVerticalScrollIndicator={false}
            >
              <View style={{ padding: 20 }}>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: '700',
                    color: colors.text,
                    marginBottom: 8,
                  }}
                >
                  {food.description}
                </Text>

                {food.brandName && (
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.textSecondary,
                      marginBottom: 16,
                    }}
                  >
                    {food.brandName}
                  </Text>
                )}

                <View
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 20,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: 16,
                    }}
                  >
                    Serving Size
                  </Text>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TextInput
                      style={{
                        flex: 1,
                        backgroundColor: colors.surfaceElevated,
                        padding: 16,
                        borderRadius: 12,
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.text,
                        marginRight: 12,
                      }}
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                    />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.text,
                      }}
                    >
                      grams
                    </Text>
                  </View>
                </View>

                {calculated && (
                  <View
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 16,
                      padding: 20,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.text,
                        marginBottom: 16,
                      }}
                    >
                      Nutrition Facts
                    </Text>

                    <NutrientRow
                      label="Calories"
                      value={calculated.calories}
                      unit="kcal"
                    />
                    <NutrientRow
                      label="Protein"
                      value={calculated.protein}
                      unit="g"
                    />
                    <NutrientRow
                      label="Carbohydrates"
                      value={calculated.carbs}
                      unit="g"
                    />
                    <NutrientRow
                      label="Fat"
                      value={calculated.fat}
                      unit="g"
                    />
                    <NutrientRow
                      label="Fiber"
                      value={calculated.fiber}
                      unit="g"
                    />
                    <NutrientRow
                      label="Sugar"
                      value={calculated.sugar}
                      unit="g"
                    />
                    <NutrientRow
                      label="Sodium"
                      value={calculated.sodium}
                      unit="mg"
                    />
                  </View>
                )}
              </View>
            </ScrollView>

            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                paddingHorizontal: 20,
                paddingTop: 16,
                paddingBottom: insets.bottom + 16,
                backgroundColor: colors.surfaceHighest,
                borderTopWidth: 1,
                borderTopColor: colors.border,
              }}
            >
              <TouchableOpacity
                onPress={handleAdd}
                disabled={!detailedFood}
                style={{
                  backgroundColor: detailedFood
                    ? colors.primary
                    : colors.border,
                  paddingVertical: 16,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 16,
                    fontWeight: '600',
                  }}
                >
                  Add to Meal
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
