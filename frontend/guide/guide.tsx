// Hướng dẫn các thẻ (component) cơ bản trong React Native / Expo

// 1. Import các component cần thiết
import React from 'react';
import {
    Button,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from 'react-native';

// 2. Tạo component ví dụ
export default function MyComponent() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Xin chào!</Text>

      <Image
        source={{ uri: 'https://placekitten.com/200/200' }}
        style={styles.image}
      />

      <TextInput
        placeholder="Nhập tên của bạn"
        style={styles.input}
      />

      <Button title="Bấm vào tôi" onPress={() => alert('Bạn vừa bấm nút!')} />

      <TouchableOpacity style={styles.customButton} onPress={() => alert('Nút tuỳ biến')}>
        <Text style={styles.customButtonText}>Nút tùy biến</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// 3. Style mẫu thường dùng
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  customButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    marginTop: 10,
    borderRadius: 5,
  },
  customButtonText: {
    color: 'white',
    textAlign: 'center',
  },
});
