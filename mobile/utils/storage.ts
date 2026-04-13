import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const setStorageItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error('Local storage not available', e);
    }
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export const getStorageItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error('Local storage not available', e);
      return null;
    }
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export const removeStorageItem = async (key: string) => {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Local storage not available', e);
    }
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};
