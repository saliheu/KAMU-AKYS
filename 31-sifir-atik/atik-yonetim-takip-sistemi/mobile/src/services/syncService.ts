import NetInfo from '@react-native-community/netinfo';
import { useDatabase } from '../contexts/DatabaseContext';
import { wasteService } from './wasteService';
import { WasteEntry } from '../types';

class SyncService {
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;

  startAutoSync() {
    // Check connection and sync every 5 minutes
    this.syncInterval = setInterval(() => {
      this.checkAndSync();
    }, 5 * 60 * 1000);

    // Also sync when connection state changes
    NetInfo.addEventListener((state) => {
      if (state.isConnected && !this.syncInProgress) {
        this.checkAndSync();
      }
    });
  }

  stopAutoSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async checkAndSync() {
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      await this.syncOfflineData();
    }
  }

  async syncOfflineData() {
    if (this.syncInProgress) return;

    this.syncInProgress = true;
    try {
      const db = useDatabase();
      const unsyncedEntries = db.getUnsyncedEntries();

      if (unsyncedEntries.length === 0) {
        return { synced: 0, failed: 0 };
      }

      const results = await wasteService.syncEntries(unsyncedEntries);

      // Mark successfully synced entries
      results.synced.forEach((id) => {
        db.markAsSynced(id);
      });

      return {
        synced: results.synced.length,
        failed: results.failed.length,
      };
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  isSyncing() {
    return this.syncInProgress;
  }
}

export const syncService = new SyncService();