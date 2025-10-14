import apiService from './api';
import offlineStorage from './offlineStorage';
import { toast } from 'sonner-native';

class SyncService {
  constructor() {
    this.isSyncing = false;
    this.syncListeners = [];
  }

  addSyncListener(callback) {
    this.syncListeners.push(callback);
    return () => {
      this.syncListeners = this.syncListeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(status) {
    this.syncListeners.forEach(callback => callback(status));
  }

  async syncPendingChanges() {
    if (this.isSyncing) {
      return { success: true, message: 'Sync already in progress' };
    }

    try {
      this.isSyncing = true;
      this.notifyListeners({ syncing: true, progress: 0 });

      const isOnline = await apiService.checkConnectivity();
      if (!isOnline) {
        this.notifyListeners({ syncing: false, offline: true });
        return { success: false, message: 'No internet connection' };
      }

      const pendingItems = await offlineStorage.getPendingSyncs();

      if (pendingItems.length === 0) {
        this.notifyListeners({ syncing: false, progress: 100 });
        return { success: true, message: 'Nothing to sync' };
      }

      let successCount = 0;
      let failureCount = 0;

      for (let i = 0; i < pendingItems.length; i++) {
        const item = pendingItems[i];
        const progress = Math.round(((i + 1) / pendingItems.length) * 100);

        this.notifyListeners({ syncing: true, progress });

        try {
          await this.syncItem(item);
          await offlineStorage.removePendingSync(item.id);
          successCount++;
        } catch (error) {
          console.error('Failed to sync item:', error);
          failureCount++;

          const retryCount = item.retryCount + 1;

          if (retryCount >= 3) {
            await offlineStorage.removePendingSync(item.id);
          } else {
            await offlineStorage.updatePendingSync(item.id, {
              retryCount,
              lastError: error.message,
            });
          }
        }
      }

      this.notifyListeners({ syncing: false, progress: 100 });

      if (successCount > 0) {
        toast.success(`Synced ${successCount} ${successCount === 1 ? 'item' : 'items'}`);
      }

      if (failureCount > 0) {
        toast.error(`Failed to sync ${failureCount} ${failureCount === 1 ? 'item' : 'items'}`);
      }

      return {
        success: failureCount === 0,
        message: `Synced ${successCount} items, ${failureCount} failed`,
        successCount,
        failureCount,
      };
    } catch (error) {
      console.error('Sync error:', error);
      this.notifyListeners({ syncing: false, error: error.message });
      return { success: false, message: error.message };
    } finally {
      this.isSyncing = false;
    }
  }

  async syncItem(item) {
    const { operation, data } = item;

    switch (operation) {
      case 'log_meal':
        return await apiService.logMeal(data);

      case 'log_workout':
        return await apiService.logWorkout(data);

      case 'log_hydration':
        return await apiService.logHydration(data.amount_ml);

      case 'update_profile':
        return await apiService.updateUserProfile(data);

      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async queueMealLog(mealData) {
    const id = await offlineStorage.addPendingSync('log_meal', mealData);
    return id;
  }

  async queueWorkoutLog(workoutData) {
    const id = await offlineStorage.addPendingSync('log_workout', workoutData);
    return id;
  }

  async queueHydrationLog(amount) {
    const id = await offlineStorage.addPendingSync('log_hydration', { amount_ml: amount });
    return id;
  }

  async queueProfileUpdate(profileData) {
    const id = await offlineStorage.addPendingSync('update_profile', profileData);
    return id;
  }

  async getPendingCount() {
    const pendingItems = await offlineStorage.getPendingSyncs();
    return pendingItems.length;
  }

  async hasPendingChanges() {
    const count = await this.getPendingCount();
    return count > 0;
  }
}

export default new SyncService();
