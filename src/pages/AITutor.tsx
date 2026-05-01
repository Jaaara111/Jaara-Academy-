import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Bot, User, Loader2, Sparkles, Languages, 
  MessageSquare, Plus, Trash2, ChevronLeft, Menu, 
  Clock, MoreVertical, X, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';
import { aiService } from '@/services/aiService';
import { dbService } from '@/services/db';
import { auth } from '@/lib/firebase';
import { AIConversation, AIMessage } from '@/types';
import Markdown from 'react-markdown';
import { toast } from 'sonner';

export default function AITutor() {
  const [user, setUser] = useState(auth.currentUser);
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<Partial<AIMessage>[]>([
    { role: 'model', content: "Soo dhawoow maxaa kaa caawiyaa", timestamp: { seconds: Date.now()/1000 } }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auth listener
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  // Load conversations
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Handle mobile responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  const loadConversations = async () => {
    if (!user) return;
    const data = await dbService.getConversations(user.uid);
    setConversations(data.sort((a: any, b: any) => (b.lastActive?.seconds || 0) - (a.lastActive?.seconds || 0)));
  };

  const selectConversation = async (conv: AIConversation) => {
    setActiveConversation(conv);
    setIsLoading(true);
    try {
      const msgs = await dbService.getAIMessages(conv.id);
      if (msgs.length === 0) {
        setMessages([{ role: 'model', content: "Soo dhawoow maxaa kaa caawiyaa", timestamp: { seconds: Date.now()/1000 } }]);
      } else {
        setMessages(msgs);
      }
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) {
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveConversation(null);
    setMessages([{ role: 'model', content: "Soo dhawoow maxaa kaa caawiyaa", timestamp: { seconds: Date.now()/1000 } }]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const deleteChat = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this conversation?")) return;
    await dbService.deleteConversation(id);
    if (activeConversation?.id === id) startNewChat();
    loadConversations();
    toast.success("Chat deleted");
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const userMessage = input.trim();
    if (!userMessage || isLoading) return;

    // Clear input immediately for better UX
    setInput('');
    setIsLoading(true);

    try {
      let currentConv = activeConversation;

      // 1. Create conversation in DB ONLY IF user is logged in
      if (user && !currentConv) {
        const title = userMessage.slice(0, 30) + (userMessage.length > 30 ? '...' : '');
        try {
          const newConvSnap = await dbService.createConversation(user.uid, title);
          if (newConvSnap) {
            currentConv = { 
              id: newConvSnap.id, 
              userId: user.uid, 
              title, 
              createdAt: { seconds: Date.now()/1000 }, 
              lastActive: { seconds: Date.now()/1000 } 
            };
            setActiveConversation(currentConv);
            loadConversations();
          }
        } catch (dbError) {
          console.error("Failed to create conversation:", dbError);
        }
      }

      // Add user message to UI
      const userMsg: Partial<AIMessage> = { 
        conversationId: currentConv?.id || 'guest', 
        role: 'user', 
        content: userMessage, 
        timestamp: { seconds: Date.now()/1000 } 
      };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);

      // Save to DB ONLY IF user is logged in
      if (user && currentConv) {
        await dbService.addAIMessage(currentConv.id, 'user', userMessage);
      }

      // 2. Prepare context for AI
      const history = updatedMessages
        .filter(m => m.content !== "Soo dhawoow maxaa kaa caawiyaa")
        .map(m => ({
          role: m.role as 'user' | 'model',
          parts: [{ text: m.content as string }]
        }));

      // 3. Get AI Response
      const aiResponse = await aiService.getTutorResponse(userMessage, history);
      
      if (aiResponse) {
        const aiMsg: Partial<AIMessage> = { 
          role: 'model', 
          content: aiResponse, 
          timestamp: { seconds: Date.now()/1000 } 
        };
        // 4. Update UI
        setMessages(prev => [...prev, aiMsg]);
        
        // Save AI response to DB ONLY IF user is logged in
        if (user && currentConv) {
          await dbService.addAIMessage(currentConv.id, 'model', aiResponse);
        }

        // Show prompt to login for guests after 3 messages
        if (!user && updatedMessages.length >= 7) { // 1 welcome + 3 user + 3 AI = 7
           toast("Create an account to save your chats", {
             description: "Chat history is not saved in guest mode.",
             action: {
               label: "Login",
               onClick: () => window.location.href = '/login'
             }
           });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Khalad ayaa dhacay markii lala xiriirayay AI-ga");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] -m-4 md:-m-6 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* SIDEBAR */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className={`fixed md:relative z-40 w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shadow-2xl md:shadow-none`}
          >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                History
              </span>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="md:hidden">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="p-4">
              <Button 
                onClick={startNewChat}
                disabled={!user}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                <Plus className="w-4 h-4" /> New Conversation
              </Button>
              {!user && (
                <p className="text-[10px] text-center text-slate-400 mt-2 font-medium">Login to save history</p>
              )}
            </div>

            <ScrollArea className="flex-1 px-3">
              <div className="space-y-1 pb-4">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                      activeConversation?.id === conv.id 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare className="w-4 h-4 shrink-0" />
                      <span className="text-sm font-medium truncate">{conv.title}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => deleteChat(e, conv.id)}
                      className="opacity-0 group-hover:opacity-100 h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
                
                {user && conversations.length === 0 && (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium">No previous chats</p>
                  </div>
                )}

                {!user && (
                  <div className="py-12 text-center px-4">
                     <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 text-slate-300" />
                    </div>
                    <p className="text-xs text-slate-500 font-bold mb-2 uppercase tracking-tighter">Guest Mode</p>
                    <p className="text-[10px] text-slate-400">History only works when logged in.</p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      onClick={() => window.location.href = '/login'}
                      className="text-blue-600 font-bold p-0 mt-2 h-auto"
                    >
                      Login Now
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              {user ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'S'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">{user?.displayName || user?.email || 'Student'}</p>
                    <p className="text-[10px] text-slate-500 truncate">{user?.phoneNumber || user?.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold">
                    G
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">Use as Guest</p>
                    <p className="text-[10px] text-slate-500 truncate">No history saved</p>
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN CHAT */}
      <main className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="md:mr-2">
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100 dark:shadow-none">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 dark:text-white leading-none">Jaara Academy AI</h2>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">Active Tutor</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="hidden sm:flex px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-100 dark:border-emerald-800 items-center gap-1">
               <Languages className="w-3 h-3" /> Somali • English
             </div>
             <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
               <MoreVertical className="w-5 h-5" />
             </Button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-hidden relative">
          <ScrollArea className="h-full px-4 md:px-8 py-6" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-8">
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-4 max-w-[85%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1 shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-slate-200 text-slate-600' 
                          : 'bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none'
                      }`}>
                        {msg.role === 'user' ? <User className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
                      </div>
                      <div className={`space-y-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`p-4 rounded-2xl ${
                          msg.role === 'user' 
                            ? 'bg-slate-800 dark:bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm'
                        }`}>
                          <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed">
                            <Markdown>{msg.content || ''}</Markdown>
                          </div>
                        </div>
                        <p className={`text-[10px] text-slate-400 font-medium px-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                          {msg.timestamp?.seconds ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-4 items-center bg-white dark:bg-slate-800 px-5 py-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI is thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input */}
        <div className="p-4 md:p-8 bg-gradient-to-t from-slate-50 dark:from-slate-950 via-slate-50/80 dark:via-slate-950/80 to-transparent">
          <form 
            onSubmit={handleSend}
            className="max-w-3xl mx-auto relative group"
          >
            <div className="relative flex items-center">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Waydii su'aal"
                className="w-full h-16 pl-6 pr-16 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all text-slate-800 dark:text-white placeholder:text-slate-400"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200 dark:shadow-none p-0 flex items-center justify-center transition-all active:scale-95"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
            
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar justify-center">
              {[
                { label: "Math Help", icon: <HelpCircle className="w-3 h-3" /> },
                { label: "Somali Rules", icon: <Languages className="w-3 h-3" /> },
                { label: "Practice Quiz", icon: <Bot className="w-3 h-3" /> }
              ].map((hint, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInput(hint.label)}
                  className="whitespace-nowrap px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-xs font-bold text-slate-500 hover:border-blue-500 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm"
                >
                  {hint.icon}
                  {hint.label}
                </button>
              ))}
            </div>
          </form>
          <p className="text-center text-[10px] text-slate-400 mt-4 font-medium italic">
            Jaara Academy AI can make mistakes. Check important information.
          </p>
        </div>
      </main>
    </div>
  );
}
