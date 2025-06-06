// Đường dẫn: vuonght/firebaseConfig.js

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
// Dòng log này để kiểm tra xem AsyncStorage có được import đúng không
console.log("Bắt đầu firebaseConfig.js: ReactNativeAsyncStorage:", ReactNativeAsyncStorage ? 'OK' : 'NULL/UNDEFINED');

import { getApp, getApps, initializeApp } from "firebase/app";
import {
    getAuth,
    getReactNativePersistence,
    initializeAuth
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// THÔNG TIN CẤU HÌNH LẤY TỪ HÌNH ẢNH FIREBASE CONSOLE CỦA BẠN
const firebaseConfig = { 
  apiKey : "AIzaSyAD_k-AehgqsIYq7x8b__D99rbNEFePqY8" , 
  authDomain : "vuonght-9d3eb.firebaseapp.com" , 
  projectId : "vuonght-9d3eb" , 
  storageBucket : "vuonght-9d3eb.firebasestorage.app" , 
  messagingSenderId : "367743128428" , 
  appId : "1:367743128428:web:8328eea5f6e847dbbb1949" , 
  measurementId : "G-EZ0YHFV48Q" 
};

let app = null; 
let authInstance = null; 
let dbInstance = null;   

if (!getApps().length) {
  console.log("firebaseConfig.js: Chưa có app nào được khởi tạo, bắt đầu khối try...");
  try {
    console.log("Bước 1: Đang thử initializeApp với config:", JSON.stringify(firebaseConfig));
    app = initializeApp(firebaseConfig);
    console.log("Bước 1 THÀNH CÔNG: Firebase app đã khởi tạo. Đối tượng `app`:", app ? 'Tồn tại' : 'KHÔNG tồn tại (null/undefined)');

    if (!app) {
      throw new Error("Đối tượng `app` là null hoặc undefined sau khi gọi initializeApp.");
    }

    console.log("Bước 2: Đang thử initializeAuth VỚI PERSISTENCE...");
    if (!ReactNativeAsyncStorage) {
      console.error("!!! ReactNativeAsyncStorage LÀ NULL/UNDEFINED ngay trước khi tạo persistence object!"); 
      throw new Error("ReactNativeAsyncStorage không có sẵn (kiểm tra trước khi tạo persistence).");
    }
    
    const persistence = getReactNativePersistence(ReactNativeAsyncStorage);
    console.log("Bước 2a: Đối tượng `persistence` đã tạo:", persistence ? 'Hợp lệ' : 'NULL/UNDEFINED');

    authInstance = initializeAuth(app, {
      persistence: persistence
    });
    console.log("Bước 2b THÀNH CÔNG: Firebase Auth VỚI PERSISTENCE đã khởi tạo. Đối tượng `authInstance`:", authInstance ? 'Tồn tại' : 'KHÔNG tồn tại (null/undefined)');
    
    if (!authInstance) {
        throw new Error("Đối tượng `authInstance` là null hoặc undefined sau khi gọi initializeAuth.");
    }

    console.log("Bước 3: Đang thử getFirestore...");
    dbInstance = getFirestore(app);
    console.log("Bước 3 THÀNH CÔNG: Firebase Firestore đã khởi tạo. Đối tượng `dbInstance`:", dbInstance ? 'Tồn tại' : 'KHÔNG tồn tại (null/undefined)');

    if (!dbInstance) {
        throw new Error("Đối tượng `dbInstance` là null hoặc undefined sau khi gọi getFirestore.");
    }
    
    console.log("TOÀN BỘ Firebase đã khởi tạo thành công trong firebaseConfig.js!");

  } catch (error) {
    console.error("!!! LỖI TRONG QUÁ TRÌNH KHỞI TẠO FIREBASE trong firebaseConfig.js:", error);
  }
} else {
  console.log("firebaseConfig.js: Firebase app đã được khởi tạo trước đó.");
  app = getApp(); 
  authInstance = getAuth(app); 
  dbInstance = getFirestore(app); 
  console.log("Đã lấy các instance đã có: app:", app ? 'OK':'Fail', "auth:", authInstance ? 'OK':'Fail', "db:", dbInstance ? 'OK':'Fail');
}

console.log("firebaseConfig.js: Kết thúc file. Exporting auth:", authInstance ? 'OK':'Fail', "db:", dbInstance ? 'OK':'Fail');
export { app, authInstance as auth, dbInstance as db };

