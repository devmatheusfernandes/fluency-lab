import admin from 'firebase-admin';
import { getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Validate required environment variables for Firebase Admin
const requiredEnvVars = [
  'FIREBASE_ADMIN_PROJECT_ID',
  'FIREBASE_ADMIN_CLIENT_EMAIL',
  'FIREBASE_ADMIN_PRIVATE_KEY',
];

// Check for missing environment variables
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.warn('Missing required Firebase Admin environment variables:', missingEnvVars);
  // In development, throw an error to prevent startup
  if (process.env.NODE_ENV === 'development') {
    throw new Error(`Missing required Firebase Admin environment variables: ${missingEnvVars.join(', ')}`);
  }
}

// As credenciais são lidas das variáveis de ambiente
const serviceAccount = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

let app: App;

if (!getApps().length) {
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  app = getApps()[0];
}

const adminDb = admin.firestore();
const adminAuth = getAuth(app);

// Exporta o banco de dados e a autenticação com privilégios de administrador
export { adminDb, adminAuth };