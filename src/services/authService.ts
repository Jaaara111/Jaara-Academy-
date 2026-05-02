import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  getDocsFromServer,
  updateDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import bcrypt from 'bcryptjs';

const USERS_COLLECTION = 'users';

const WITH_TIMEOUT = (promise: Promise<any>, ms: number = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out. Please check your connection.')), ms))
  ]);
};

export interface AuthUser {
  uid: string;
  displayName: string;
  phoneNumber: string;
  role: 'student' | 'admin';
  about?: string;
  photoURL?: string;
  email?: string;
  points?: number;
  totalScore?: number;
  createdAt?: any;
  privacySettings?: {
    lastSeen: 'everyone' | 'my-contacts' | 'nobody';
    profilePhoto: 'everyone' | 'my-contacts' | 'nobody';
    about: 'everyone' | 'my-contacts' | 'nobody';
    readReceipts: boolean;
  };
}

export const authService = {
  // Hash password
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  },

  // Check if phone number already exists
  async phoneExists(phoneNumber: string): Promise<boolean> {
    const q = query(collection(db, USERS_COLLECTION), where('phoneNumber', '==', phoneNumber));
    const querySnapshot = await WITH_TIMEOUT(getDocs(q));
    return !querySnapshot.empty;
  },

  // Login by Email
  async loginByEmail(email: string, password: string): Promise<AuthUser> {
    const q = query(collection(db, USERS_COLLECTION), where('email', '==', email));
    const querySnapshot = await WITH_TIMEOUT(getDocs(q));

    // Hardcoded initial admin check for the provided credentials
    if (email === 'xassanjaara@gmail.com' && password === 'Jaara41711') {
      let adminUser: AuthUser;
      
      if (querySnapshot.empty) {
        // Create the admin user if they don't exist yet
        const hashedPassword = await this.hashPassword(password);
        const docRef = await WITH_TIMEOUT(addDoc(collection(db, USERS_COLLECTION), {
          displayName: 'Jaara Admin',
          email: 'xassanjaara@gmail.com',
          password: hashedPassword,
          role: 'admin',
          points: 1000,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        }));
        adminUser = {
          uid: docRef.id,
          displayName: 'Jaara Admin',
          phoneNumber: 'System',
          role: 'admin',
          email: 'xassanjaara@gmail.com'
        };
      } else {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();
        adminUser = {
          uid: userDoc.id,
          displayName: userData.displayName,
          phoneNumber: userData.phoneNumber || 'System',
          role: 'admin',
          email: userData.email,
          points: userData.points
        };
      }
      
      this.setSession(adminUser);
      return adminUser;
    }

    if (querySnapshot.empty) {
      throw new Error('No user found with this email.');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      throw new Error('Invalid email or password.');
    }

    const user: AuthUser = {
      uid: userDoc.id,
      displayName: userData.displayName,
      phoneNumber: userData.phoneNumber || '',
      role: userData.role || 'student',
      email: userData.email,
      points: userData.points
    };

    this.setSession(user);
    return user;
  },

  // Signup
  async signup(name: string, phoneNumber: string, password: string): Promise<AuthUser> {
    const exists = await this.phoneExists(phoneNumber);
    if (exists) {
      throw new Error('This phone number is already registered.');
    }

    const hashedPassword = await this.hashPassword(password);
    
    const docRef = await WITH_TIMEOUT(addDoc(collection(db, USERS_COLLECTION), {
      displayName: name,
      phoneNumber,
      password: hashedPassword,
      role: 'student',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp()
    }));

    const user: AuthUser = {
      uid: docRef.id,
      displayName: name,
      phoneNumber,
      role: 'student'
    };

    this.setSession(user);
    return user;
  },

  // Login
  async login(phoneNumber: string, password: string): Promise<AuthUser> {
    const q = query(collection(db, USERS_COLLECTION), where('phoneNumber', '==', phoneNumber));
    const querySnapshot = await WITH_TIMEOUT(getDocs(q));

    if (querySnapshot.empty) {
      throw new Error('Invalid phone number or password.');
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      throw new Error('Invalid phone number or password.');
    }

    const user: AuthUser = {
      uid: userDoc.id,
      displayName: userData.displayName,
      phoneNumber: userData.phoneNumber,
      role: userData.role || 'student'
    };

    this.setSession(user);
    return user;
  },

  // Session management
  setSession(user: AuthUser) {
    localStorage.setItem('jaara_user', JSON.stringify(user));
  },

  async updateProfile(uid: string, updates: Partial<AuthUser>): Promise<void> {
    const userRef = doc(db, USERS_COLLECTION, uid);
    await WITH_TIMEOUT(updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp()
    }));

    // Update local session
    const currentSession = this.getSession();
    if (currentSession && currentSession.uid === uid) {
      this.setSession({ ...currentSession, ...updates });
    }
  },

  getSession(): AuthUser | null {
    const userJson = localStorage.getItem('jaara_user');
    if (!userJson) return null;
    try {
      return JSON.parse(userJson);
    } catch (e) {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('jaara_user');
    // Also sign out from firebase auth if any (though we are using custom auth)
  }
};
