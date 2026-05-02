import React, { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { dbService } from '@/services/db';
import { authService, AuthUser } from '@/services/authService';
import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Send, Search, Phone, MoreVertical, MessageSquare, User, Loader2, ArrowLeft, Check, CheckCheck, LogIn, Plus, Settings, Shield, Bell, HelpCircle, LogOut, ChevronRight, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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

interface ChatConversation {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageSenderId: string;
  updatedAt: any;
  otherUser?: ChatUser;
}

export default function Chat() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsView, setSettingsView] = useState<'main' | 'profile' | 'privacy' | 'account' | 'notifications' | 'help' | 'privacy_last_seen' | 'privacy_profile_photo'>('main');
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempAbout, setTempAbout] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setTempName(user.displayName);
      setTempAbout(user.about || 'Hey there! I am using Jaara Academy.');
    }
  }, [user]);

  const handleUpdateProfile = async (field: 'name' | 'about') => {
    if (!user) return;
    setIsSaving(true);
    try {
      const updates = field === 'name' ? { displayName: tempName } : { about: tempAbout };
      await authService.updateProfile(user.uid, updates);
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
      if (field === 'name') setIsEditingName(false);
      else setIsEditingAbout(false);
      // Reload user from local session
      setUser(authService.getSession());
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePrivacy = async (key: string, value: any) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const currentPrivacy = user.privacySettings || {
        lastSeen: 'everyone',
        profilePhoto: 'everyone',
        about: 'everyone',
        readReceipts: true
      };
      const updates = {
        privacySettings: {
          ...currentPrivacy,
          [key]: value
        }
      };
      await authService.updateProfile(user.uid, updates);
      toast.success('Privacy settings updated');
      setUser(authService.getSession());
    } catch (error: any) {
      toast.error('Failed to update privacy settings');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const session = authService.getSession();
    setUser(session);
    setAuthLoading(false);
  }, []);

  useEffect(() => {
    if (!user) return;

    // Fetch existing conversations
    const q = query(
      collection(db, 'chat_conversations'),
      where('participants', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const allUsers = await dbService.getAllUsers();
      
      const convs = snapshot.docs.map(doc => {
        const data = doc.data() as ChatConversation;
        const otherUserId = data.participants.find(p => p !== user.uid);
        const otherUser = allUsers.find(u => u.id === otherUserId);
        return {
          id: doc.id,
          ...data,
          otherUser
        };
      });
      
      setConversations(convs);
      setUsers(allUsers.filter(u => u.id !== user.uid));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || !selectedUser) {
      setMessages([]);
      return;
    }

    const roomId = [user.uid, selectedUser.id].sort().join('_');
    const q = query(
      collection(db, 'chat_messages'),
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
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 font-bold shadow-xl shadow-blue-50">
          <MessageSquare className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Secure Academy Chat</h1>
        <p className="text-slate-500 max-w-sm mx-auto mb-8">
          Fadlan gudaha u soo gal akoonkaaga si aad ula sheekaysato ardayda kale iyo macalimiinta Jaara Academy.
        </p>
        <Button 
          onClick={() => navigate('/login')} 
          className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-xl shadow-blue-100"
        >
          <LogIn className="w-6 h-6" /> Sign In to Access Chat
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
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border border-slate-100 cursor-pointer" onClick={() => { setShowSettings(true); setSettingsView('profile'); }}>
                <AvatarImage src={user?.photoURL} />
                <AvatarFallback className="bg-blue-600 text-white font-bold">{user?.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <h2 className="text-xl font-bold dark:text-white">Chats</h2>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className={`rounded-full ${showUserSearch ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}
                onClick={() => setShowUserSearch(!showUserSearch)}
              >
                <Plus className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full text-slate-500"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              placeholder={showUserSearch ? "Search people..." : "Search messages..."}
              className="bg-slate-100 dark:bg-slate-700 border-none rounded-xl pl-10 h-10 focus-visible:ring-blue-500"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="py-2">
            {showUserSearch ? (
              // Search Users to start new chat
              <div className="space-y-1 px-2">
                <p className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">New Chat</p>
                {filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    <p className="text-sm">No contacts found</p>
                  </div>
                ) : (
                  filteredUsers.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        setSelectedUser(u);
                        setShowUserSearch(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-2xl transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800"
                    >
                      <Avatar className="w-10 h-10 border-2 border-white">
                        <AvatarImage src={u.photoURL} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xs">
                          {u.displayName?.[0] || 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left min-w-0">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate block">{u.displayName || u.phoneNumber}</span>
                        <p className="text-[10px] text-slate-500 truncate">{u.phoneNumber}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              // Conversations List (WhatsApp Style)
              <div className="space-y-0.5">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                      <MessageSquare className="w-8 h-8" />
                    </div>
                    <p className="text-sm text-slate-500">No conversations yet</p>
                    <Button 
                      variant="link" 
                      onClick={() => setShowUserSearch(true)}
                      className="text-blue-600 font-bold h-auto p-0 mt-2"
                    >
                      Start a new chat
                    </Button>
                  </div>
                ) : (
                  conversations.map(conv => {
                    const isMeLastSender = conv.lastMessageSenderId === user.uid;
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedUser(conv.otherUser || null)}
                        className={`w-full flex items-center gap-3 p-4 transition-colors hover:bg-slate-200/50 dark:hover:bg-slate-800 border-b border-white dark:border-slate-800/50 ${selectedUser?.id === conv.otherUser?.id ? 'bg-slate-200 dark:bg-slate-800' : ''}`}
                      >
                        <Avatar className="w-14 h-14 border-2 border-white shadow-sm">
                          <AvatarImage src={conv.otherUser?.photoURL} />
                          <AvatarFallback className="bg-blue-100 text-blue-700 font-extrabold text-lg">
                            {conv.otherUser?.displayName?.[0] || 'S'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {conv.otherUser?.displayName || conv.otherUser?.phoneNumber || 'Unknown'}
                            </span>
                            {conv.updatedAt && (
                              <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap ml-2">
                                {format(conv.updatedAt.toDate(), 'HH:mm')}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {isMeLastSender && <CheckCheck className="w-3 h-3 text-blue-500" />}
                            <p className="text-xs text-slate-500 truncate">
                              {conv.lastMessage || 'Sent an attachment'}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* WhatsApp Style Settings Panel Overlay */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute left-0 top-0 w-full md:w-[350px] h-full bg-[#F0F2F5] dark:bg-slate-900 z-50 flex flex-col"
          >
            {/* Settings Header */}
            <header className="h-[108px] bg-[#008069] dark:bg-blue-700 text-white flex items-end p-5 pb-4">
              <div className="flex items-center gap-6">
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full" onClick={() => {
                  if (settingsView === 'main') setShowSettings(false);
                  else if (settingsView.startsWith('privacy_')) setSettingsView('privacy');
                  else setSettingsView('main');
                }}>
                  <ArrowLeft className="w-6 h-6" />
                </Button>
                <h3 className="text-lg font-bold">
                  {settingsView === 'main' ? 'Settings' : 
                   settingsView === 'profile' ? 'Profile' : 
                   settingsView === 'privacy' ? 'Privacy' :
                   settingsView === 'privacy_last_seen' ? 'Last seen' :
                   settingsView === 'privacy_profile_photo' ? 'Profile photo' :
                   settingsView.charAt(0).toUpperCase() + settingsView.slice(1)}
                </h3>
              </div>
            </header>

            <ScrollArea className="flex-1">
              {settingsView === 'main' ? (
                <div className="py-4">
                  {/* Profile Summary */}
                  <button 
                    onClick={() => setSettingsView('profile')}
                    className="w-full flex items-center gap-4 p-4 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-800 mb-4"
                  >
                    <Avatar className="w-16 h-16 border-2 border-white shadow-sm">
                      <AvatarImage src={user?.photoURL} />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-xl">{user?.displayName?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <h4 className="text-lg font-medium dark:text-white leading-tight">{user?.displayName || 'Set your name'}</h4>
                      <p className="text-slate-500 text-sm truncate max-w-[200px]">{user?.about || 'Hey there! I am using Jaara Academy.'}</p>
                    </div>
                  </button>

                  <div className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700">
                    {[
                      { id: 'account', label: 'Account', icon: User, sub: 'Security, change number' },
                      { id: 'privacy', label: 'Privacy', icon: Shield, sub: 'Last seen, profile photo' },
                      { id: 'notifications', label: 'Notifications', icon: Bell, sub: 'Message, group & call tones' },
                      { id: 'help', label: 'Help', icon: HelpCircle, sub: 'Help center, contact us' },
                    ].map(item => (
                      <button 
                        key={item.id}
                        onClick={() => setSettingsView(item.id as any)}
                        className="w-full flex items-center justify-between p-4 px-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-6 text-slate-600 dark:text-slate-300">
                          <item.icon className="w-5 h-5 opacity-60" />
                          <div className="text-left">
                            <p className="font-medium text-slate-900 dark:text-white leading-none mb-1">{item.label}</p>
                            <p className="text-xs text-slate-400">{item.sub}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                    <button 
                      onClick={() => authService.logout()}
                      className="w-full flex items-center gap-6 p-4 px-6 hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Log out</span>
                    </button>
                  </div>
                </div>
              ) : settingsView === 'profile' ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center py-8">
                    <div className="relative group">
                      <Avatar className="w-48 h-48 border-4 border-white shadow-xl">
                        <AvatarImage src={user?.photoURL} />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold text-5xl">{user?.displayName?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer">
                        <Camera className="w-10 h-10 mb-1" />
                        <span className="text-[10px] font-bold uppercase">Change Photo</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-6 shadow-sm space-y-6">
                    <div className="space-y-1">
                      <p className="text-[11px] font-bold text-[#008069] dark:text-blue-400 uppercase tracking-widest">Your Name</p>
                      {isEditingName ? (
                        <div className="flex items-center gap-2 mt-2 border-b-2 border-[#008069] pb-1">
                          <Input 
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="border-none focus-visible:ring-0 p-0 h-auto text-lg font-medium bg-transparent"
                            autoFocus
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            disabled={isSaving}
                            onClick={() => handleUpdateProfile('name')}
                            className="text-[#008069]"
                          >
                            <Check className="w-5 h-5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => setIsEditingName(true)}>
                          <p className="text-slate-900 dark:text-white text-lg font-medium">{user?.displayName || 'Set your name'}</p>
                          <Button variant="ghost" size="icon" className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-4 h-4 rotate-45" /></Button>
                        </div>
                      )}
                      {!isEditingName && (
                        <p className="text-xs text-slate-400 leading-relaxed mt-2">
                          This is not your username or pin. This name will be visible to your Jaara Academy contacts.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1 pt-4 border-t border-slate-50 dark:border-slate-700">
                      <p className="text-[11px] font-bold text-[#008069] dark:text-blue-400 uppercase tracking-widest">About</p>
                      {isEditingAbout ? (
                        <div className="flex items-center gap-2 mt-2 border-b-2 border-[#008069] pb-1">
                          <Input 
                            value={tempAbout}
                            onChange={(e) => setTempAbout(e.target.value)}
                            className="border-none focus-visible:ring-0 p-0 h-auto text-slate-900 dark:text-white bg-transparent"
                            autoFocus
                          />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            disabled={isSaving}
                            onClick={() => handleUpdateProfile('about')}
                            className="text-[#008069]"
                          >
                            <Check className="w-5 h-5" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group cursor-pointer" onClick={() => setIsEditingAbout(true)}>
                          <p className="text-slate-900 dark:text-white">{user?.about || 'Hey there! I am using Jaara Academy.'}</p>
                          <Button variant="ghost" size="icon" className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"><Plus className="w-4 h-4 rotate-45" /></Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 pt-4 border-t border-slate-50 dark:border-slate-700">
                      <p className="text-[11px] font-bold text-[#008069] dark:text-blue-400 uppercase tracking-widest">Phone Number</p>
                      <p className="text-slate-900 dark:text-white font-mono">{user?.phoneNumber || 'Not linked'}</p>
                    </div>
                  </div>
                </div>
              ) : settingsView === 'privacy' ? (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-700">
                    <div className="p-4 px-6">
                      <p className="text-[11px] font-bold text-[#008069] dark:text-blue-400 uppercase tracking-widest mb-4">Who can see my personal info</p>
                      
                      <button 
                        onClick={() => setSettingsView('privacy_last_seen')}
                        className="w-full py-4 flex items-center justify-between group"
                      >
                        <div className="text-left">
                          <p className="text-slate-900 dark:text-white font-medium">Last seen</p>
                          <p className="text-xs text-slate-400 capitalize">{user?.privacySettings?.lastSeen || 'everyone'}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                      </button>

                      <button 
                        onClick={() => setSettingsView('privacy_profile_photo')}
                        className="w-full py-4 flex items-center justify-between group"
                      >
                        <div className="text-left">
                          <p className="text-slate-900 dark:text-white font-medium">Profile photo</p>
                          <p className="text-xs text-slate-400 capitalize">{user?.privacySettings?.profilePhoto || 'everyone'}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                      </button>

                      <div className="w-full py-4 flex items-center justify-between">
                        <div className="text-left">
                          <p className="text-slate-900 dark:text-white font-medium">Read receipts</p>
                          <p className="text-[10px] text-slate-400 max-w-[200px]">If turned off, you won't send or receive Read receipts. Read receipts are always sent for group chats.</p>
                        </div>
                        <div 
                          className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${user?.privacySettings?.readReceipts !== false ? 'bg-[#008069]' : 'bg-slate-300'}`}
                          onClick={() => handleUpdatePrivacy('readReceipts', user?.privacySettings?.readReceipts === false)}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${user?.privacySettings?.readReceipts !== false ? 'right-0.5' : 'left-0.5'}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-slate-800 p-6 shadow-sm">
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Privacy settings are synced across all your Jaara Academy devices.
                    </p>
                  </div>
                </div>
              ) : settingsView === 'privacy_last_seen' ? (
                <div className="bg-white dark:bg-slate-800 h-full">
                  <div className="p-6">
                    <p className="text-[11px] font-bold text-[#008069] dark:text-blue-400 uppercase tracking-widest mb-6">Who can see my last seen</p>
                    <div className="space-y-6">
                      {['everyone', 'my-contacts', 'nobody'].map((option) => (
                        <label key={option} className="flex items-center justify-between cursor-pointer group">
                          <span className="text-slate-900 dark:text-white capitalize">{option.replace('-', ' ')}</span>
                          <input 
                            type="radio" 
                            name="last-seen" 
                            className="w-5 h-5 accent-[#008069]"
                            checked={(user?.privacySettings?.lastSeen || 'everyone') === option}
                            onChange={() => handleUpdatePrivacy('lastSeen', option)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : settingsView === 'privacy_profile_photo' ? (
                <div className="bg-white dark:bg-slate-800 h-full">
                  <div className="p-6">
                    <p className="text-[11px] font-bold text-[#008069] dark:text-blue-400 uppercase tracking-widest mb-6">Who can see my profile photo</p>
                    <div className="space-y-6">
                      {['everyone', 'my-contacts', 'nobody'].map((option) => (
                        <label key={option} className="flex items-center justify-between cursor-pointer group">
                          <span className="text-slate-900 dark:text-white capitalize">{option.replace('-', ' ')}</span>
                          <input 
                            type="radio" 
                            name="profile-photo" 
                            className="w-5 h-5 accent-[#008069]"
                            checked={(user?.privacySettings?.profilePhoto || 'everyone') === option}
                            onChange={() => handleUpdatePrivacy('profilePhoto', option)}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-4">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <Shield className="w-10 h-10 opacity-20" />
                  </div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold">{settingsView.charAt(0).toUpperCase() + settingsView.slice(1)} Settings</h4>
                    <p className="text-sm">These advanced settings are coming in the next update.</p>
                  </div>
                  <Button variant="outline" className="rounded-full" onClick={() => setSettingsView('main')}>Go Back</Button>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

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
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 10, x: isMe ? 20 : -20 }}
                      animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        mass: 0.8
                      }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}
                    >
                      <div className={`max-w-[75%] md:max-w-[70%] px-3.5 py-2 rounded-2xl shadow-[0_1px_2px_rgba(0,0,0,0.1)] relative group select-none transition-all hover:shadow-md ${
                        isMe 
                          ? 'bg-[#dcf8c6] dark:bg-blue-600 text-slate-900 dark:text-white rounded-tr-none border-t border-r border-[#c2e4ac] dark:border-blue-500/30' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-tl-none border-t border-l border-white dark:border-slate-700/50'
                      }`}>
                        {/* Message Tail */}
                        <div className={`absolute top-0 w-2 h-2 ${
                          isMe 
                            ? 'right-[-8px] bg-[#dcf8c6] dark:bg-blue-600 [clip-path:polygon(0_0,0_100%,100%_0)]' 
                            : 'left-[-8px] bg-white dark:bg-slate-800 [clip-path:polygon(0_0,100%_100%,100%_0)]'
                        }`} />

                        <p className="text-[14.5px] leading-relaxed mb-0.5 pr-12 font-medium">{msg.text}</p>
                        
                        <div className="flex items-center justify-end gap-1.5 mt-0.5 h-3">
                          <span className={`text-[9px] font-bold uppercase tracking-tighter ${isMe ? 'text-slate-500 dark:text-blue-100/60' : 'text-slate-400'}`}>
                            {msg.createdAt ? format(msg.createdAt.toDate(), 'HH:mm') : '--:--'}
                          </span>
                          {isMe && (
                            <div className="flex">
                              <CheckCheck className="w-3 h-3 text-blue-500 dark:text-blue-200" />
                            </div>
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
