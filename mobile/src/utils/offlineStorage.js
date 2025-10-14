import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'nutristrive_cache_';
const PENDING_PREFIX = 'nutristrive_pending_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000;

class OfflineStorage {
  async getCachedData(key) {
    try {
      const cachedItem = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cachedItem) return null;

      const { data, timestamp } = JSON.parse(cachedItem);

      if (Date.now() - timestamp > CACHE_EXPIRY) {
        await this.removeCachedData(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting cached data:', error);
      return null;
    }
  }

  async setCachedData(key, data) {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now(),
      };

      await AsyncStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify(cacheItem)
      );
    } catch (error) {
      console.error('Error setting cached data:', error);
    }
  }

  async removeCachedData(key) {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Error removing cached data:', error);
    }
  }

  async clearAllCache() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  async addPendingSync(operation, data) {
    try {
      const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const pendingItem = {
        id,
        operation,
        data,
        timestamp: Date.now(),
        retryCount: 0,
      };

      await AsyncStorage.setItem(
        `${PENDING_PREFIX}${id}`,
        JSON.stringify(pendingItem)
      );

      return id;
    } catch (error) {
      console.error('Error adding pending sync:', error);
      return null;
    }
  }

  async getPendingSyncs() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pendingKeys = keys.filter(key => key.startsWith(PENDING_PREFIX));

      const pendingItems = await AsyncStorage.multiGet(pendingKeys);

      return pendingItems
        .map(([key, value]) => {
          try {
            return JSON.parse(value);
          } catch {
            return null;
          }
        })
        .filter(item => item !== null)
        .sort((a, b) => a.timestamp - b.timestamp);
    } catch (error) {
      console.error('Error getting pending syncs:', error);
      return [];
    }
  }

  async removePendingSync(id) {
    try {
      await AsyncStorage.removeItem(`${PENDING_PREFIX}${id}`);
    } catch (error) {
      console.error('Error removing pending sync:', error);
    }
  }

  async updatePendingSync(id, updates) {
    try {
      const key = `${PENDING_PREFIX}${id}`;
      const existing = await AsyncStorage.getItem(key);

      if (existing) {
        const pendingItem = JSON.parse(existing);
        const updated = { ...pendingItem, ...updates };
        await AsyncStorage.setItem(key, JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error updating pending sync:', error);
    }
  }

  async clearPendingSyncs() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pendingKeys = keys.filter(key => key.startsWith(PENDING_PREFIX));
      await AsyncStorage.multiRemove(pendingKeys);
    } catch (error) {
      console.error('Error clearing pending syncs:', error);
    }
  }

  async cacheUserProfile(profile) {
    await this.setCachedData('user_profile', profile);
  }

  async getCachedUserProfile() {
    return await this.getCachedData('user_profile');
  }

  async cacheDashboardData(date, data) {
    await this.setCachedData(`dashboard_${date}`, data);
  }

  async getCachedDashboardData(date) {
    return await this.getCachedData(`dashboard_${date}`);
  }

  async cacheFoodSearchResults(query, results) {
    await this.setCachedData(`food_search_${query}`, results);
  }

  async getCachedFoodSearchResults(query) {
    return await this.getCachedData(`food_search_${query}`);
  }

  async cacheRecentFoods(foods) {
    await this.setCachedData('recent_foods', foods);
  }

  async getCachedRecentFoods() {
    return await this.getCachedData('recent_foods');
  }
}

export default new OfflineStorage();
