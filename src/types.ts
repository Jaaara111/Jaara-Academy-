export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name?: string;
  displayName?: string;
  email?: string;
  phoneNumber?: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
}

export interface Exam {
  id: string;
  subjectId: string;
  year: number;
  level: 'Class 8' | 'Form 4';
  title: string;
  pdfUrl: string;
  createdAt: string;
}

export interface Question {
  id: string;
  subjectId: string;
  text: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  createdAt: string;
}

export interface Book {
  id: string;
  subjectId: string;
  title: string;
  grade: string;
  pdfUrl: string;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  userId: string;
  title: string;
  createdAt: any;
  lastActive: any;
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'model';
  content: string;
  timestamp: any;
}

export interface Favorite {
  id: string;
  userId: string;
  targetType: 'exam' | 'question' | 'book';
  targetId: string;
  createdAt: string;
}
