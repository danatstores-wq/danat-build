import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth } from 'firebase/auth';
import * as FirebaseAuth from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// React Native must initialize Firebase Auth with AsyncStorage persistence
// before any screen reads auth.currentUser. Web keeps browser persistence.
const getReactNativePersistence = (FirebaseAuth as any).getReactNativePersistence;

function createAuth() {
  if (Platform.OS === 'web') return getAuth(app);

  try {
    if (typeof getReactNativePersistence !== 'function') {
      throw new Error('Firebase React Native persistence is unavailable.');
    }
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error: any) {
    // Fast Refresh can evaluate this module again after Auth was initialized.
    if (error?.code === 'auth/already-initialized') return getAuth(app);
    throw error;
  }
}

export const auth = createAuth();

export default app;
