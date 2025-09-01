import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useCallback, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { Modal, View } from 'react-native';
import { useAuthModal, useAuthStore, authKey } from './store';


/**
 * This hook provides authentication functionality.
 * It may be easier to use the `useAuthModal` or `useRequireAuth` hooks
 * instead as those will also handle showing authentication to the user
 * directly.
 */
export const useAuth = () => {
  const { isReady, auth, setAuth } = useAuthStore();
  const { isOpen, close, open } = useAuthModal();

  const initiate = useCallback(() => {
    SecureStore.getItemAsync(authKey)
      .then((authData) => {
        try {
          const auth = authData ? JSON.parse(authData) : null;
          useAuthStore.setState({
            auth,
            isReady: true,
          });
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          // Clear corrupted auth data
          SecureStore.deleteItemAsync(authKey);
          useAuthStore.setState({
            auth: null,
            isReady: true,
          });
        }
      })
      .catch((error) => {
        console.error('Error retrieving auth data:', error);
        useAuthStore.setState({
          auth: null,
          isReady: true,
        });
      });
  }, []);

  useEffect(() => {
    // Listen for auth success messages from WebView
    const handleMessage = (event) => {
      if (event.data?.type === 'AUTH_SUCCESS') {
        setAuth({
          jwt: event.data.jwt,
          user: event.data.user,
        });
        close();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, [setAuth, close]);

  const signIn = useCallback(() => {
    open({ mode: 'signin' });
  }, [open]);
  const signUp = useCallback(() => {
    open({ mode: 'signup' });
  }, [open]);

  const signOut = useCallback(() => {
    setAuth(null);
    close();
    // Clear any cached user data
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
      localStorage.clear();
    }
    // Navigate back to index
    router.replace('/');
  }, [close]);

  return {
    isReady,
    isAuthenticated: isReady ? !!auth : null,
    signIn,
    signOut,
    signUp,
    auth,
    setAuth,
    initiate,
  };
};

/**
 * This hook will automatically open the authentication modal if the user is not authenticated.
 */
export const useRequireAuth = (options) => {
  const { isAuthenticated, isReady } = useAuth();
  const { open } = useAuthModal();

  useEffect(() => {
    if (!isAuthenticated && isReady) {
      open({ mode: options?.mode });
    }
  }, [isAuthenticated, open, options?.mode, isReady]);
};

export default useAuth;