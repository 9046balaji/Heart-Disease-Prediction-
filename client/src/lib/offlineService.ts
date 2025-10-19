// Offline service for handling local storage and sync capabilities

// Define the structure for offline data
interface OfflineData {
  timestamp: number;
  data: any;
  synced: boolean;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
}

// Define the structure for cached assets
interface CachedAsset {
  url: string;
  data: string; // base64 encoded data
  timestamp: number;
  contentType: string;
}

class OfflineService {
  private readonly OFFLINE_DATA_KEY = 'heartguard_offline_data';
  private readonly CACHED_ASSETS_KEY = 'heartguard_cached_assets';
  private readonly SYNC_INTERVAL = 30000; // 30 seconds

  constructor() {
    this.init();
  }

  // Initialize the service
  private init() {
    // Start sync process
    this.startSyncProcess();
    
    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('Browser is online');
      this.syncOfflineData();
    });
    
    window.addEventListener('offline', () => {
      console.log('Browser is offline');
    });
  }

  // Start the sync process
  private startSyncProcess() {
    setInterval(() => {
      if (navigator.onLine) {
        this.syncOfflineData();
      }
    }, this.SYNC_INTERVAL);
  }

  // Store data locally when offline
  public storeOfflineData(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', data: any): void {
    try {
      const offlineData: OfflineData = {
        timestamp: Date.now(),
        data,
        synced: false,
        endpoint,
        method
      };

      const existingData = this.getOfflineData();
      existingData.push(offlineData);
      
      localStorage.setItem(this.OFFLINE_DATA_KEY, JSON.stringify(existingData));
      console.log('Data stored offline:', offlineData);
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  // Get all offline data
  public getOfflineData(): OfflineData[] {
    try {
      const data = localStorage.getItem(this.OFFLINE_DATA_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving offline data:', error);
      return [];
    }
  }

  // Sync offline data when online
  public async syncOfflineData(): Promise<void> {
    if (!navigator.onLine) {
      return;
    }

    try {
      const offlineData = this.getOfflineData();
      const unsyncedData = offlineData.filter(item => !item.synced);
      
      if (unsyncedData.length === 0) {
        return;
      }

      console.log(`Syncing ${unsyncedData.length} offline items...`);

      // Process each unsynced item
      for (const item of unsyncedData) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.warn('No auth token available, skipping sync');
            continue;
          }

          const response = await fetch(`/api${item.endpoint}`, {
            method: item.method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(item.data)
          });

          if (response.ok) {
            // Mark item as synced
            const index = offlineData.findIndex(d => 
              d.timestamp === item.timestamp && 
              d.endpoint === item.endpoint
            );
            
            if (index !== -1) {
              offlineData[index].synced = true;
              localStorage.setItem(this.OFFLINE_DATA_KEY, JSON.stringify(offlineData));
              console.log('Successfully synced item:', item);
            }
          } else {
            console.error('Failed to sync item:', item, response.status);
          }
        } catch (error) {
          console.error('Error syncing item:', item, error);
        }
      }
    } catch (error) {
      console.error('Error during sync process:', error);
    }
  }

  // Cache an asset for offline use
  public async cacheAsset(url: string): Promise<void> {
    try {
      // Check if already cached
      const cachedAssets = this.getCachedAssets();
      const existingAsset = cachedAssets.find(asset => asset.url === url);
      
      if (existingAsset) {
        // If asset is less than 1 hour old, don't re-cache
        if (Date.now() - existingAsset.timestamp < 3600000) {
          return;
        }
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch asset: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || 'application/octet-stream';
      const blob = await response.blob();
      const reader = new FileReader();

      reader.onload = () => {
        const base64data = reader.result as string;
        
        const asset: CachedAsset = {
          url,
          data: base64data,
          timestamp: Date.now(),
          contentType
        };

        // Remove existing asset if it exists
        const filteredAssets = cachedAssets.filter(a => a.url !== url);
        filteredAssets.push(asset);
        
        localStorage.setItem(this.CACHED_ASSETS_KEY, JSON.stringify(filteredAssets));
        console.log('Asset cached:', url);
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error caching asset:', url, error);
    }
  }

  // Get cached asset
  public getCachedAsset(url: string): CachedAsset | null {
    try {
      const cachedAssets = this.getCachedAssets();
      const asset = cachedAssets.find(a => a.url === url);
      
      // If asset is more than 24 hours old, remove it
      if (asset && Date.now() - asset.timestamp > 86400000) {
        this.removeCachedAsset(url);
        return null;
      }
      
      return asset || null;
    } catch (error) {
      console.error('Error retrieving cached asset:', url, error);
      return null;
    }
  }

  // Get all cached assets
  public getCachedAssets(): CachedAsset[] {
    try {
      const data = localStorage.getItem(this.CACHED_ASSETS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error retrieving cached assets:', error);
      return [];
    }
  }

  // Remove cached asset
  public removeCachedAsset(url: string): void {
    try {
      const cachedAssets = this.getCachedAssets();
      const filteredAssets = cachedAssets.filter(asset => asset.url !== url);
      localStorage.setItem(this.CACHED_ASSETS_KEY, JSON.stringify(filteredAssets));
    } catch (error) {
      console.error('Error removing cached asset:', url, error);
    }
  }

  // Clear all offline data
  public clearOfflineData(): void {
    try {
      localStorage.removeItem(this.OFFLINE_DATA_KEY);
      localStorage.removeItem(this.CACHED_ASSETS_KEY);
      console.log('Offline data cleared');
    } catch (error) {
      console.error('Error clearing offline data:', error);
    }
  }

  // Check if browser is online
  public isOnline(): boolean {
    return navigator.onLine;
  }

  // Get sync status
  public getSyncStatus(): { total: number; synced: number; pending: number } {
    const offlineData = this.getOfflineData();
    const synced = offlineData.filter(item => item.synced).length;
    const pending = offlineData.filter(item => !item.synced).length;
    
    return {
      total: offlineData.length,
      synced,
      pending
    };
  }
}

// Export a singleton instance
export const offlineService = new OfflineService();