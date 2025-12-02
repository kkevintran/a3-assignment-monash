import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Create Vue app instance
const vueApp = createApp(App);

// Provide Firebase app instance to all components via Vue's injection system
// This allows composables like useFirebaseAuth and useFirestore to inject('firebaseApp')
vueApp.provide('firebaseApp', firebaseApp);

// Install router plugin
vueApp.use(router);

// Mount the app to the DOM
vueApp.mount('#app')

