import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyA00XilTXUCFhZs1v2xlPHofgS99b7U6bk",
  authDomain: "sarvbhasha-40865.firebaseapp.com",
  projectId: "sarvbhasha-40865",
  storageBucket: "sarvbhasha-40865.firebasestorage.app",
  messagingSenderId: "241531708225",
  appId: "1:241531708225:web:85d4a4743a05d666dc37c0",
  measurementId: "G-K318Q0Y913"
};

// init app
const app = initializeApp(firebaseConfig);

// auth export (THIS WAS MISSING)
export const auth = getAuth(app);

// analytics (safe only in browser)
export const analytics =
  typeof window !== "undefined" ? getAnalytics(app) : null;

export default app;
