// src/lib/firebase.js
// ⚠️ SUBSTITUA pelos seus dados do Firebase Console
// Acesse: https://console.firebase.google.com → Seu projeto → Configurações → Config do app

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyCm7R9egQMpjpB1sCxJ6tfmaB5Itygugdo",
  authDomain: "placasflow.firebaseapp.com",
  projectId: "placasflow",
  storageBucket: "placasflow.firebasestorage.app",
  messagingSenderId: "814865353584",
  appId: "1:814865353584:web:66a21753dacfb2e8de1db5"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
