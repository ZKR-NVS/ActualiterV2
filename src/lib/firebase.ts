// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyABWbP4YKr-fPmu72Db9q_YYsIxXbj4GW0",
  authDomain: "actualfr-3aaf4.firebaseapp.com",
  projectId: "actualfr-3aaf4",
  storageBucket: "actualfr-3aaf4.firebasestorage.app",
  messagingSenderId: "572559998951",
  appId: "1:572559998951:web:c0654dc6ffd72b58b1c742",
  measurementId: "G-X97N2WFJNC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Initialize Storage
export const storage = getStorage(app);

export default app; 