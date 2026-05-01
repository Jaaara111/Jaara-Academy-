import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { GraduationCap, HelpCircle, BookOpen, ChevronRight, Calculator, Microscope, Beaker, Zap, Book, History, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dbService } from '@/services/db';
import { Subject } from '@/types';
import { motion } from 'motion/react';

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

  useEffect(() => {
    dbService.getSubjects().then(setSubjects);
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
            Education Made <br/>Truly Accessible
          </h1>
          <p className="text-blue-100 text-lg mb-8 opacity-90 max-w-lg">
            Empowering students with thousands of past exams, interactive quests, and digital textbooks in one professional hub.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/exams">
              <button className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                Practice Exams
              </button>
            </Link>
            <Link to="/ai-tutor">
              <button className="bg-blue-600 border border-white/30 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all flex items-center gap-2">
                <Bot className="w-5 h-5" /> AI Tutor (Free)
              </button>
            </Link>
          </div>
        </motion.div>
        
        {/* Subtle background decoration */}
        <div className="absolute right-[-10%] bottom-[-20%] w-[50%] aspect-square bg-blue-600 rounded-full opacity-20 blur-3xl" />
        <div className="absolute left-[80%] top-[-10%] w-[30%] aspect-square bg-sky-400 rounded-full opacity-20 blur-2xl" />
      </section>

      {/* Quick Access */}
      <section>
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
          <h2 className="text-2xl font-bold">Explore by Subject</h2>
          <Button variant="link" className="text-blue-600 font-semibold">View All</Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                  <Card className="text-center hover:bg-blue-50 hover:border-blue-200 cursor-pointer transition-all border-slate-100 group">
                    <CardContent className="pt-8 pb-6">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
                        <IconComp className="w-6 h-6 text-slate-600 group-hover:text-blue-600" />
                      </div>
                      <h3 className="font-bold text-slate-800">{subject.name}</h3>
                    </CardContent>
                  </Card>
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

// Minimal button fallback if needed
function Button({ children, variant, className, ...props }: any) {
  const variants: any = {
    link: 'text-blue-600 hover:underline px-0',
    primary: 'bg-blue-600 text-white hover:bg-blue-700 font-bold px-8 py-3 rounded-xl'
  };
  return <button className={`${variants[variant] || 'bg-blue-600 text-white px-4 py-2 rounded-lg'} ${className}`} {...props}>{children}</button>;
}
