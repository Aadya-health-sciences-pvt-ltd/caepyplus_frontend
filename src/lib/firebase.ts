import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock_key",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock_project.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock_project",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock_project.appspot.com",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "0000000000",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:0000000000:web:0000000000"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
