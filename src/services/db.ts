import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  serverTimestamp,
  getDoc,
  setDoc,
  limit,
  orderBy
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { authService } from './authService';
import { Subject, Exam, Question, Book, Favorite, AIConversation, AIMessage } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

const WITH_TIMEOUT = (promise: Promise<any>, ms: number = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timed out. Please check your connection.')), ms))
  ]);
};

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const user = authService.getSession();
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: user?.uid,
      phoneNumber: user?.phoneNumber,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // In dev/debug, return to allow fallback to mock data
  return;
}

// MOCK DATA for initial display if DB is not ready
const MOCK_SUBJECTS: Subject[] = [
  { id: 'math', name: 'Mathematics', icon: 'Calculator' },
  { id: 'bio', name: 'Biology', icon: 'Microscope' },
  { id: 'chem', name: 'Chemistry', icon: 'Beaker' },
  { id: 'phys', name: 'Physics', icon: 'Zap' },
  { id: 'eng', name: 'English', icon: 'Book' },
  { id: 'hist', name: 'History', icon: 'History' },
];

export const dbService = {
  async getSubjects(): Promise<Subject[]> {
    try {
      const snap = await WITH_TIMEOUT(getDocs(collection(db, 'subjects')));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Subject));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'subjects');
      return MOCK_SUBJECTS;
    }
  },

  async getExams(subjectId?: string): Promise<Exam[]> {
    try {
      const colRef = collection(db, 'exams');
      const q = subjectId ? query(colRef, where('subjectId', '==', subjectId)) : colRef;
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Exam));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'exams');
      return [];
    }
  },

  async getQuestions(subjectId?: string): Promise<Question[]> {
    try {
      const colRef = collection(db, 'questions');
      const q = subjectId ? query(colRef, where('subjectId', '==', subjectId)) : colRef;
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Question));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'questions');
      return [
        {
          id: 'q1',
          subjectId: 'math',
          text: 'What is the square root of 144?',
          options: ['10', '11', '12', '14'],
          correctAnswer: '2',
          explanation: '12 * 12 = 144, so the square root of 144 is 12.',
          createdAt: new Date().toISOString()
        }
      ];
    }
  },

  async getBooks(subjectId?: string): Promise<Book[]> {
    try {
      const colRef = collection(db, 'books');
      const q = subjectId ? query(colRef, where('subjectId', '==', subjectId)) : colRef;
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Book));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'books');
      return [];
    }
  },

  async addExam(exam: Omit<Exam, 'id' | 'createdAt'>) {
    try {
      return await addDoc(collection(db, 'exams'), {
        ...exam,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'exams');
    }
  },

  async addQuestion(question: Omit<Question, 'id' | 'createdAt'>) {
    try {
      return await addDoc(collection(db, 'questions'), {
        ...question,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'questions');
    }
  },

  async addBook(book: Omit<Book, 'id' | 'createdAt'>) {
    try {
      return await addDoc(collection(db, 'books'), {
        ...book,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'books');
    }
  },

  async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.url;
  },

  async getStats() {
    try {
      const [exams, books, questions, users] = await Promise.all([
        this.getExams(),
        this.getBooks(),
        this.getQuestions(),
        this.getAllUsers()
      ]);
      return {
        exams: exams.length,
        books: books.length,
        questions: questions.length,
        users: users.length
      };
    } catch (e) {
      return { exams: 0, books: 0, questions: 0, users: 0 };
    }
  },

  async deleteUser(id: string) {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'users');
    }
  },

  async updateUserRole(id: string, role: 'student' | 'admin') {
    try {
      await updateDoc(doc(db, 'users', id), { role });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'users');
    }
  },

  async updateUserScore(userId: string, points: number) {
    try {
      const userDoc = doc(db, 'users', userId);
      const snap = await getDoc(userDoc);
      if (snap.exists()) {
        const currentScore = snap.data().totalScore || 0;
        const currentPoints = snap.data().points || 0;
        await updateDoc(userDoc, {
          totalScore: currentScore + points,
          points: currentPoints + points,
          lastActivity: serverTimestamp()
        });
      }
    } catch (e) {
      console.error("Error updating score:", e);
    }
  },

  async getLeaderboard(): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'users'), 
        orderBy('totalScore', 'desc'), 
        limit(20)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      console.error("Error fetching leaderboard:", e);
      return [];
    }
  },

  async deleteExam(id: string) {
    try {
      await deleteDoc(doc(db, 'exams', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'exams');
    }
  },

  async deleteBook(id: string) {
    try {
      await deleteDoc(doc(db, 'books', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'books');
    }
  },

  async deleteQuestion(id: string) {
    try {
      await deleteDoc(doc(db, 'questions', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'questions');
    }
  },

  async addSubject(name: string, icon: string) {
    try {
      return await addDoc(collection(db, 'subjects'), {
        name,
        icon,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'subjects');
    }
  },

  async deleteSubject(id: string) {
    try {
      await deleteDoc(doc(db, 'subjects', id));
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'subjects');
    }
  },

  async updateExam(id: string, data: Partial<Exam>) {
    try {
      await updateDoc(doc(db, 'exams', id), data);
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'exams');
    }
  },

  async syncUser(uid: string, phoneNumber: string | null, displayName?: string | null) {
    if (!phoneNumber && !displayName) return;
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        phoneNumber,
        displayName: displayName || undefined,
        lastLogin: serverTimestamp()
      });
    } catch (e) {
      // If doc doesn't exist, create it
      try {
        await setDoc(doc(db, 'users', uid), {
          uid,
          phoneNumber,
          displayName: displayName || 'Student',
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp()
        });
      } catch (e2) {
        handleFirestoreError(e2, OperationType.WRITE, 'users');
      }
    }
  },

  async getAllUsers(): Promise<any[]> {
    try {
      const q = query(collection(db, 'users'), limit(50));
      const snapshot = await WITH_TIMEOUT(getDocs(q));
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'users');
      return [];
    }
  },

  async sendMessage(senderId: string, receiverId: string, text: string) {
    try {
      const chatRoomId = [senderId, receiverId].sort().join('_');
      
      // 1. Add message
      await addDoc(collection(db, 'chat_messages'), {
        chatRoomId,
        senderId,
        receiverId,
        text,
        createdAt: serverTimestamp()
      });

      // 2. Update conversation metadata
      const convRef = doc(db, 'chat_conversations', chatRoomId);
      const convSnap = await getDoc(convRef);

      if (convSnap.exists()) {
        await updateDoc(convRef, {
          lastMessage: text,
          lastMessageSenderId: senderId,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(convRef, {
          participants: [senderId, receiverId],
          lastMessage: text,
          lastMessageSenderId: senderId,
          updatedAt: serverTimestamp()
        });
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'chat_messages');
    }
  },

  async getChatConversations(userId: string): Promise<any[]> {
    try {
      const q = query(
        collection(db, 'chat_conversations'),
        where('participants', 'array-contains', userId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'chat_conversations');
      return [];
    }
  },

  // --- AI TUTOR CONVERSATIONS ---
  async createConversation(userId: string, title: string) {
    try {
      return await addDoc(collection(db, 'conversations'), {
        userId,
        title,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'conversations');
    }
  },

  async getConversations(userId: string): Promise<AIConversation[]> {
    try {
      const q = query(
        collection(db, 'conversations'),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AIConversation));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'conversations');
      return [];
    }
  },

  async deleteConversation(id: string) {
    try {
      const q = query(collection(db, 'ai_messages'), where('conversationId', '==', id));
      const snap = await getDocs(q);
      const batch = snap.docs.map(m => deleteDoc(doc(db, 'ai_messages', m.id)));
      await Promise.all([...batch, deleteDoc(doc(db, 'conversations', id))]);
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, 'conversations');
    }
  },

  async addAIMessage(conversationId: string, role: 'user' | 'model', content: string) {
    try {
      await addDoc(collection(db, 'ai_messages'), {
        conversationId,
        role,
        content,
        timestamp: serverTimestamp()
      });
      await updateDoc(doc(db, 'conversations', conversationId), {
        lastActive: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'ai_messages');
    }
  },

  async getAIMessages(conversationId: string): Promise<AIMessage[]> {
    try {
      const q = query(
        collection(db, 'ai_messages'),
        where('conversationId', '==', conversationId)
      );
      const snap = await getDocs(q);
      return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as AIMessage))
        .sort((a: any, b: any) => (a.timestamp?.seconds || 0) - (b.timestamp?.seconds || 0));
    } catch (e) {
      handleFirestoreError(e, OperationType.LIST, 'ai_messages');
      return [];
    }
  },

  async updateConversationTitle(id: string, title: string) {
    try {
      await updateDoc(doc(db, 'conversations', id), { title });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, 'conversations');
    }
  }
};
