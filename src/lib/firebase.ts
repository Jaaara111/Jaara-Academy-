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

// Synchronous check if file exists is not possible in browser, 
// so we use a more robust try-catch with dynamic import.
try {
  // @ts-ignore
  const config = await import('../../firebase-applet-config.json');
  if (config && config.default) {
    firebaseConfig = config.default;
    if (config.default.firestoreDatabaseId) {
      firestoreDatabaseId = config.default.firestoreDatabaseId;
    }
  }
} catch (e) {
  console.warn("Firebase configuration not fully loaded yet or missing.");
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = getFirestore(app, firestoreDatabaseId);

async function testConnection() {
  if (firebaseConfig.apiKey === "placeholder") return;
  
  try {
    // Force a server check with a small timeout logic in the calling side or just let it fail
    const docRef = doc(db, 'test', 'connection');
    await getDocFromServer(docRef);
    console.log("Firestore connection verified.");
  } catch (error) {
    console.error("Firestore connection issue:", error);
  }
}

// testConnection();
