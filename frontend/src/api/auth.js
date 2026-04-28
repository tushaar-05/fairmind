import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAkjnfjHIko5kv-vqnSIxq48RLp3RdAQrQ",
  authDomain: "fairmind-39a8d.firebaseapp.com",
  projectId: "fairmind-39a8d",
  storageBucket: "fairmind-39a8d.firebasestorage.app",
  messagingSenderId: "1002514018382",
  appId: "1:1002514018382:web:649452feb01db453b6931f",
  measurementId: "G-9N4P9QWQ9D",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export async function signupUser({ fullName, email, password, organization }) {
  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );
  const user = credential.user;

  await setDoc(doc(db, "users", user.uid), {
    fullName,
    email,
    organization: organization || "",
    createdAt: serverTimestamp(),
  });

  return user;
}

export async function loginUser({ email, password }) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}
