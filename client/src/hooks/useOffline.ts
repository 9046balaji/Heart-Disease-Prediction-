// React hook for offline functionality
import { useState, useEffect } from 'react';
import { offlineService } from '@/lib/offlineService';

interface OfflineStatus {
  isOnline: boolean;
  syncStatus: {
    total: number;
    synced: number;
    pending: number;
  };
}

export function useOffline() {
  const [offlineStatus, setOfflineStatus] = useState<OfflineStatus>({
    isOnline: navigator.onLine,
    syncStatus: { total: 0, synced: 0, pending: 0 }
  });

  useEffect(() => {
    // Update status initially
    updateStatus();

    // Set up event listeners
    const handleOnline = () => {
      updateStatus();
    };

    const handleOffline = () => {
      updateStatus();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up interval to periodically update sync status
    const interval = setInterval(() => {
      updateStatus();
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const updateStatus = () => {
    setOfflineStatus({
      isOnline: offlineService.isOnline(),
      syncStatus: offlineService.getSyncStatus()
    });
  };

  const storeOfflineData = (endpoint: string, method: 'POST' | 'PUT' | 'DELETE', data: any) => {
    offlineService.storeOfflineData(endpoint, method, data);
    updateStatus();
  };

  const syncOfflineData = async () => {
    await offlineService.syncOfflineData();
    updateStatus();
  };

  const cacheAsset = async (url: string) => {
    await offlineService.cacheAsset(url);
    updateStatus();
  };

  const getCachedAsset = (url: string) => {
    return offlineService.getCachedAsset(url);
  };

  const clearOfflineData = () => {
    offlineService.clearOfflineData();
    updateStatus();
  };

  return {
    ...offlineStatus,
    storeOfflineData,
    syncOfflineData,
    cacheAsset,
    getCachedAsset,
    clearOfflineData
  };
}