import { useState, useEffect, useCallback } from "react";
import { getOfflineWorkoutsQueue, syncOfflineWorkouts } from "@/lib/workouts";
import { useToast } from "@/hooks/use-toast";

export function useOnlineStatus() {
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== "undefined" ? navigator.onLine : true;
  });
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(() => {
    return getOfflineWorkoutsQueue().length;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const refreshQueueCount = useCallback(() => {
    setOfflineQueueCount(getOfflineWorkoutsQueue().length);
  }, []);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return 0;
    setIsSyncing(true);
    try {
      const synced = await syncOfflineWorkouts();
      refreshQueueCount();
      if (synced > 0) {
        toast({
          title: "Cloud Sync Complete ☁️",
          description: `Successfully synchronized ${synced} offline workout set${synced > 1 ? "s" : ""} to your cloud account.`,
        });
      }
      return synced;
    } catch (e) {
      console.error("Manual sync error:", e);
      return 0;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, refreshQueueCount, toast]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      toast({
        title: "Back Online! 🟢",
        description: "Internet connection restored. Synchronizing offline gym data...",
      });
      await syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshQueueCount();
      toast({
        title: "Offline Mode Active ⚡",
        description: "You have lost internet connection. You can still log workouts — sets will be safely queued locally.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Initial check on mount
    refreshQueueCount();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshQueueCount, syncNow, toast]);

  return {
    isOnline,
    offlineQueueCount,
    isSyncing,
    syncNow,
    refreshQueueCount,
  };
}
