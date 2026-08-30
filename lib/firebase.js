import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDFKgXstl3muzR362dQBzlu4oAJs7MhJZE",
  authDomain: "ext-ac130.firebaseapp.com",
  projectId: "ext-ac130",
  storageBucket: "ext-ac130.firebasestorage.app",
  messagingSenderId: "39294851910",
  appId: "1:39294851910:web:dbc0b537779acb450a2347",
  measurementId: "G-S2R3H9JLJD"
};

// Initialize Firebase only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics (client-side only)
let analytics;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, db, analytics };
