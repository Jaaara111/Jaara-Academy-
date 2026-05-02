import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dbService } from '@/services/db';
import { Exam, Subject } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileText, Download, Filter, GraduationCap, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'motion/react';

export default function Exams() {
  const { id: subjectId } = useParams();
  const [exams, setExams] = useState<Exam[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [level, setLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [allExams, allSubjects] = await Promise.all([
        dbService.getExams(subjectId),
        dbService.getSubjects()
      ]);
      setExams(allExams);
      setSubjects(allSubjects);
      setLoading(false);
    }
    init();
  }, [subjectId]);

  const filteredExams = exams.filter(e => {
    const matchesLevel = level === 'all' || e.level === level;
    const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });
  const currentSubject = subjects.find(s => s.id === subjectId);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {currentSubject ? `${currentSubject.name} Exams` : 'Past Government Exams'}
          </h1>
          <p className="text-slate-500">Practice with national examination papers from previous years.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search exams..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Tabs defaultValue="all" onValueChange={setLevel} className="w-full sm:w-auto">
            <TabsList className="bg-white border border-slate-200">
              <TabsTrigger value="all">All Levels</TabsTrigger>
              <TabsTrigger value="Class 8">Class 8</TabsTrigger>
              <TabsTrigger value="Form 4">Form 4</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredExams.length > 0 ? (
            filteredExams.map((exam, i) => (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow group border-slate-100 overflow-hidden">
                  <div className={`h-2 w-full ${exam.level === 'Form 4' ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="mb-2">
                        {exam.year}
                      </Badge>
                      <Badge variant={exam.level === 'Form 4' ? 'default' : 'outline'} className="text-[10px]">
                        {exam.level}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="w-5 h-5 text-slate-400" />
                      {exam.title}
                    </CardTitle>
                    <CardDescription>
                      {subjects.find(s => s.id === exam.subjectId)?.name || 'General'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 mt-4">
                      <a 
                        href={exam.pdfUrl} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 bg-slate-900 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold hover:bg-slate-800 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </a>
                      <button className="bg-blue-50 text-blue-700 rounded-lg px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold hover:bg-blue-100 transition-colors">
                        Quiz
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : !loading ? (
            <div className="col-span-full py-20 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-600">No exams found</h3>
              <p className="text-slate-400">Try a different filter or subject.</p>
            </div>
          ) : (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Subject Filter Chips for Desktop (Mobile can use general list) */}
      {!subjectId && (
        <section className="pt-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Filter by Subject
          </h2>
          <div className="flex flex-wrap gap-2">
            {subjects.map(s => (
              <button 
                key={s.id}
                onClick={() => window.location.href = `/subject/${s.id}`}
                className="px-4 py-2 rounded-full border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-all text-sm font-medium"
              >
                {s.name}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
