import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function scheduleEventReminder(
  title: string,
  eventDate: Date,
  minutesBefore: number,
  eventId: string
) {
  const trigger = new Date(eventDate.getTime() - minutesBefore * 60000);
  
  if (trigger < new Date()) {
    return null; // Don't schedule if fire time is in the past
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Reminder: " + title,
      body: minutesBefore === 0 ? "Starting now!" : `Starting in ${minutesBefore} minutes`,
      data: { eventId },
      sound: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: trigger,
    },
  });

  return notificationId;
}

export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'web') {
    return null;
  }

  // Remote push notifications are not supported in Expo Go on Android as of SDK 53
  if (isExpoGo && Platform.OS === 'android') {
    console.warn('Push notifications are not supported in Expo Go on Android (SDK 53+). Use a development build for remote notifications.');
    return null;
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    try {
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            console.warn('EAS Project ID not found. Push notifications might not work in development without it.');
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    } catch (e) {
        console.error('Error getting expo push token:', e);
    }
  } else {
    // console.log('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

// Configure how notifications are handled when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
