import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Fallback configuration if firebase-applet-config.json is missing or invalid
const fallbackConfig = {
  apiKey: "placeholder",
  authDomain: "placeholder",
  projectId: "placeholder",
  storageBucket: "placeholder",
  messagingSenderId: "placeholder",
  appId: "placeholder"
};

let firebaseConfig = fallbackConfig;
let firestoreDatabaseId = "(default)";

try {
  // @ts-ignore
  const config = await import('../../firebase-applet-config.json');
  firebaseConfig = config.default;
  const configData = config.default as any;
  if (configData.firestoreDatabaseId) {
    firestoreDatabaseId = configData.firestoreDatabaseId;
  }
} catch (e) {
  console.warn("Firebase config not found. Running in offline/mock mode.");
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app, firestoreDatabaseId);

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. You may be offline or the project is not provisioned.");
    }
  }
}

if (firebaseConfig.apiKey !== "placeholder") {
  testConnection();
}
