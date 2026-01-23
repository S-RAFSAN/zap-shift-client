// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_apiKey || '',
    authDomain: import.meta.env.VITE_authDomain || '',
    projectId: import.meta.env.VITE_projectId || '',
    storageBucket: import.meta.env.VITE_storageBucket || '',
    messagingSenderId: import.meta.env.VITE_messagingSenderId || '',
    appId: import.meta.env.VITE_appId || '',
    measurementId: import.meta.env.VITE_measurementId || ''
};

// Validate required Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('Firebase configuration is missing required fields. Please check your environment variables.');
}

// Initialize Firebase
let app;
try {
    app = initializeApp(firebaseConfig);
} catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
}
// Only initialize analytics if in production and measurementId exists
let analytics = null;
if (typeof window !== 'undefined' && import.meta.env.VITE_measurementId) {
    try {
        analytics = getAnalytics(app);
    } catch (error) {
        console.warn('Firebase Analytics initialization failed:', error);
    }
}
export const auth = getAuth(app);