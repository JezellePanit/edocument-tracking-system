import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // For your tracking system
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: "edocument-tracking-system",
  storageBucket: "edocument-tracking-system.appspot.com",
  messagingSenderId: "628429389464",
  appId: "1:628429389464:web:2f6266b8b5e61d103adaed"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // Export database
export const auth = getAuth(app);      // Export auth
