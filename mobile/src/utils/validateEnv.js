/**
 * Validates required environment variables for the mobile app
 */
export function validateEnvironment() {
  const requiredVars = [
    'EXPO_PUBLIC_PROJECT_GROUP_ID',
    'EXPO_PUBLIC_HOST',
    'EXPO_PUBLIC_BASE_URL',
    'EXPO_PUBLIC_PROXY_BASE_URL',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing);
    return {
      isValid: false,
      missing,
      error: `Missing environment variables: ${missing.join(', ')}`
    };
  }

  return {
    isValid: true,
    missing: [],
    error: null
  };
}

export function getAuthConfig() {
  const validation = validateEnvironment();
  
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  return {
    proxyURL: process.env.EXPO_PUBLIC_PROXY_BASE_URL,
    baseURL: process.env.EXPO_PUBLIC_BASE_URL,
    projectGroupId: process.env.EXPO_PUBLIC_PROJECT_GROUP_ID,
    host: process.env.EXPO_PUBLIC_HOST,
  };
}