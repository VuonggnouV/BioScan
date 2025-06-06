// Đường dẫn: vuonght/app/auth/login.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, DocumentData, getDocs, query, where } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image, // 1. Import component Image
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { auth, db } from '../../firebaseConfig';

// Bảng màu theo thiết kế
const COLORS = {
  background: '#3A6A4D',
  formBackground: '#FFFFFF',
  inputBackground: '#E8F5E9',
  primaryButton: '#3E7740',
  textLight: '#FFFFFF',
  textDark: '#1B4332',
  placeholder: '#5C826E',
};

export default function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập Email/Tên người dùng và Mật khẩu.');
      return;
    }
    setIsLoading(true);
    let emailToLogin = identifier.trim();
    const identifierTrimmed = identifier.trim();
    const isEmail = /\S+@\S+\.\S+/.test(identifierTrimmed);

    if (!isEmail) {
      if (!db) {
        Alert.alert('Lỗi cấu hình', 'Không thể kết nối cơ sở dữ liệu.');
        setIsLoading(false); return;
      }
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("usernameNormalized", "==", identifierTrimmed.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          Alert.alert('Lỗi Đăng Nhập', 'Tên người dùng hoặc mật khẩu không đúng.');
          setIsLoading(false); return;
        }
        const userData = querySnapshot.docs[0].data() as DocumentData;
        if (userData && userData.email) {
          emailToLogin = userData.email;
        } else {
          Alert.alert('Lỗi Đăng Nhập', 'Không tìm thấy email cho tên người dùng này.');
          setIsLoading(false); return;
        }
      } catch (error) {
        console.error("Lỗi tìm username:", error);
        Alert.alert('Lỗi Đăng Nhập', 'Đã xảy ra lỗi khi tìm tài khoản.');
        setIsLoading(false); return;
      }
    }
    
    try {
      if (!auth) {
         Alert.alert('Lỗi cấu hình', 'Không thể kết nối dịch vụ xác thực.');
         setIsLoading(false); return;
      }
      await signInWithEmailAndPassword(auth, emailToLogin, password);
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error.code, error.message);
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email/Tên người dùng hoặc mật khẩu không chính xác.';
      }
      Alert.alert('Lỗi Đăng Nhập', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.headerContainer}>
            {/* 2. Thêm component Image để hiển thị logo */}
            <Image 
              source={require('../../assets/images/logo.png')} // <-- THAY TÊN FILE LOGO CỦA BẠN TẠI ĐÂY
              style={styles.logo}
            />
            <Text style={styles.headerTitle}>PLANT AND BIOLOGY</Text>
            <Text style={styles.headerSubtitle}>SAMPLE RECOGNITION</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>ĐĂNG NHẬP</Text>

            {/* Ô nhập Email/Username */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="account-outline" size={22} color={COLORS.placeholder} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email hoặc Tên người dùng"
                placeholderTextColor={COLORS.placeholder}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>
            
            {/* Ô nhập Mật khẩu */}
            <View style={styles.inputWrapper}>
               <MaterialCommunityIcons name="lock-outline" size={22} color={COLORS.placeholder} style={styles.inputIcon} />
               <TextInput
                style={styles.input}
                placeholder="Mật khẩu"
                placeholderTextColor={COLORS.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <MaterialCommunityIcons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.placeholder} />
              </TouchableOpacity>
            </View>

            {/* Nút Đăng nhập */}
            {isLoading ? (
              <ActivityIndicator size="large" color={COLORS.primaryButton} style={styles.loader} />
            ) : (
              <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin} disabled={isLoading}>
                <Text style={styles.buttonPrimaryText}>ĐĂNG NHẬP</Text>
              </TouchableOpacity>
            )}

            {/* Chuyển sang Đăng ký */}
            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Chưa có tài khoản? </Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text style={styles.switchLink}>Đăng ký ngay</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1 },
  scrollContainer: { 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
  },
  // 3. Thêm style cho logo
  logo: {
    width: 150, // Bạn có thể thay đổi kích thước
    height: 150, // Bạn có thể thay đổi kích thước
    resizeMode: 'contain', // Đảm bảo logo không bị méo
    marginBottom: 20, // Tạo khoảng cách với dòng chữ bên dưới
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 29.5,
    fontWeight: 'bold',
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 28,
    // fontWeight: 'heavy', // 'heavy' không phải là giá trị chuẩn, có thể dùng số như 900
    fontWeight: 'heavy',
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  formContainer: { 
    width: '100%', 
    maxWidth: 400, 
    backgroundColor: COLORS.formBackground, 
    padding: 30, 
    borderRadius: 25,
    alignItems: 'center',
  },
  formTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: COLORS.textDark, 
    marginBottom: 30,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 15,
    width: '100%',
    height: 55,
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textDark,
  },
  eyeIcon: {
    padding: 5,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primaryButton,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  buttonPrimaryText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  switchContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 25,
  },
  switchText: { 
    fontSize: 15, 
    color: COLORS.textDark,
  },
  switchLink: { 
    fontSize: 15, 
    color: COLORS.primaryButton,
    fontWeight: 'bold',
  },
  loader: { 
    marginTop: 25,
    marginBottom: 15,
  }
});