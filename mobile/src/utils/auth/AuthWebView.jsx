import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuthStore } from './store';

const callbackUrl = '/api/auth/token';
const callbackQueryString = `callbackUrl=${callbackUrl}`;

/**
 * This renders a WebView for authentication and handles both web and native platforms.
 */
export const AuthWebView = ({ mode, proxyURL, baseURL }) => {
  const [currentURI, setURI] = useState(`${baseURL}/account/${mode}?${callbackQueryString}`);
  const { auth, setAuth, isReady } = useAuthStore();
  const isAuthenticated = isReady ? !!auth : null;
  const iframeRef = useRef(null);
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    if (isAuthenticated) {
      router.back();
    }
  }, [isAuthenticated]);
   
  useEffect(() => {
    if (isAuthenticated) {
      return;
    }
    setURI(`${baseURL}/account/${mode}?${callbackQueryString}`);
  }, [mode, baseURL, isAuthenticated]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.addEventListener) {
      return;
    }
    const handleMessage = (event) => {
      // Verify the origin for security
      const allowedOrigins = [
        process.env.EXPO_PUBLIC_PROXY_BASE_URL,
        process.env.EXPO_PUBLIC_BASE_URL,
        'https://www.create.xyz', // Allow create.xyz origin
      ].filter(Boolean);
      
      // Allow localhost for development
      const isLocalhost = event.origin.includes('localhost') || event.origin.includes('127.0.0.1');
      const isAllowedOrigin = allowedOrigins.includes(event.origin) || isLocalhost;
      
      if (!isAllowedOrigin) {
        console.warn('Received message from unauthorized origin:', event.origin);
        return;
      }
      
      if (event.data.type === 'AUTH_SUCCESS') {
        console.log('Received AUTH_SUCCESS message');
        setAuth({
          jwt: event.data.jwt,
          user: event.data.user,
        });
      } else if (event.data.type === 'AUTH_ERROR') {
        console.error('Auth error:', event.data.error);
        // Don't automatically navigate back, let user handle the error
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [setAuth]);

  if (Platform.OS === 'web') {
    const handleIframeError = () => {
      console.error('Failed to load auth iframe');
      // Fallback to direct navigation on iframe error
      window.location.href = `${proxyURL}/account/${mode}?callbackUrl=/api/auth/expo-web-success`;
    };

    return (
      <iframe
        ref={iframeRef}
        title="Authentication"
        src={`${proxyURL}/account/${mode}?callbackUrl=/api/auth/expo-web-success`}
        style={{ width: '100%', height: '100%', border: 'none' }}
        onError={handleIframeError}
      />
    );
  }
   
  return (
    <WebView
      sharedCookiesEnabled
      source={{
        uri: currentURI,
      }}
      headers={{
        'x-createxyz-project-group-id': process.env.EXPO_PUBLIC_PROJECT_GROUP_ID,
        host: process.env.EXPO_PUBLIC_HOST,
        'x-forwarded-host': process.env.EXPO_PUBLIC_HOST,
        'x-createxyz-host': process.env.EXPO_PUBLIC_HOST,
      }}
      onError={(syntheticEvent) => {
        const { nativeEvent } = syntheticEvent;
        console.error('WebView error:', nativeEvent);
        // Handle WebView errors gracefully
        router.back();
      }}
      onShouldStartLoadWithRequest={(request) => {
        if (request.url === `${baseURL}${callbackUrl}`) {
          fetch(request.url)
            .then(async (response) => {
              if (!response.ok) {
                throw new Error(`Auth callback failed: ${response.status}`);
              }
              return response.json();
            })
            .then((data) => {
              if (data.jwt && data.user) {
                setAuth({ jwt: data.jwt, user: data.user });
              } else {
                throw new Error('Invalid auth response data');
              }
            })
            .catch((error) => {
              console.error('Auth callback error:', error);
              router.back();
            });
          return false;
        }
        if (request.url === currentURI) return true;

        // Add query string properly by checking if URL already has parameters
        const hasParams = request.url.includes('?');
        const separator = hasParams ? '&' : '?';
        const newURL = request.url.replaceAll(proxyURL, baseURL);
        if (newURL.endsWith(callbackUrl)) {
          setURI(newURL);
          return false;
        }
        setURI(`${newURL}${separator}${callbackQueryString}`);
        return false;
      }}
      style={{ flex: 1 }}
    />
  );
};