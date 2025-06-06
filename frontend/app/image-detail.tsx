// Đường dẫn: vuonght/app/image-detail.tsx
import { Image } from 'expo-image'; // Sử dụng Image từ expo-image
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = (width - 40) / 2;

export default function ImageDetailScreen() {
  const { imageUrisJson, folderName } = useLocalSearchParams();
  const router = useRouter();
  let imageUris: string[] = [];

  if (typeof imageUrisJson === 'string') {
    try {
      imageUris = JSON.parse(imageUrisJson);
    } catch (e) {
      console.error("Failed to parse imageUrisJson:", e);
      imageUris = [];
    }
  } else if (Array.isArray(imageUrisJson)) {
    imageUris = imageUrisJson as string[];
  }

  const handleImagePress = (uri: string) => {
    router.push({
      pathname: "/single-image-view", // Điều hướng đến màn hình xem ảnh đơn
      params: { uri: uri }, // Truyền URI của ảnh được chọn
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          title: folderName ? String(folderName) : 'Chi tiết ảnh',
          headerShown: true,
        }}
      />
      <View style={styles.container}>
        {imageUris.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có ảnh nào trong thư mục này.</Text>
          </View>
        ) : (
          <FlatList
            data={imageUris}
            keyExtractor={(item, index) => item + index}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleImagePress(item)} style={styles.imageWrapper}>
                <Image source={{ uri: item }} style={styles.image} />
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  container: {
    flex: 1,
    padding: 10,
  },
  listContent: {
    justifyContent: 'flex-start',
  },
  imageWrapper: {
    margin: 5,
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover', // Sử dụng resizeMode để phù hợp với việc hiển thị trong lưới
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
});