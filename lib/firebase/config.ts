// lib/firebase/config.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Suas chaves de configuração do Firebase, armazenadas de forma segura em variáveis de ambiente.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Padrão Singleton: Inicializa o Firebase apenas uma vez.
// Isso evita erros e múltiplas instâncias durante o desenvolvimento com o Next.js (Hot Reload).
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Exporta as instâncias dos serviços que você usará no projeto.
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };