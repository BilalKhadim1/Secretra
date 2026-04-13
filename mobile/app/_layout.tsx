import { Stack } from 'expo-router';
import { useCallback, useState } from 'react';
import { View, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as WebBrowser from 'expo-web-browser';
import { NativeWindStyleSheet } from 'nativewind';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import Constants from 'expo-constants';
import { trpc } from '../utils/trpc';
import { getStorageItem } from '../utils/storage';

NativeWindStyleSheet.setOutput({
  default: "native",
});

WebBrowser.maybeCompleteAuthSession();

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.innerHTML = `
    body, html { padding: 0 !important; margin: 0 !important; width: 100%; height: 100%; overflow-x: hidden !important; }
    #root, div[data-reactroot] { width: 100% !important; flex: 1; display: flex; }
  `;
  document.head.appendChild(style);
}

// Helper to get the API URL
const getBaseUrl = () => {
  /**
   * If you're using a physical device, replace 'localhost' with your local IP address
   * or use expo-constants to get it dynamically.
   */
  const localhost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
  const debuggerHost = Constants.expoConfig?.hostUri;
  const address = debuggerHost?.split(':')[0];
  
  if (!address) return `http://${localhost}:4000/trpc`;
  return `http://${address}:4000/trpc`;
};

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient());

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: getBaseUrl(),
          async headers() {
            const token = await getStorageItem('accessToken');
            return {
              Authorization: token ? `Bearer ${token}` : undefined,
            };
          },
        }),
      ],
    })
  );

  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
          <Stack screenOptions={{ headerShown: false }} />
        </View>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
