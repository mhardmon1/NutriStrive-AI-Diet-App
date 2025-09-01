import React, { useEffect, useRef, useState } from 'react';
import { Modal, View } from 'react-native';
import { create } from 'zustand';
import { useCallback, useMemo } from 'react';
import { AuthWebView } from './AuthWebView';
import { useAuthStore, useAuthModal } from './store';
import { getAuthConfig } from '@/utils/validateEnv';


/**
 * This component renders a modal for authentication purposes.
 * To show it programmatically, you should either use the `useRequireAuth` hook or the `useAuthModal` hook.
 *
 * @example
 * ```js
 * import { useAuthModal } from '@/utils/useAuthModal';
 * function MyComponent() {
 * const { open } = useAuthModal();
 * return <Button title="Login" onPress={() => open({ mode: 'signin' })} />;
 * }
 * ```
 *
 * @example
 * ```js
 * import { useRequireAuth } from '@/utils/useAuth';
 * function MyComponent() {
 *   // automatically opens the auth modal if the user is not authenticated
 *   useRequireAuth();
 *   return <Text>Protected Content</Text>;
 * }
 *
 */
export const AuthModal = () => {
  const { isOpen, mode, close } = useAuthModal();
  const { auth } = useAuthStore();
  const [authConfig, setAuthConfig] = useState(null);
  const [configError, setConfigError] = useState(null);

  const snapPoints = useMemo(() => ['100%'], []);
   
  useEffect(() => {
    try {
      const config = getAuthConfig();
      setAuthConfig(config);
      setConfigError(null);
    } catch (error) {
      console.error('Auth configuration error:', error);
      setConfigError(error.message);
    }
  }, []);

  if (configError) {
    return (
      <Modal visible={isOpen} transparent={true} animationType="slide">
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 20,
        }}>
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 20,
            maxWidth: 300,
            width: '100%',
          }}>
            <Text style={{
              fontSize: 18,
              fontWeight: '600',
              color: '#000',
              marginBottom: 12,
              textAlign: 'center',
            }}>
              Configuration Error
            </Text>
            <Text style={{
              fontSize: 14,
              color: '#666',
              textAlign: 'center',
              marginBottom: 20,
            }}>
              {configError}
            </Text>
            <TouchableOpacity
              onPress={close}
              style={{
                backgroundColor: '#007AFF',
                padding: 12,
                borderRadius: 8,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  if (!authConfig) {
    return null;
  }
  // Close modal when user becomes authenticated
  useEffect(() => {
    if (auth && isOpen) {
      close();
    }
  }, [auth, isOpen, close]);
  return (
    <Modal
      visible={isOpen && !auth}
      transparent={true}
      animationType="slide"
      onRequestClose={close}
    >
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '100%',
          width: '100%',
          backgroundColor: '#fff',
          padding: 0,
        }}
      >
        <AuthWebView
          mode={mode}
          proxyURL={authConfig.proxyURL}
          baseURL={authConfig.baseURL}
        />
      </View>
    </Modal>
  );
};

export default useAuthModal;