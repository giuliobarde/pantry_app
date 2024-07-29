// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoDpawm5uBBS70wYTr1dHiUkx4yiQct1U",
  authDomain: "hspantryapp-c89b3.firebaseapp.com",
  projectId: "hspantryapp-c89b3",
  storageBucket: "hspantryapp-c89b3.appspot.com",
  messagingSenderId: "143929449024",
  appId: "1:143929449024:web:71a536059abb538894dda5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)
export {app, firestore}