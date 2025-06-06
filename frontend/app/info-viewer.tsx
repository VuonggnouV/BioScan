// Đường dẫn: frontend/app/info-viewer.tsx

import * as FileSystem from 'expo-file-system';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

// Bảng màu để đồng bộ giao diện
const COLORS = {
  background: '#f4f6f8',
  text: '#1B4332',
  accent: '#3A6A4D',
};

export default function InfoViewerScreen() {
  // Lấy tham số fileUri được truyền từ màn hình Lịch sử
  const { fileUri } = useLocalSearchParams<{ fileUri?: string }>();
  
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFileContent = async () => {
      if (!fileUri) {
        setContent("Lỗi: Không tìm thấy đường dẫn file.");
        setIsLoading(false);
        return;
      }

      try {
        // Dùng FileSystem để đọc nội dung của file từ URI
        const fileContent = await FileSystem.readAsStringAsync(fileUri);
        setContent(fileContent);
      } catch (error) {
        console.error("Lỗi đọc file:", error);
        setContent("Không thể đọc được nội dung file.");
      } finally {
        setIsLoading(false);
      }
    };

    loadFileContent();
  }, [fileUri]); // Chạy lại hiệu ứng mỗi khi fileUri thay đổi

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cấu hình Header cho màn hình này */}
      <Stack.Screen
        options={{
          title: 'Chi tiết mẫu vật',
          headerStyle: { backgroundColor: COLORS.accent },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <ScrollView contentContainerStyle={styles.container}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.accent} />
        ) : (
          <Text style={styles.content}>{content}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    fontFamily: 'monospace', // Dùng font monospace để hiển thị text đẹp hơn
  },
});