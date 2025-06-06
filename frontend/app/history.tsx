// Đường dẫn: frontend/app/history.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Bảng màu đồng bộ với toàn bộ ứng dụng
const COLORS = {
  background: '#3A6A4D',
  cardBackground: '#FFFFFF',
  primaryText: '#1B4332',
  secondaryText: '#5C826E',
  accent: '#2E593F',
  lightText: '#FFFFFF',
  danger: '#d9534f',
};

// Interface đầy đủ nhất cho một mục Lịch sử
interface HistoryItem {
  id: string;
  name: string;
  date: string;
  imageCount: number;
  images: string[];
  speciesName?: string;
  description?: string;
  infoFileUri?: string;
}

const HISTORY_STORAGE_KEY = 'scan_history_folders';

export default function HistoryScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [historyFolders, setHistoryFolders] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);

  // Tải dữ liệu từ AsyncStorage
  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const jsonValue = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
      setHistoryFolders(jsonValue != null ? JSON.parse(jsonValue) : []);
    } catch (e) {
      Alert.alert("Lỗi", "Không thể tải lịch sử.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tải lại dữ liệu mỗi khi quay lại màn hình này
  useFocusEffect(
    useCallback(() => {
      loadHistory();
      setSelectionMode(false);
      setSelectedFolderIds([]);
    }, [loadHistory])
  );

  // Logic cho việc chọn/bỏ chọn một mục
  const toggleSelectFolder = (id: string) => {
    setSelectedFolderIds(prev =>
      prev.includes(id) ? prev.filter(folderId => folderId !== id) : [...prev, id]
    );
  };

  // Logic cho việc chọn/bỏ chọn tất cả
  const toggleSelectAll = useCallback(() => {
    if (selectedFolderIds.length === historyFolders.length) {
      setSelectedFolderIds([]);
    } else {
      setSelectedFolderIds(historyFolders.map(folder => folder.id));
    }
  }, [selectedFolderIds.length, historyFolders]);

  // Logic xóa các mục đã chọn
  const deleteSelectedFolders = useCallback(async () => {
    if (selectedFolderIds.length === 0) return;
    Alert.alert("Xác nhận xóa", `Bạn có chắc muốn xóa ${selectedFolderIds.length} mục đã chọn?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        onPress: async () => {
          try {
            const updatedFolders = historyFolders.filter(folder => !selectedFolderIds.includes(folder.id));
            await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedFolders));
            setHistoryFolders(updatedFolders);
            setSelectionMode(false);
          } catch (e) {
            Alert.alert("Lỗi", "Không thể xóa các mục đã chọn.");
          }
        },
        style: "destructive"
      },
    ]);
  }, [selectedFolderIds, historyFolders]);

  // Cập nhật các nút trên Header một cách linh hoạt
  useLayoutEffect(() => {
    navigation.setOptions({
      title: selectionMode ? (selectedFolderIds.length > 0 ? `${selectedFolderIds.length} đã chọn` : 'Chọn mục') : 'Lịch Sử Quét',
      headerTintColor: COLORS.lightText,
      headerStyle: { backgroundColor: COLORS.background },
      headerLeft: () => (
        <TouchableOpacity style={styles.headerButton} onPress={() => selectionMode ? setSelectionMode(false) : router.back()}>
          <MaterialCommunityIcons name={selectionMode ? "close" : "arrow-left"} size={24} color={COLORS.lightText} />
        </TouchableOpacity>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          {selectionMode ? (
            <>
              <TouchableOpacity style={styles.headerButton} onPress={toggleSelectAll}>
                <MaterialCommunityIcons name={selectedFolderIds.length === historyFolders.length && historyFolders.length > 0 ? "checkbox-multiple-marked" : "checkbox-multiple-blank-outline"} size={24} color={COLORS.lightText} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={deleteSelectedFolders} disabled={selectedFolderIds.length === 0}>
                <MaterialCommunityIcons name="delete" size={24} color={selectedFolderIds.length > 0 ? COLORS.danger : COLORS.secondaryText} />
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.headerButton} onPress={() => setSelectionMode(true)} disabled={historyFolders.length === 0}>
               <Text style={[styles.headerButtonText, { color: historyFolders.length > 0 ? COLORS.lightText : COLORS.secondaryText }]}>Chọn</Text>
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, selectionMode, selectedFolderIds, historyFolders]);

  // Hàm mở file .txt bằng menu chia sẻ của hệ điều hành
  const handleViewInfoFile = (fileUri?: string) => {
  if (!fileUri) {
    Alert.alert("Lỗi", "Không tìm thấy file thông tin.");
    return;
  }
  // Điều hướng đến màn hình mới và truyền 'fileUri' làm tham số
  router.push({
    pathname: '/info-viewer',
    params: { fileUri: fileUri },
  });
};


  // Hàm điều hướng về trang Camera
  const handleScanNow = () => router.push('/');

  // Giao diện cho mỗi mục trong danh sách
  const renderHistoryItem = ({ item }: { item: HistoryItem }) => {
    const isSelected = selectedFolderIds.includes(item.id);
    return (
      <View style={[styles.itemContainer, isSelected && styles.selectedItem]}>
        <TouchableOpacity
          style={styles.mainContent}
          onPress={() => selectionMode ? toggleSelectFolder(item.id) : router.push({ pathname: "/image-detail", params: { imageUrisJson: JSON.stringify(item.images), folderName: item.name } })}
          onLongPress={() => { if (!selectionMode) { setSelectionMode(true); toggleSelectFolder(item.id); } }}
        >
          {selectionMode && <MaterialCommunityIcons name={isSelected ? "checkbox-marked-circle" : "checkbox-blank-circle-outline"} size={24} color={COLORS.accent} style={styles.checkboxIcon} />}
          <MaterialCommunityIcons name="folder-image" size={40} color={COLORS.accent} style={styles.itemIcon} />
          <View style={styles.itemTextContainer}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            {item.speciesName && <Text style={styles.speciesName}>{item.speciesName}</Text>}
            <Text style={styles.itemDetails}>Ngày: {item.date}</Text>
          </View>
        </TouchableOpacity>
        {item.infoFileUri && !selectionMode && (
          <TouchableOpacity style={styles.infoButton} onPress={() => handleViewInfoFile(item.infoFileUri)}>
            <MaterialCommunityIcons name="text-box-outline" size={26} color={COLORS.accent} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (isLoading) {
    return <View style={styles.centeredContent}><ActivityIndicator size="large" color={COLORS.accent} /></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {historyFolders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="history" size={60} color="#cccccc" />
          <Text style={styles.emptyText}>Lịch sử quét của bạn trống.</Text>
          <TouchableOpacity style={styles.scanNowButton} onPress={handleScanNow}>
            <Text style={styles.scanNowButtonText}>Quét mẫu vật ngay</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={historyFolders}
          renderItem={renderHistoryItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f6f8' },
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f4f6f8' },
  headerButton: { padding: 5 },
  headerButtonText: { fontSize: 17, fontWeight: '600' },
  headerRightContainer: { flexDirection: 'row', gap: 20 },
  listContentContainer: { padding: 10 },
  itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBackground, padding: 15, borderRadius: 12, marginVertical: 6, marginHorizontal: 5, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  selectedItem: { borderColor: COLORS.accent, borderWidth: 2, padding: 13 },
  mainContent: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  checkboxIcon: { marginRight: 15 },
  itemIcon: { marginRight: 15 },
  itemTextContainer: { flex: 1, justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '600', color: COLORS.primaryText },
  speciesName: { fontSize: 15, color: COLORS.accent, fontWeight: '500', marginTop: 4 },
  itemDetails: { fontSize: 13, color: COLORS.secondaryText, marginTop: 4 },
  infoButton: { justifyContent: 'center', alignItems: 'center', paddingLeft: 15 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { marginTop: 15, fontSize: 17, color: '#888', textAlign: 'center' },
  scanNowButton: { backgroundColor: COLORS.accent, paddingVertical: 12, paddingHorizontal: 25, borderRadius: 8, marginTop: 20 },
  scanNowButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
});