// Đường dẫn: vuonght/app/(tabs)/user.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { auth, db } from '../../firebaseConfig';

// 1. Thêm bảng màu của dự án
const COLORS = {
  background: '#3A6A4D',
  formBackground: '#FFFFFF',
  inputBackground: '#E8F5E9',
  primaryButton: '#2E593F',
  textLight: '#FFFFFF',
  textDark: '#1B4332',
  placeholder: '#5C826E',
};

const TAB_BAR_HEIGHT_ESTIMATE = 75;

export default function UserScreen() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Logic xử lý dữ liệu không thay đổi
  useEffect(() => {
    const fetchUserData = async (user: FirebaseUser) => {
      if (user && db) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUsername(docSnap.data().username || user.displayName || 'N/A');
          } else {
            setUsername(user.displayName || 'N/A');
          }
        } catch (error) {
          console.error("Error fetching user data from Firestore:", error);
          setUsername(user.displayName || 'N/A');
        }
      } else if (user) {
         setUsername(user.displayName || 'N/A');
      }
      setIsLoading(false);
    };

    if (auth.currentUser) {
      setCurrentUser(auth.currentUser);
      fetchUserData(auth.currentUser);
    } else {
      setIsLoading(false); 
    }
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error("Lỗi đăng xuất:", error);
      Alert.alert('Lỗi Đăng Xuất', 'Đã có lỗi xảy ra khi đăng xuất. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  const navigateToHistory = () => {
    router.push('/history'); 
  };
  
  // --- Giao diện được cập nhật ---

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centeredContent]}>
        <ActivityIndicator size="large" color={COLORS.textLight} />
      </SafeAreaView>
    );
  }

  if (!currentUser) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centeredContent]}>
        <Text style={[styles.errorText, { color: COLORS.textLight }]}>Bạn chưa đăng nhập.</Text>
        <TouchableOpacity style={styles.buttonLink} onPress={() => router.replace('/auth/login')}>
          <Text style={styles.buttonLinkText}>Về trang đăng nhập</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <MaterialCommunityIcons name="account-circle" size={90} color={COLORS.textLight} />
          <Text style={styles.usernameText}>{username || currentUser.email}</Text> 
          <Text style={styles.emailText}>{currentUser.email}</Text>
        </View>

        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem} onPress={navigateToHistory}>
            <MaterialCommunityIcons name="history" size={26} color={COLORS.primaryButton} style={styles.menuIcon} />
            <Text style={styles.menuItemText}>Lịch sử quét</Text>
            <MaterialCommunityIcons name="chevron-right" size={26} color={COLORS.placeholder} />
          </TouchableOpacity>
          {/* Bạn có thể thêm các menuItem khác ở đây */}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={22} color={COLORS.textLight} style={{ marginRight: 10 }} />
          <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// 2. Cập nhật toàn bộ StyleSheet với màu sắc mới
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1,
    backgroundColor: COLORS.background, // Nền xanh đậm
  },
  scrollView: {},
  scrollViewContentContainer: { 
    paddingTop: 30, // Tăng padding top cho đẹp hơn
    paddingBottom: TAB_BAR_HEIGHT_ESTIMATE + 30, 
  },
  centeredContent: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    // Bỏ nền trắng, để nền của safeArea
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginBottom: 20, // Tạo khoảng cách với menu
  },
  usernameText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.textLight, // Chữ trắng
    marginTop: 10,
  },
  emailText: {
    fontSize: 16,
    color: COLORS.textLight, // Chữ trắng
    opacity: 0.8, // Giảm độ sáng một chút
    marginTop: 0,
  },
  menuContainer: {
    backgroundColor: COLORS.inputBackground, // Nền xanh lá nhạt
    borderRadius: 15, // Bo tròn nhiều hơn
    marginHorizontal: 15,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    // Bỏ viền dưới để trông sạch sẽ hơn, có thể thêm lại nếu muốn
    // borderBottomWidth: 1,
    // borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuItemText: {
    flex: 1,
    fontSize: 17,
    color: COLORS.textDark, // Chữ xanh đậm
    fontWeight: '500',
  },
  logoutButton: {
    backgroundColor: COLORS.primaryButton, // Màu xanh nút bấm chính
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginHorizontal: 15,
    marginTop: 30,
  },
  logoutButtonText: {
      color: COLORS.textLight,
      fontSize: 16,
      fontWeight: 'bold',
      textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonLink: {
    paddingVertical: 10,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonLinkText: {
    color: COLORS.textDark,
    fontSize: 16,
    fontWeight: 'bold',
  },
});