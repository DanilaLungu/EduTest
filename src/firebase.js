import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
const firebaseConfig = {
  apiKey: "AIzaSyA3zHso5Nl8YbhpOjap_nENBdNslcSbCq4",
  authDomain: "edutest-ff8b8.firebaseapp.com",
  projectId: "edutest-ff8b8",
  storageBucket: "edutest-ff8b8.firebasestorage.app",
  messagingSenderId: "976394305657",
  appId: "1:976394305657:web:f61b764ea90feed35894a8",
  measurementId: "G-CPQ3QB126F"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
