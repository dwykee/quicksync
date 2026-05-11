import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Ganti konfigurasi ini dengan milikmu dari Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyD8bdnbzVebMIpePSySShRPQ_kTwME3iyY",
  authDomain: "quicksync-proj.firebaseapp.com",
  projectId: "quicksync-proj",
  storageBucket: "quicksync-proj.firebasestorage.app",
  messagingSenderId: "131555578828",
  appId: "1:131555578828:web:9c041644804a9050d9c369",
  measurementId: "G-XJYXZXFVKZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
