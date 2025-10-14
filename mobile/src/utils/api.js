import * as SecureStore from 'expo-secure-store';
import NetInfo from '@react-native-community/netinfo';

const API_TIMEOUT = 30000;

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

class APIService {
  constructor() {
    this.baseURL = process.env.EXPO_PUBLIC_BASE_URL || '';
    this.authKey = `${process.env.EXPO_PUBLIC_PROJECT_GROUP_ID}-jwt`;
    this.requestQueue = [];
    this.isOnline = true;

    this.setupNetworkListener();
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected && state.isInternetReachable;

      if (wasOffline && this.isOnline) {
        this.processQueue();
      }
    });
  }

  async getAuthToken() {
    try {
      const auth = await SecureStore.getItemAsync(this.authKey);
      if (auth) {
        const parsed = JSON.parse(auth);
        return parsed.jwt;
      }
    } catch (error) {
      console.error('Failed to get auth token:', error);
    }
    return null;
  }

  async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || API_TIMEOUT);

    try {
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected || !networkState.isInternetReachable) {
        throw new APIError('No internet connection', 0, { offline: true });
      }

      const token = await this.getAuthToken();
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const contentType = response.headers.get('content-type');
      const isJSON = contentType && contentType.includes('application/json');

      let data;
      if (isJSON) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        throw new APIError(
          data.error || data.message || 'Request failed',
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeout);

      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408, { timeout: true });
      }

      if (error instanceof APIError) {
        throw error;
      }

      throw new APIError(
        error.message || 'Network request failed',
        0,
        { originalError: error }
      );
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async retryRequest(request, maxRetries = 3, delay = 1000) {
    let lastError;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await request();
      } catch (error) {
        lastError = error;

        if (error.status >= 400 && error.status < 500) {
          throw error;
        }

        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }

  queueRequest(request) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ request, resolve, reject });
    });
  }

  async processQueue() {
    while (this.requestQueue.length > 0 && this.isOnline) {
      const { request, resolve, reject } = this.requestQueue.shift();

      try {
        const result = await request();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
  }

  searchFoods(query, page = 1, pageSize = 25) {
    const params = new URLSearchParams({
      query,
      pageNumber: page.toString(),
      pageSize: pageSize.toString(),
    });

    return this.get(`/api/food/search?${params.toString()}`);
  }

  getFoodDetails(fdcId) {
    return this.get(`/api/food/details?fdcId=${fdcId}`);
  }

  getUserProfile() {
    return this.get('/api/users/profile');
  }

  updateUserProfile(data) {
    return this.post('/api/users/profile', data);
  }

  getDailySummary(date) {
    const params = new URLSearchParams({ date });
    return this.get(`/api/nutrition/daily-summary?${params.toString()}`);
  }

  logMeal(mealData) {
    return this.post('/api/nutrition/log-meal', mealData);
  }

  analyzeFood(data) {
    return this.post('/api/nutrition/analyze-food', data);
  }

  optimizeMeal(mealData) {
    return this.post('/api/nutrition/optimize-meal', mealData);
  }

  getWorkouts(date) {
    const params = new URLSearchParams({ date });
    return this.get(`/api/workouts?${params.toString()}`);
  }

  logWorkout(workoutData) {
    return this.post('/api/workouts', workoutData);
  }

  getHydration(date) {
    const params = new URLSearchParams({ date });
    return this.get(`/api/hydration?${params.toString()}`);
  }

  logHydration(amount) {
    return this.post('/api/hydration', { amount_ml: amount });
  }

  async checkConnectivity() {
    const state = await NetInfo.fetch();
    return state.isConnected && state.isInternetReachable;
  }
}

export default new APIService();
export { APIError };
