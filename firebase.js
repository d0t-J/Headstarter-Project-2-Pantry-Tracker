// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAeSfTmnD8y_zh_KL5ZxW4-t4T3Ep9XYF0",
  authDomain: "pantry-tracker-e1a10.firebaseapp.com",
  projectId: "pantry-tracker-e1a10",
  storageBucket: "pantry-tracker-e1a10.appspot.com",
  messagingSenderId: "354574245118",
  appId: "1:354574245118:web:f87c27e0d373c47aac99af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)

export{firestore}