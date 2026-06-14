import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyByQNCiEz5t3p5tEOXf2luuwsoV-SjpcjU",
  authDomain: "freshcart-app-3ced6.firebaseapp.com",
  projectId: "freshcart-app-3ced6",
  storageBucket: "freshcart-app-3ced6.appspot.com",
  messagingSenderId: "596279962637",
  appId: "1:596279962637:web:90d1aa2db2aee2328a7944"
};

// 🔥 FIX DUPLICATE APP ERROR
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

const analytics = getAnalytics(app);