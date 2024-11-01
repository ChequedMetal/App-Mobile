// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Define the environment object with firebaseConfig inside it
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyBdRtTxwFo05ao0GzybcWCUNHuZ5YzFxvQ",
  authDomain: "appasistencia-f0092.firebaseapp.com",
  projectId: "appasistencia-f0092",
  storageBucket: "appasistencia-f0092.appspot.com",
  messagingSenderId: "599297931115",
  appId: "1:599297931115:web:d29b379e3ee96eb8a17e2e",
  measurementId: "G-9YH5XRQL0F"
  }
};

// Initialize Firebase using the firebaseConfig from environment
const app = initializeApp(environment.firebaseConfig);
const analytics = getAnalytics(app);
