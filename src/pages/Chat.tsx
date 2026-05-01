import React, { useState, useEffect, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import { dbService } from '@/services/db';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Send, Search, Phone, MoreVertical, MessageSquare, User, Loader2, ArrowLeft, Check, CheckCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: any;
  status?: 'sent' | 'delivered' | 'read';
}

interface ChatUser {
  id: string;
  displayName?: string;
  phoneNumber?: string;
  photoURL?: string;
  lastLogin?: any;
}

export default function Chat() {
  const [user, authLoading] = useAuthState(auth);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchUsers = async () => {
      const allUsers = await dbService.getAllUsers();
      // Filter out self
      setUsers(allUsers.filter(u => u.id !== user.uid));
      setLoading(false);
    };

    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedUser) {
      setMessages([]);
      return;
    }

    const roomId = [user.uid, selectedUser.id].sort().join('_');
    const q = query(
      collection(db, 'messages'),
      where('chatRoomId', '==', roomId),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(msgs);
      
      // Auto scroll
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }, (err) => {
      console.error("Chat error:", err);
      toast.error("Failed to load real-time messages");
    });

    return () => unsubscribe();
  }, [user, selectedUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedUser || !newMessage.trim()) return;

    try {
      const text = newMessage.trim();
      setNewMessage('');
      await dbService.sendMessage(user.uid, selectedUser.id, text);
    } catch (err) {
      toast.error("Message failed to send");
    }
  };

  if (authLoading || (loading && user)) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 font-medium">Connecting to Jaara Academy Hub...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6">
          <MessageSquare className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Secure Academy Chat</h1>
        <p className="text-slate-500 max-w-sm mx-auto mb-8">
          Join the conversation with students and teachers. Sign in with your phone to start chatting.
        </p>
        <Button onClick={() => window.location.href = '/login'} className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100">
          Sign In to Access Chat
        </Button>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.phoneNumber?.includes(searchQuery)
  );

  return (
    <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-140px)] flex bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden mb-12">
      {/* Users List Sidebar */}
      <div className={`${selectedUser ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[350px] border-r border-slate-100 bg-[#F0F2F5] dark:bg-slate-900`}>
        <div className="p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold dark:text-white">Messages</h2>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="rounded-full"><User className="w-5 h-5 text-slate-500" /></Button>
              <Button variant="ghost" size="icon" className="rounded-full"><MoreVertical className="w-5 h-5 text-slate-500" /></Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder="Search or start new chat" 
              className="bg-slate-100 dark:bg-slate-700 border-none rounded-xl pl-10 h-10 focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="py-2">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm">No contacts found</p>
              </div>
            ) : (
              filteredUsers.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u)}
                  className={`w-full flex items-center gap-3 p-4 transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800 ${selectedUser?.id === u.id ? 'bg-slate-200 dark:bg-slate-800' : ''}`}
                >
                  <Avatar className="w-12 h-12 border-2 border-white">
                    <AvatarImage src={u.photoURL} />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                      {u.displayName?.[0] || 'S'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-slate-900 dark:text-white truncate">{u.displayName || u.phoneNumber}</span>
                      {u.lastLogin && (
                        <span className="text-[10px] text-slate-500">
                          {format(u.lastLogin.toDate(), 'HH:mm')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">Tap to start conversation</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Window */}
      <div className={`${selectedUser ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-[#E5DDD5] dark:bg-slate-950 relative`}>
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <header className="bg-white dark:bg-slate-800 p-3 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="md:hidden rounded-full mr-1 -ml-2" onClick={() => setSelectedUser(null)}>
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={selectedUser.photoURL} />
                  <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                    {selectedUser.displayName?.[0] || 'S'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white leading-none">{selectedUser.displayName || selectedUser.phoneNumber}</h3>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Online</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-full text-slate-500 hover:text-blue-600"><Phone className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full text-slate-500"><Search className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" className="rounded-full text-slate-500"><MoreVertical className="w-5 h-5" /></Button>
              </div>
            </header>

            {/* Messages Area */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-2 scroll-smooth" 
              ref={scrollRef}
              style={{
                backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")',
                opacity: 0.95
              }}
            >
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user.uid;
                const prevMsg = messages[i-1];
                const showDate = !prevMsg || format(msg.createdAt?.toDate(), 'MMM d') !== format(prevMsg.createdAt?.toDate(), 'MMM d');

                return (
                  <React.Fragment key={msg.id}>
                    {showDate && (
                      <div className="flex justify-center my-4">
                        <span className="bg-white/90 dark:bg-slate-800 shadow-sm px-3 py-1 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-100/50">
                          {format(msg.createdAt?.toDate(), 'MMMM d, yyyy')}
                        </span>
                      </div>
                    )}
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl shadow-sm relative group ${
                        isMe ? 'bg-[#DCF8C6] dark:bg-blue-600 text-slate-900 dark:text-white rounded-tr-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-none'
                      }`}>
                        <p className="text-sm leading-relaxed mb-1 pr-10">{msg.text}</p>
                        <div className="flex items-center gap-1 absolute bottom-1 right-2">
                          <span className="text-[10px] opacity-60 font-medium">
                            {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm') : '--:--'}
                          </span>
                          {isMe && (
                            <CheckCheck className="w-3 h-3 text-blue-500 opacity-80" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Chat Input */}
            <footer className="p-3 bg-[#F0F2F5] dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full text-slate-500">
                <span className="text-xl">😊</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full text-slate-500">
                <span className="text-xl">📎</span>
              </Button>
              <form onSubmit={handleSendMessage} className="flex-1 flex gap-2">
                <Input 
                  placeholder="Type a message..." 
                  className="bg-white dark:bg-slate-800 border-none rounded-xl h-11 focus-visible:ring-blue-500 text-slate-900 dark:text-white"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={!newMessage.trim()}
                  className="rounded-full h-11 w-11 bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-lg shadow-blue-100"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-white/50 backdrop-blur rounded-full flex items-center justify-center shadow-xl mb-6 relative">
              <MessageSquare className="w-12 h-12 text-blue-600/20 absolute animate-ping" />
              <MessageSquare className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Jaara Academy Web Hub</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Select a contact to start messaging. Your chats are synced across all your devices.
            </p>
            <div className="mt-12 flex items-center gap-2 text-xs text-slate-400 font-medium">
              <CheckCheck className="w-4 h-4 text-blue-500" /> End-to-end learning verification
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
