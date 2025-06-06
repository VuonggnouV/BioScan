// Đường dẫn: vuonght/app/(tabs)/_layout.tsx
// ĐÃ SỬA LẠI ĐỂ camerascreen LÀM TRANG CHỦ
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
      }}>
      <Tabs.Screen
        // Sửa 'camerascreen' thành 'index' vì đã đổi tên tệp
        name="index"
        options={{
          title: 'Camera', // Giữ nguyên title là Camera
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="free"
        options={{
          title: 'Free',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chevron.right" color={color} />,
        }}
      />
      <Tabs.Screen
        name="user"
        options={{
          title: 'useraccount',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol size={28} name="person.fill" color={color} />
          ),
        }}
      />

    </Tabs>
  );
}