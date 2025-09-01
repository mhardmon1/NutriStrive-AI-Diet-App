import React, { useEffect, useRef, useState } from 'react';
import { Modal, View } from 'react-native';
import { create } from 'zustand';
import { useCallback, useMemo } from 'react';
import { AuthWebView } from './AuthWebView';
import { useAuthStore, useAuthModal } from './store';
import { getAuthConfig } from '../validateEnv';


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
    console.error('Auth configuration error:', configError);
    return null;
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