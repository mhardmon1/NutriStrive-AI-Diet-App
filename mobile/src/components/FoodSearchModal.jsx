import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { X, Search, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTheme from '@/utils/useTheme';
import apiService from '@/utils/api';
import offlineStorage from '@/utils/offlineStorage';

export default function FoodSearchModal({ visible, onClose, onSelectFood }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchFoods = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const cached = await offlineStorage.getCachedFoodSearchResults(query);
      if (cached) {
        setResults(cached.foods || []);
        setLoading(false);
        return;
      }

      const response = await apiService.searchFoods(query, 1, 25);

      setResults(response.foods || []);

      if (response.source === 'usda') {
        await offlineStorage.cacheFoodSearchResults(query, response);
      }
    } catch (err) {
      console.error('Food search error:', err);
      setError(err.message || 'Failed to search foods');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchFoods(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchFoods]);

  const handleSelectFood = (food) => {
    onSelectFood(food);
    onClose();
  };

  const renderFoodItem = ({ item }) => {
    const calories = item.nutrients?.calories || 0;
    const protein = item.nutrients?.protein || 0;

    return (
      <TouchableOpacity
        onPress={() => handleSelectFood(item)}
        style={{
          backgroundColor: colors.surfaceElevated,
          padding: 16,
          marginHorizontal: 20,
          marginBottom: 12,
          borderRadius: 12,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontWeight: '600',
              fontSize: 16,
              color: colors.text,
              marginBottom: 4,
            }}
          >
            {item.description}
          </Text>

          {item.brandName && (
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
            >
              {item.brandName}
            </Text>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 12,
                color: colors.textTertiary,
              }}
            >
              {Math.round(calories)} cal • {Math.round(protein)}g protein
            </Text>

            {item.dataType && (
              <View
                style={{
                  backgroundColor: colors.primary + '20',
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 8,
                  marginLeft: 8,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.primary,
                    fontWeight: '600',
                  }}
                >
                  {item.dataType}
                </Text>
              </View>
            )}
          </View>
        </View>

        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Plus size={16} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View
        style={{
          flex: 1,
          backgroundColor: colors.surfaceHighest,
        }}
      >
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
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: colors.text,
              }}
            >
              Search Foods
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

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surfaceElevated,
              borderRadius: 12,
              paddingHorizontal: 12,
            }}
          >
            <Search size={20} color={colors.textTertiary} />
            <TextInput
              style={{
                flex: 1,
                padding: 12,
                fontSize: 16,
                color: colors.text,
              }}
              placeholder="Search for foods..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {loading && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </View>
        </View>

        {error && (
          <View
            style={{
              backgroundColor: colors.error + '20',
              padding: 16,
              marginHorizontal: 20,
              marginTop: 16,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: colors.error, fontSize: 14 }}>{error}</Text>
          </View>
        )}

        {!loading && !error && results.length === 0 && searchQuery.length >= 2 && (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 40,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              No results found
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
              }}
            >
              Try a different search term
            </Text>
          </View>
        )}

        {searchQuery.length < 2 && (
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 40,
            }}
          >
            <Search size={48} color={colors.textTertiary} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: colors.text,
                marginTop: 16,
                marginBottom: 8,
                textAlign: 'center',
              }}
            >
              Search the USDA Database
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: 'center',
                lineHeight: 20,
              }}
            >
              Search over 600,000 foods from the USDA FoodData Central database
            </Text>
          </View>
        )}

        {results.length > 0 && (
          <FlatList
            data={results}
            renderItem={renderFoodItem}
            keyExtractor={(item, index) => `${item.fdcId || index}`}
            contentContainerStyle={{
              paddingTop: 20,
              paddingBottom: insets.bottom + 20,
            }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </Modal>
  );
}
