// Đường dẫn: vuonght/app/_layout.tsx
import { Stack, useRouter, useSegments } from 'expo-router';
import type { User } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { auth } from '../firebaseConfig';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export { ErrorBoundary } from 'expo-router';

// Key để lưu trữ dữ liệu lịch sử trong AsyncStorage (có thể bỏ comment hoặc để nguyên,
// miễn là nó khớp với key trong history.tsx)
const HISTORY_STORAGE_KEY = 'scan_history_folders';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loadedFonts, fontError] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const segments = useSegments();
  const router = useRouter();

  // Hàm clearAllHistory đã được di chuyển logic chính vào history.tsx để
  // nó có thể tương tác trực tiếp với state của HistoryScreen.
  // Nếu bạn muốn giữ hàm này ở đây để xóa tất cả từ một nơi khác (ví dụ: màn hình cài đặt),
  // bạn sẽ cần một cách để HistoryScreen biết và tải lại dữ liệu.
  // Hiện tại, nút xóa toàn bộ được quản lý trong HistoryScreen.

  useEffect(() => {
    if (!auth) {
      console.error("!!! Auth object is not available in RootLayout. Firebase init failed?");
      setIsAuthLoading(false);
      return;
    }
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (fontError) {
      console.error("Lỗi tải font:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    if (!loadedFonts || isAuthLoading) return;

    const inAuthGroup = segments?.[0] === 'auth';
    const inTabsGroup = segments?.[0] === '(tabs)';
    const inHistoryScreen = segments?.[0] === 'history';
    const inImageDetailScreen = segments?.[0] === 'image-detail';
    const inSingleImageView = segments?.[0] === 'single-image-view';

    if (currentUser) {
      if (inAuthGroup) {
        router.replace('/(tabs)');
      }
    } else {
      const isLoginOrRegister = segments?.length > 1 && (segments?.[1] === 'login' || segments?.[1] === 'register');
      if (!inAuthGroup && !isLoginOrRegister) {
        router.replace('/auth/login');
      }
    }
  }, [currentUser, isAuthLoading, loadedFonts, segments, router]);


  if (!loadedFonts || isAuthLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colorScheme === 'dark' ? DarkTheme.colors.background : DefaultTheme.colors.background }]}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? DarkTheme.colors.primary : DefaultTheme.colors.primary} />
        <Text style={[styles.loadingText, { color: colorScheme === 'dark' ? DarkTheme.colors.text : DefaultTheme.colors.text }]}>
          {!loadedFonts ? "Đang tải tài nguyên..." : "Đang kiểm tra xác thực..."}
        </Text>
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="history"
          options={{
            title: 'Lịch Sử Quét',
            headerShown: true,
            // XÓA headerLeft và headerRight CỐ ĐỊNH TẠI ĐÂY
            // HistoryScreen tự quản lý chúng bằng useLayoutEffect
          }}
        />
        <Stack.Screen
          name="image-detail"
          options={{
            title: 'Chi tiết ảnh',
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="single-image-view"
          options={{
            headerShown: true,
          }}
        />
        <Stack.Screen 
          name="info-viewer" 
          options={{ 
            // Bỏ headerShown ở đây vì màn hình tự quản lý header của nó
            presentation: 'modal', // Hiển thị dưới dạng modal trượt lên cho đẹp
        }} 
      />

        <Stack.Screen name="+not-found" />

      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  }
});