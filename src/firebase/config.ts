import { initializeApp } from "firebase/app";
import { initializeAuth, browserLocalPersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCPs6y-g25qz8ktTVslDYERR9CQFrN4c8Q",
  authDomain: "nutriscan-authentication.firebaseapp.com",
  projectId: "nutriscan-authentication",
  storageBucket: "nutriscan-authentication.firebasestorage.app",
  messagingSenderId: "662875109890",
  appId: "1:662875109890:web:85d8165354b5c4ecb4851b",
  measurementId: "G-M0R2G2T6WM",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
});

export { auth };
export default app;
