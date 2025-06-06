// Đường dẫn: vuonght/app/single-image-view.tsx
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react'; // Bỏ useEffect và useState
import { SafeAreaView, StyleSheet, Text, View, } from 'react-native'; // Bỏ ActivityIndicator và Dimensions

// Bỏ các hằng số screenWidth, screenHeight nếu không dùng

export default function SingleImageView() {
  const { uri } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.fullScreen}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true, // Để header trong suốt trên ảnh
          headerTintColor: '#fff', // Màu chữ và icon trên header (trắng)
          title: '', // Không cần tiêu đề ở đây
        }}
      />
      <View style={styles.contentContainer}>
        {uri && typeof uri === 'string' ? (
          <Image
            source={{ uri: uri }}
            style={styles.imageFullScreen} // Áp dụng style để ảnh chiếm toàn bộ không gian
            contentFit="contain" // Đảm bảo ảnh hiển thị đầy đủ, không bị cắt
          />
        ) : (
          <Text style={styles.errorText}>Không tìm thấy ảnh hoặc đường dẫn không hợp lệ.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: 'black', // Đặt màu nền đen
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // Đảm bảo không có padding hoặc margin ẩn nào làm co ảnh
  },
  imageFullScreen: {
    width: '100%', // Ảnh chiếm 100% chiều rộng của container
    height: '100%', // Ảnh chiếm 100% chiều cao của container
    // contentFit="contain" sẽ co giãn ảnh để nó vừa với không gian này mà vẫn giữ tỷ lệ
  },
  errorText: {
    color: 'white',
    fontSize: 16,
  },
});