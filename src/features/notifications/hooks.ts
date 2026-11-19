import { queryKeys } from '@/api/keys';
import { queryClient } from '@/api/query-client';
import { startGeofenceUpdates } from '@/features/location/tracking';
import { enablePushNotifications, loadNotifications } from '@/features/notifications/push';
import type { Profile } from '@/features/profile/schemas';
import { useAuthStore } from '@/stores/auth';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

function cacheProfile(profile: Profile) {
  queryClient.setQueryData(queryKeys.profile, profile);
}

export function useEnablePush() {
  return useMutation({
    mutationFn: () => enablePushNotifications(true),
    onSuccess: cacheProfile,
  });
}

function isNewSubmission(data: unknown) {
  return Boolean(data && typeof data === 'object' && 'type' in data && data.type === 'new_submission');
}

export function useDeviceServices() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated || !token || Platform.OS === 'web') return;

    let cancelled = false;

    void (async () => {
      try {
        const notifications = await loadNotifications();
        if (notifications && !cancelled) {
          const permission = await notifications.getPermissionsAsync();
          if (!cancelled && permission.granted) {
            cacheProfile(await enablePushNotifications(false));
          }
        }
      } catch {
        // The profile screen explains why a token could not be saved.
      }

      if (!cancelled && role === 'USER') {
        await startGeofenceUpdates().catch(() => false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isHydrated, role, token]);

  useEffect(() => {
    if (!isHydrated || !token || role !== 'OWNER' || Platform.OS === 'web') return;
    let received: { remove: () => void } | undefined;
    let opened: { remove: () => void } | undefined;
    let cancelled = false;

    void loadNotifications().then((notifications) => {
      if (!notifications || cancelled) return;
      received = notifications.addNotificationReceivedListener((notification) => {
        if (!isNewSubmission(notification.request.content.data)) return;
        void queryClient.invalidateQueries({ queryKey: queryKeys.ownerSubmissions });
      });
      opened = notifications.addNotificationResponseReceivedListener((response) => {
        if (!isNewSubmission(response.notification.request.content.data)) return;
        void queryClient.invalidateQueries({ queryKey: queryKeys.ownerSubmissions });
        router.push('/(owner)/(tabs)/review');
      });
    });

    return () => {
      cancelled = true;
      received?.remove();
      opened?.remove();
    };
  }, [isHydrated, role, router, token]);
}
