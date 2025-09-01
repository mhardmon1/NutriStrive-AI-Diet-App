import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { AlertTriangle, RefreshCw } from 'lucide-react-native';
import useTheme from '@/utils/useTheme';
import { useAuth } from './useAuth';

export class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Auth Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <AuthErrorFallback error={this.state.error} onRetry={this.props.onRetry} />;
    }

    return this.props.children;
  }
}

function AuthErrorFallback({ error, onRetry }) {
  const { colors } = useTheme();
  const { signOut } = useAuth();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      // Default retry behavior
      window.location.reload();
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'This will clear your session and return you to the sign-in screen.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: () => signOut()
        }
      ]
    );
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surfaceHighest,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
      }}
    >
      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.error + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 24,
        }}
      >
        <AlertTriangle size={40} color={colors.error} />
      </View>

      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: colors.text,
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        Authentication Error
      </Text>

      <Text
        style={{
          fontSize: 16,
          color: colors.textSecondary,
          textAlign: 'center',
          lineHeight: 22,
          marginBottom: 32,
        }}
      >
        {error?.message || 'Something went wrong with authentication. Please try again.'}
      </Text>

      <View style={{ width: '100%', gap: 12 }}>
        <TouchableOpacity
          onPress={handleRetry}
          style={{
            backgroundColor: colors.primary,
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RefreshCw size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            Try Again
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSignOut}
          style={{
            backgroundColor: 'transparent',
            paddingVertical: 16,
            paddingHorizontal: 24,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 16,
              fontWeight: '600',
            }}
          >
            Sign Out
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default AuthErrorBoundary;