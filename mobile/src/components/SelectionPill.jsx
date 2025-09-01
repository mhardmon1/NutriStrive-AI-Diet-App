import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import useTheme from '@/utils/useTheme';

export default function SelectionPill({ 
  title, 
  isSelected, 
  onPress, 
  variant = 'default',
  style = {} 
}) {
  const { colors } = useTheme();

  const getStyles = () => {
    if (variant === 'outlined') {
      return {
        backgroundColor: isSelected ? colors.primary : 'transparent',
        borderWidth: 1,
        borderColor: isSelected ? colors.primary : colors.border,
      };
    }
    
    return {
      backgroundColor: isSelected ? colors.categoryActive : colors.categoryInactive,
      borderWidth: 0,
    };
  };

  const getTextColor = () => {
    if (variant === 'outlined') {
      return isSelected ? '#FFFFFF' : colors.text;
    }
    
    return isSelected ? colors.categoryActiveText : colors.categoryInactiveText;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        {
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 20,
          marginRight: 8,
        },
        getStyles(),
        style,
      ]}
    >
      <Text
        style={{
          fontWeight: isSelected ? '600' : '500',
          fontSize: 14,
          color: getTextColor(),
        }}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}