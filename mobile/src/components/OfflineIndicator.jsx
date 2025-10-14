import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { WifiOff, RefreshCw } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useTheme from '@/utils/useTheme';
import syncService from '@/utils/syncService';

export default function OfflineIndicator() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [isOnline, setIsOnline] = useState(true);
  const [syncStatus, setSyncStatus] = useState({ syncing: false, progress: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const slideAnim = useState(new Animated.Value(-100))[0];

  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      const online = state.isConnected && state.isInternetReachable;
      setIsOnline(online);

      if (online) {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    });

    const unsubscribeSync = syncService.addSyncListener(setSyncStatus);

    const checkPending = async () => {
      const count = await syncService.getPendingCount();
      setPendingCount(count);
    };

    checkPending();
    const interval = setInterval(checkPending, 5000);

    return () => {
      unsubscribeNetInfo();
      unsubscribeSync();
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    await syncService.syncPendingChanges();
    const count = await syncService.getPendingCount();
    setPendingCount(count);
  };

  if (isOnline && pendingCount === 0) {
    return null;
  }

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: insets.top,
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <View
        style={{
          backgroundColor: isOnline ? colors.warning : colors.error,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <WifiOff size={16} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: '500',
              flex: 1,
            }}
          >
            {isOnline
              ? `${pendingCount} ${pendingCount === 1 ? 'change' : 'changes'} pending`
              : 'No internet connection'}
          </Text>
        </View>

        {isOnline && pendingCount > 0 && (
          <TouchableOpacity
            onPress={handleSync}
            disabled={syncStatus.syncing}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <RefreshCw
              size={14}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: '600',
              }}
            >
              {syncStatus.syncing ? `${syncStatus.progress}%` : 'Sync'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}
