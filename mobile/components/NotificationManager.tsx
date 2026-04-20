import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { trpc } from '../utils/trpc';
import { registerForPushNotificationsAsync } from '../utils/notifications';

export const NotificationManager = () => {
  const { data: user } = trpc.profile.me.useQuery(undefined, {
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  });

  const registerToken = trpc.profile.registerPushToken.useMutation({
    onSuccess: () => {
      console.log('✅ Push token registered on server');
    },
    onError: (err: any) => {
      console.error('❌ Failed to register push token:', err);
    },
  });

  useEffect(() => {
    if (!user) return;

    const setupNotifications = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        if (token) {
          registerToken.mutate({
            token,
            platform: Platform.OS as 'web' | 'ios' | 'android',
            deviceId: Device.osInternalBuildId || Device.modelName || 'unknown',
          });
        }
      } catch (error) {
        console.error('Error during notification setup:', error);
      }
    };

    setupNotifications();

    const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
    
    // Remote notifications listeners might crash or warn in Expo Go Android
    if (isExpoGo && Platform.OS === 'android') {
        return;
    }

    // Listen for notification responses (user tapping on notification)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response received:', response);
      // Here we could navigate to a specific screen based on notification data
    });

    return () => {
      responseListener.remove();
    };
  }, [user]);

  return null; // This component doesn't render anything
};
