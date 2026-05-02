import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Exams from './pages/Exams';
import Questions from './pages/Questions';
import Books from './pages/Books';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Chat from './pages/Chat';
import AITutor from './pages/AITutor';
import Profile from './pages/Profile';
import Leaderboard from './pages/Leaderboard';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/exams" element={<Exams />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/books" element={<Books />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/ai-tutor" element={<AITutor />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          {/* Specific subject views could be added as well */}
          <Route path="/subject/:id" element={<Exams />} /> 
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
