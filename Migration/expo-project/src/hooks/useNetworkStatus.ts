/**
 * Network Status Hook
 * Monitors online/offline status for the app
 */

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

/**
 * Hook to monitor network connectivity
 *
 * @returns Network status with isConnected and isInternetReachable flags
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isConnected, isInternetReachable } = useNetworkStatus();
 *
 *   if (!isConnected) {
 *     return <Text>You are offline</Text>;
 *   }
 *
 *   return <Text>You are online</Text>;
 * }
 * ```
 */
export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true, // Assume connected initially
    isInternetReachable: null,
  });

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
      });
    });

    // Fetch initial state
    NetInfo.fetch().then((state) => {
      setNetworkStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return networkStatus;
}
