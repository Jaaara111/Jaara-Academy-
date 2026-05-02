import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GraduationCap, HelpCircle, BookOpen, ChevronRight, Calculator, Microscope, Beaker, Zap, Book, History, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dbService } from '@/services/db';
import { authService, AuthUser } from '@/services/authService';
import { Subject } from '@/types';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, any> = {
  Calculator,
  Microscope,
  Beaker,
  Zap,
  Book,
  History
};

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    dbService.getSubjects().then(setSubjects);
    setUser(authService.getSession());
  }, []);

  const quickLinks = [
    { title: 'National Exams', desc: 'Form 4 & Class 8 past papers', icon: GraduationCap, color: 'bg-blue-600', to: '/exams' },
    { title: 'Interactive Quizzes', desc: 'Test your knowledge', icon: HelpCircle, color: 'bg-emerald-600', to: '/questions' },
    { title: 'Digital Library', desc: 'Curriculum books for all grades', icon: BookOpen, color: 'bg-orange-600', to: '/books' },
  ];

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-blue-700 text-white p-8 md:p-12 shadow-xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-2xl"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
              <img src="/logo.png" alt="Jaara Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="inline-block px-3 py-1 bg-blue-500/30 backdrop-blur-md text-[10px] font-bold uppercase tracking-[0.2em] rounded-md border border-white/20">
                Jaara Academy
              </div>
              <p className="text-white/60 text-xs mt-1 font-medium italic">Learn Smart, Succeed Easily</p>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight tracking-tight">
            {user ? (
              <>Halo, <span className="text-sky-300">{user.displayName || 'Student'}!</span> <br/>Ready to Learn?</>
            ) : (
              <>Education Made <br/>Truly Accessible</>
            )}
          </h1>
          <p className="text-blue-100 text-lg mb-8 opacity-90 max-w-lg">
            {user 
              ? `You have collected ${user.points || 0} influence points. Check the leaderboard to see your rank among peers across Sofia.` 
              : 'Empowering students with thousands of past exams, interactive quests, and digital textbooks in one professional hub.'
            }
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to={user ? "/leaderboard" : "/exams"}>
              <button className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                {user ? "View Leaderboard" : "Practice Exams"}
              </button>
            </Link>
            <Link to="/ai-tutor">
              <button className="bg-blue-600 border border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all flex items-center gap-2">
                <Bot className="w-5 h-5" /> AI Tutor (Free)
              </button>
            </Link>
          </div>
        </motion.div>
        
        {/* Floating Stats for Logged In Users */}
        {user && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
            {[
              { label: 'Weekly Goal', val: '85%', sub: 'Target: 90%', icon: Zap, color: 'bg-yellow-400' },
              { label: 'Daily Streak', val: '12 Days', sub: 'New Record!', icon: Zap, color: 'bg-orange-500' },
              { label: 'Global Rank', val: '#42', sub: 'Top 5%', icon: GraduationCap, color: 'bg-emerald-500' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl flex items-center gap-4"
              >
                <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                  <p className="text-lg font-black text-white leading-none">{stat.val}</p>
                  <p className="text-[10px] text-white/40 mt-1">{stat.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {/* Subtle background decoration */}
        <div className="absolute right-[-10%] bottom-[-20%] w-[50%] aspect-square bg-blue-600 rounded-full opacity-20 blur-3xl" />
        <div className="absolute left-[80%] top-[-10%] w-[30%] aspect-square bg-sky-400 rounded-full opacity-20 blur-2xl" />
      </section>

      {/* Daily Challenge Section */}
      <section>
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/30 transition-all duration-700" />
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-black uppercase tracking-widest">
                <Zap className="w-4 h-4 fill-current" />
                Daily Challenge
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">
                Master 10 Questions <br/>in <span className="text-blue-400">10 Minutes.</span>
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                Boost your influence points by completing our daily quiz curated from the most challenging exam categories.
              </p>
              <div className="flex gap-4">
                <Link to="/questions">
                  <Button className="h-14 px-10 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg transition-all shadow-xl shadow-blue-500/20 active:scale-95 border-none">
                    Start Challenge
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                         <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="" />
                      </div>
                    ))}
                  </div>
                    <span className="text-xs font-bold text-slate-400">+1.2k playing</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { label: 'Exams', val: '2,500+', icon: GraduationCap, sub: 'Updated Weekly' },
                   { label: 'Materials', val: '1,200+', icon: BookOpen, sub: 'Digital Books' },
                   { label: 'Success', val: '98%', icon: HelpCircle, sub: 'Score Rate' },
                   { label: 'Support', val: '24/7', icon: Bot, sub: 'AI Tutoring' },
                 ].map((box, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ y: -5 }}
                      className="bg-white/5 border border-white/10 p-6 rounded-3xl"
                    >
                      <box.icon className="w-6 h-6 text-blue-400 mb-4" />
                      <p className="text-2xl font-black text-white leading-none">{box.val}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">{box.label}</p>
                      <p className="text-[10px] text-slate-600 mt-1">{box.sub}</p>
                    </motion.div>
                 ))}
              </div>
            </div>
          </div>
      </section>

      {/* Quick Access Mobile Grid */}
      <section className="md:hidden">
        <div className="grid grid-cols-2 gap-4">
          {quickLinks.map((link, i) => (
            <Link key={i} to={link.to} className="block">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className={`${link.color} p-6 rounded-[2rem] text-white shadow-lg shadow-blue-500/10 flex flex-col items-center justify-center text-center gap-3`}
              >
                <div className="bg-white/20 p-3 rounded-2xl">
                  <link.icon className="w-8 h-8" />
                </div>
                <div>
                   <p className="font-bold text-sm tracking-tight">{link.title.split(' ')[0]}</p>
                   <p className="text-[10px] opacity-70 font-medium">Browse Files</p>
                </div>
              </motion.div>
            </Link>
          ))}
          <Link to="/ai-tutor" className="block">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-lg flex flex-col items-center justify-center text-center gap-3"
            >
              <div className="bg-blue-500 p-3 rounded-2xl">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                 <p className="font-bold text-sm tracking-tight">AI Tutor</p>
                 <p className="text-[10px] opacity-70 font-medium">Ask Anything</p>
              </div>
            </motion.div>
          </Link>
        </div>
      </section>

      {/* Quick Access for Desktop (Hidden on Mobile) */}
      <section className="hidden md:block">
        <h2 className="text-2xl font-bold mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link, i) => (
            <Link key={i} to={link.to}>
              <motion.div
                whileHover={{ y: -5 }}
                className="group h-full"
              >
                <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden border border-slate-100">
                  <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                    <div className={`${link.color} p-3 rounded-2xl text-white shadow-sm transition-transform group-hover:scale-110`}>
                      <link.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{link.title}</CardTitle>
                      <CardDescription>{link.desc}</CardDescription>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                  </CardHeader>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Subjects Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Explore Subjects</h2>
          <Button variant="link" className="text-blue-600 font-semibold p-0 h-auto">View All</Button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
          {subjects.map((subject, i) => {
            const IconComp = iconMap[subject.icon] || Book;
            return (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link to={`/subject/${subject.id}`}>
                  <div className="flex flex-col items-center gap-2 group">
                    <div className="w-full aspect-square rounded-[1.5rem] bg-white dark:bg-slate-800 border-2 border-transparent group-hover:border-blue-500/50 shadow-sm flex items-center justify-center transition-all group-active:scale-95">
                      <IconComp className="w-8 h-8 text-slate-700 dark:text-blue-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <h3 className="font-bold text-[11px] text-slate-800 dark:text-white uppercase tracking-wider text-center">{subject.name}</h3>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white flex flex-col md:flex-row items-center gap-8 overflow-hidden relative">
        <div className="flex-1 space-y-4">
          <div className="inline-block px-3 py-1 bg-blue-600 text-[10px] font-bold uppercase tracking-wider rounded-md">New Feature</div>
          <h2 className="text-3xl font-bold">Track Your Progress</h2>
          <p className="text-slate-400 max-w-sm">
            Sign up now to save your favorite exams, track quiz scores, and pick up where you left off.
          </p>
          <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-8">Join the Hub</Button>
        </div>
        <div className="flex-1 flex justify-center relative">
          <div className="w-full max-w-xs aspect-video bg-blue-500/20 rounded-2xl border border-blue-500/30 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full space-y-3">
              <div className="h-3 w-1/2 bg-blue-400/40 rounded-full" />
              <div className="h-2 w-full bg-white/10 rounded-full" />
              <div className="h-2 w-3/4 bg-white/10 rounded-full" />
              <div className="flex justify-between items-center pt-4">
                <div className="w-8 h-8 rounded-full bg-emerald-500" />
                <div className="h-2 w-20 bg-emerald-500/30 rounded-full" />
              </div>
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute inset-0 bg-blue-600 mix-blend-overlay opacity-20 blur-2xl" />
        </div>
      </section>
    </div>
  );
}
