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
  limit
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Subject, Exam, Question, Book, Favorite, AIConversation, AIMessage } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  // In dev, we might want to return mock data if the error is "project not found"
  if (errInfo.error.includes("could not be found") || errInfo.error.includes("placeholder")) {
    return true; // flag to use mock data
  }
  throw new Error(JSON.stringify(errInfo));
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
      const snap = await getDocs(collection(db, 'subjects'));
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
    const [exams, books, questions] = await Promise.all([
      this.getExams(),
      this.getBooks(),
      this.getQuestions()
    ]);
    return {
      exams: exams.length,
      books: books.length,
      questions: questions.length
    };
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
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (e) {
      handleFirestoreError(e, OperationType.GET, 'users');
      return [];
    }
  },

  async sendMessage(senderId: string, receiverId: string, text: string) {
    try {
      const chatRoomId = [senderId, receiverId].sort().join('_');
      await addDoc(collection(db, 'messages'), {
        chatRoomId,
        senderId,
        receiverId,
        text,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'messages');
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
