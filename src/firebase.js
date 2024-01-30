import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import admin from "firebase-admin";
import firebaseConfigservice from './firebase_service_account/marketshare-c5720-firebase-adminsdk-ajunu-baec284c29.json' assert { type: 'json' };
// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAOE5hJzTA5O4jvAKHvaCNi8YfbdUvODIs",
  authDomain: "marketshare-c5720.firebaseapp.com",
  projectId: "marketshare-c5720",
  storageBucket: "marketshare-c5720.appspot.com",
  messagingSenderId: "502223618835",
  appId: "1:502223618835:web:dcd75e1fda77e4d0f3d0e6",
  measurementId: "G-QTSM1YVLWR"
};
// Inicializa Firebase
export const app = initializeApp(firebaseConfig);
// Obtiene una instancia del servicio de autenticación de Firebase
export const auth = getAuth(app);
// Obtiene una instancia de Firestore
export const db = getFirestore(app);
// Función para conectar con Firebase
export const connectFirebase = async () => {
  try {
    onAuthStateChanged(auth, (user) => {
        console.log('Conexión exitosa con Firebase');
    });
  } catch (error) {
    console.log(error);
    console.error('Error al conectar con Firebase:', error);
  }
};

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfigservice),
    storageBucket: 'gs://marketshare-c5720.appspot.com',
  });
}

export const VerifyIdToken = async (token) => {
  return admin
    .auth()
    .verifyIdToken(token)
    .catch((error) => {
      throw error;
    });
};


export const adminApp = admin;
export default connectFirebase;



