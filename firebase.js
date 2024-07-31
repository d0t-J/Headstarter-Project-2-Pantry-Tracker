// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCZL84CXIpbJ2NvUJbSnuwOtYCxRO83gHE",
  authDomain: "pantry-tracker-deebee.firebaseapp.com",
  projectId: "pantry-tracker-deebee",
  storageBucket: "pantry-tracker-deebee.appspot.com",
  messagingSenderId: "239852488665",
  appId: "1:239852488665:web:d1512b87cb77209df23bc8",
  measurementId: "G-PRMQGE23MY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app)

export {firestore}