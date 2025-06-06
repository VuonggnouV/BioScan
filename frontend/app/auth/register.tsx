// Đường dẫn: vuonght/app/auth/register.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { collection, doc, getDocs, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
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

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isUsernameUnique = async (name: string): Promise<boolean> => {
    if (!db) return false;
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("usernameNormalized", "==", name.toLowerCase()));
    try {
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty;
    } catch (error) {
        console.error("Error checking username uniqueness: ", error);
        Alert.alert("Lỗi", "Không thể kiểm tra tên người dùng.");
        return false;
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert('Thiếu thông tin', 'Vui lòng điền đầy đủ thông tin.'); return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mật khẩu không khớp'); return;
    }
    
    setIsLoading(true);
    const usernameTrimmed = username.trim();
    const isUnique = await isUsernameUnique(usernameTrimmed);
    if (!isUnique) {
      Alert.alert('Tên người dùng đã tồn tại');
      setIsLoading(false); return;
    }

    try {
      if (!auth || !db) {
         Alert.alert('Lỗi cấu hình'); setIsLoading(false); return;
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      if (user) {
        await updateProfile(user, { displayName: usernameTrimmed });
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email?.toLowerCase(),
          username: usernameTrimmed,
          usernameNormalized: usernameTrimmed.toLowerCase(),
          createdAt: serverTimestamp(),
        });
        Alert.alert('Đăng ký thành công', 'Vui lòng đăng nhập.');
        router.replace('/auth/login');
      }
    } catch (error: any) {
      console.error("Lỗi đăng ký:", error.code);
      let errorMessage = 'Đăng ký thất bại.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email này đã được sử dụng.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Mật khẩu quá yếu.';
      }
      Alert.alert('Lỗi Đăng Ký', errorMessage);
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
            <Text style={styles.formTitle}>ĐĂNG KÝ</Text>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="account-outline" size={22} color={COLORS.placeholder} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Tên người dùng" placeholderTextColor={COLORS.placeholder} value={username} onChangeText={setUsername} autoCapitalize="none" editable={!isLoading} />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="email-outline" size={22} color={COLORS.placeholder} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Email" placeholderTextColor={COLORS.placeholder} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!isLoading} />
            </View>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={22} color={COLORS.placeholder} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Mật khẩu" placeholderTextColor={COLORS.placeholder} value={password} onChangeText={setPassword} secureTextEntry={!isPasswordVisible} editable={!isLoading} />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)} style={styles.eyeIcon} disabled={isLoading}>
                <MaterialCommunityIcons name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.placeholder} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-check-outline" size={22} color={COLORS.placeholder} style={styles.inputIcon} />
              <TextInput style={styles.input} placeholder="Xác nhận mật khẩu" placeholderTextColor={COLORS.placeholder} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={!isConfirmPasswordVisible} editable={!isLoading} />
              <TouchableOpacity onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} style={styles.eyeIcon} disabled={isLoading}>
                <MaterialCommunityIcons name={isConfirmPasswordVisible ? 'eye-off-outline' : 'eye-outline'} size={22} color={COLORS.placeholder} />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color={COLORS.primaryButton} style={styles.loader} />
            ) : (
              <TouchableOpacity style={styles.buttonPrimary} onPress={handleRegister} disabled={isLoading}>
                <Text style={styles.buttonPrimaryText}>ĐĂNG KÝ</Text>
              </TouchableOpacity>
            )}

            <View style={styles.switchContainer}>
              <Text style={styles.switchText}>Đã có tài khoản? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity disabled={isLoading}>
                  <Text style={styles.switchLink}>Đăng nhập</Text>
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