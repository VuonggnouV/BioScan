// Đường dẫn: vuonght/app/(tabs)/index.tsx
// PHIÊN BẢN HOÀN CHỈNH: GỌI BACKEND, LƯU TÊN THEO NGÀY GIỜ, TẠO FILE .TXT

import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 1. Bảng màu của dự án (giữ nguyên)
const COLORS = {
  background: '#3A6A4D',
  formBackground: '#FFFFFF',
  inputBackground: '#E8F5E9',
  primaryButton: '#2E593F',
  textLight: '#FFFFFF',
  textDark: '#1B4332',
  placeholder: '#5C826E',
};

// 2. CẬP NHẬT INTERFACE ĐỂ LƯU THÊM CÁC THÔNG TIN MỚI
interface HistoryItem {
  id: string;
  name: string; // Tên theo ngày giờ
  date: string;
  imageCount: number;
  images: string[]; // Đường dẫn lâu dài của ảnh trong thư viện
  speciesName?: string; // Tên loài từ AI
  description?: string; // Tên đầy đủ/mô tả từ AI
  infoFileUri?: string; // Đường dẫn đến file .txt chứa thông tin
}

const HISTORY_STORAGE_KEY = 'scan_history_folders';

// 3. HÀM GIAO TIẾP VỚI BACKEND PYTHON
async function getIdentificationFromBackend(imageUri: string): Promise<{ speciesName: string, fullName: string } | null> {
  // !!! QUAN TRỌNG: Thay 'YOUR_COMPUTER_IP' bằng địa chỉ IP trong mạng LAN của máy tính bạn
  const backendApiUrl = 'http://192.168.88.148:5000/api/identify';

  try {
    const formData = new FormData();
    const filename = imageUri.split('/').pop()!;
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;
    // @ts-ignore
    formData.append('image', { uri: imageUri, name: filename, type });

    console.log('Đang gửi ảnh đến server backend...');
    const response = await fetch(backendApiUrl, { method: 'POST', body: formData });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Lỗi không xác định từ server');
    }
    const responseData = await response.json();
    console.log('Nhận được kết quả từ backend:', responseData);
    return responseData;
  } catch (error) {
    Alert.alert("Lỗi kết nối", `Không thể kết nối đến server backend. Lỗi: ${error}`);
    return null;
  }
}

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef<CameraView>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("Scan");
  const router = useRouter();

  useEffect(() => {
    (async () => {
      await requestCameraPermission();
      await requestMediaLibraryPermission();
    })();
  }, []);

  const handleScanComplete = async (temporaryPhotoUri: string) => {
    if (!temporaryPhotoUri) {
      Alert.alert("Lỗi", "Đường dẫn ảnh tạm thời không hợp lệ.");
      setIsScanning(false);
      setScanStatus("Scan");
      return;
    }
    
    setScanStatus("Đang phân tích...");
    setIsScanning(true);

    try {
      // --- KIỂM TRA BƯỚC 1: DỮ LIỆU TỪ BACKEND ---
      const analysisResult = await getIdentificationFromBackend(temporaryPhotoUri);
      
      // In ra để xem frontend nhận được gì từ backend
      console.log("--- FRONTEND DEBUG: DỮ LIỆU NHẬN TỪ BACKEND ---");
      console.log(analysisResult);
      console.log("---------------------------------------------");

      if (!analysisResult || !analysisResult.speciesName) {
        throw new Error("Phân tích hình ảnh thất bại hoặc không có tên loài.");
      }

      // --- KIỂM TRA BƯỚC 2: TẠO FILE .TXT ---
      const now = new Date();
      const dateString = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      const fileContent = `--- THÔNG TIN MẪU VẬT ---\n\nTên nhận dạng: ${analysisResult.speciesName}\nTên đầy đủ: ${analysisResult.fullName}\nNgày quét: ${dateString}\nThời gian: ${timeString}\n`;
      const txtFileName = `scan_info_${now.getTime()}.txt`;
      const txtFileUri = FileSystem.documentDirectory + txtFileName;

      await FileSystem.writeAsStringAsync(txtFileUri, fileContent, {
        encoding: FileSystem.EncodingType.UTF8
      });

      // In ra để xem đường dẫn file txt đã được tạo chưa
      console.log("--- FRONTEND DEBUG: TẠO FILE TXT ---");
      console.log("Đã tạo file thông tin tại đường dẫn:", txtFileUri);
      console.log("-----------------------------------");

      // --- KIỂM TRA BƯỚC 3: LƯU VÀO LỊCH SỬ ---
      const asset = await MediaLibrary.createAssetAsync(temporaryPhotoUri);
      const permanentImageUri = asset.uri;

      const newFolder: HistoryItem = {
        id: Date.now().toString(),
        name: `Quét ngày ${dateString} lúc ${timeString}`,
        date: dateString,
        imageCount: 1,
        images: [permanentImageUri],
        speciesName: analysisResult.speciesName,
        description: analysisResult.fullName,
        infoFileUri: txtFileUri,
      };
      
      const jsonValue = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      const currentHistory: HistoryItem[] = jsonValue ? JSON.parse(jsonValue) : [];
      const updatedHistory = [newFolder, ...currentHistory];
      await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));

      // In ra để xem đối tượng cuối cùng được lưu
      console.log("--- FRONTEND DEBUG: DỮ LIỆU ĐÃ LƯU VÀO ASYNCSTORAGE ---");
      console.log(newFolder);
      console.log("-----------------------------------------------------");
      
      Alert.alert("Hoàn tất", `Đã nhận dạng và lưu thông tin cho: ${analysisResult.speciesName}`);

    } catch (e) {
      console.error("Lỗi trong quá trình xử lý quét:", e);
      Alert.alert("Lỗi", (e as Error).message);
    } finally {
      setIsScanning(false);
      setScanStatus("Scan");
    }
  };
  // 5. HÀM ON SCAN PRESS - ĐÃ SỬA LỖI GỬI ẢNH
  const onScanPress = async () => {
    if (cameraRef.current && !isScanning) {
      setScanStatus("Đang chụp...");
      setIsScanning(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({ quality: 0.7, base64: false });
        if (photo && photo.uri) {
          await handleScanComplete(photo.uri);
        } else {
          throw new Error("Không thể chụp ảnh.");
        }
      } catch (error) {
        Alert.alert("Lỗi", "Có lỗi xảy ra khi chụp ảnh: " + (error as Error).message);
        setIsScanning(false);
        setScanStatus("Scan");
      }
    }
  };

  function toggleCameraFacing() { setFacing(current => (current === 'back' ? 'front' : 'back')); }

  if (!cameraPermission?.granted || !mediaLibraryPermission?.granted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.message}>Vui lòng cấp quyền Camera và Thư viện ảnh.</Text>
        <TouchableOpacity onPress={() => { requestCameraPermission(); requestMediaLibraryPermission(); }} style={styles.grantButton}>
          <Text style={styles.grantButtonText}>Cấp quyền</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>PLANT AND BIOLOGY</Text>
          <Text style={styles.headerSubtitle}>SAMPLE RECOGNITION</Text>
        </View>

        <View style={styles.cameraOuterContainer}>
          <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.scanButton, isScanning && styles.scanButtonDisabled]} 
            onPress={onScanPress}
            disabled={isScanning}
          >
            {isScanning ? (
              <ActivityIndicator size="large" color={COLORS.primaryButton} />
            ) : (
              <Text style={styles.scanButtonText}>SCAN</Text>
            )}
            {isScanning && <Text style={styles.scanStatusText}>{scanStatus}</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing} disabled={isScanning}>
             <MaterialCommunityIcons name="camera-flip-outline" size={24} color={COLORS.textLight} />
            <Text style={styles.flipButtonText}>Đổi Camera</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 3. Cập nhật toàn bộ StyleSheet
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
    backgroundColor: COLORS.background, 
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around', // Phân bổ không gian đều cho các khối
    paddingVertical: 20,
  },
  centeredContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContainer: {
    flex: 1, 
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  message: {
    color: COLORS.textLight,
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
  },
  grantButton: {
    backgroundColor: COLORS.primaryButton,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  grantButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- Các style mới cho layout thiết kế ---
  headerContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textLight,
    letterSpacing: 1,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textLight,
    letterSpacing: 1,
    textAlign: 'center',
  },
  cameraOuterContainer: {
    width: '85%', // Chiếm 85% chiều rộng màn hình
    aspectRatio: 1, // Đảm bảo nó là hình vuông
    borderRadius: 30, // Bo góc mạnh hơn
    overflow: 'hidden', // Cắt bỏ phần camera thừa ra ngoài
    borderWidth: 3,
    borderColor: 'rgba(232, 245, 233, 0.5)', // Màu viền mờ
    justifyContent: 'center',
    alignItems: 'center'
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  scanButton: {
    backgroundColor: COLORS.inputBackground, // Màu nền sáng
    width: '80%',
    paddingVertical: 18,
    borderRadius: 50, // Bo tròn để thành hình viên thuốc
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: COLORS.textDark, // Chữ màu tối
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  scanButtonDisabled: {
    backgroundColor: '#ccc',
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20, // Khoảng cách với nút Scan
    padding: 10,
  },
  flipButtonText: {
    color: COLORS.textLight,
    fontSize: 16,
    marginLeft: 8,
  }
});