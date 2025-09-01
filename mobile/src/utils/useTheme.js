import { useColorScheme } from 'react-native';

export default function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    isDark,
    // Core colors
    primary: '#3366FF',
    primaryGradientStart: '#3366FF',
    primaryGradientEnd: '#8B5CF6',
    success: '#4CAF50',
    successGradientStart: '#4CAF50',
    successGradientEnd: '#66BB6A',
    warning: '#FF9500',
    warningBackground: isDark ? 'rgba(255, 149, 0, 0.2)' : '#FFF3E0',
    error: '#F44336',
    
    // Surface colors
    background: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#1C1C1E' : '#FFFFFF',
    surfaceElevated: isDark ? '#2C2C2E' : '#F2F2F7',
    surfaceHighest: isDark ? '#000000' : '#F2F2F7',
    
    // Text colors
    text: isDark ? '#FFFFFF' : '#000000',
    textSecondary: isDark ? '#8E8E93' : '#6C6C70',
    textTertiary: isDark ? '#48484A' : '#8E8E93',
    
    // Border colors
    border: isDark ? '#38383A' : '#E5E5EA',
    
    // Category colors
    categoryActive: '#3366FF',
    categoryActiveText: '#FFFFFF',
    categoryInactive: isDark ? '#2C2C2E' : '#F2F2F7',
    categoryInactiveText: isDark ? '#8E8E93' : '#6C6C70',
    
    // Feature specific colors
    nutrition: '#8B5CF6',
    hydration: '#06B6D4',
    fitness: '#10B981',
    calories: '#F59E0B',
    
    // Notification
    notification: '#FF3B30',
  };

  return { colors, isDark };
}