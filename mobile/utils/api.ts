import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Centrally manages the API Base URL for the application.
 * 
 * Flow:
 * 1. Checks for EXPO_PUBLIC_API_URL (Production / Testing)
 * 2. Falls back to dynamic IP detection (Development on physical devices)
 * 3. Falls back to Android/Localhost defaults (Emulators)
 */
export const getBaseUrl = () => {
  // 1. Production Priority
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Dynamic Development Detection (Auto-detects computer IP)
  const debuggerHost = Constants.expoConfig?.hostUri;
  const address = debuggerHost?.split(':')[0];

  if (address) {
    return `http://${address}:4000/trpc`;
  }

  // 3. Static Fallbacks (Emulators with no debugger host)
  const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  return `http://${localhost}:4000/trpc`;
};
