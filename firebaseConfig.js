import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace with your actual config keys
const firebaseConfig = {
    apiKey: "AIzaSyAzlN3aD4bjXb1UPxpSHTj9hnXUOE-GC7c",
    authDomain: "attendanceapp-1febe.firebaseapp.com",
    projectId: "attendanceapp-1febe",
    storageBucket: "attendanceapp-1febe.firebasestorage.app",
    messagingSenderId: "126361595587",
    appId: "1:126361595587:web:a2d769c2a95122cde5bc76",
    measurementId: "G-GEQBZSVBBC"
};

const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };
