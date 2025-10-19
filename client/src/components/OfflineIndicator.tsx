// Offline indicator component
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RotateCcw, CheckCircle } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { Badge } from '@/components/ui/badge';

export default function OfflineIndicator() {
  const { isOnline, syncStatus } = useOffline();
  const [showSyncStatus, setShowSyncStatus] = useState(false);

  useEffect(() => {
    if (syncStatus.pending > 0) {
      setShowSyncStatus(true);
      // Hide sync status after 3 seconds
      const timer = setTimeout(() => {
        setShowSyncStatus(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [syncStatus.pending]);

  if (!showSyncStatus && isOnline && syncStatus.pending === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-background border rounded-lg shadow-lg p-3 flex items-center gap-2">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-500" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-500" />
        )}
        
        {isOnline ? (
          <span className="text-sm">Online</span>
        ) : (
          <span className="text-sm">Offline</span>
        )}
        
        {syncStatus.pending > 0 && (
          <>
            <div className="h-4 w-px bg-border mx-1" />
            <div className="flex items-center gap-1">
              <RotateCcw className="h-4 w-4 text-blue-500 animate-spin" />
              <span className="text-sm">
                Syncing {syncStatus.pending} item{syncStatus.pending !== 1 ? 's' : ''}
              </span>
            </div>
          </>
        )}
        
        {syncStatus.pending === 0 && syncStatus.synced > 0 && showSyncStatus && (
          <>
            <div className="h-4 w-px bg-border mx-1" />
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Synced</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}