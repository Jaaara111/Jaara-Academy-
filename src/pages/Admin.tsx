import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { dbService } from '@/services/db';
import { Subject, Exam, Book, Question } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ShieldAlert, Plus, Save, Trash2, FileUp, GraduationCap, BookOpen, HelpCircle, LayoutDashboard, Loader2, List } from 'lucide-react';
import { motion } from 'motion/react';

export default function Admin() {
  const [user, loading] = useAuthState(auth);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState({ exams: 0, books: 0, questions: 0 });
  const [isUploading, setIsUploading] = useState(false);
  
  // Data lists
  const [exams, setExams] = useState<Exam[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);

  // Forms state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [examForm, setExamForm] = useState({ title: '', subjectId: '', year: 2024, level: 'Form 4' as any });
  const [bookForm, setBookForm] = useState({ title: '', subjectId: '', grade: '' });
  const [questionForm, setQuestionForm] = useState({ text: '', subjectId: '', correctAnswer: '', options: ['', '', '', ''] });

  const fetchData = async () => {
    const [s, st, e, b, q] = await Promise.all([
      dbService.getSubjects(),
      dbService.getStats(),
      dbService.getExams(),
      dbService.getBooks(),
      dbService.getQuestions()
    ]);
    setSubjects(s);
    setStats(st);
    setExams(e);
    setBooks(b);
    setQuestions(q);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const isAdmin = user?.email === 'hassanjaarapinho@gmail.com' || user?.email === 'admin@jaaraacademy.com';

  if (loading) return (
    <div className="flex items-center justify-center h-[50vh]">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (!user || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-slate-200">
        <ShieldAlert className="w-16 h-16 text-amber-500 mb-4" />
        <h1 className="text-2xl font-bold">Admin Path Only</h1>
        <p className="text-slate-500 max-w-sm mx-auto mt-2">
          This dashboard is reserved for Jaara Academy administrators.
        </p>
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return toast.error('Please select a PDF file');
    
    setIsUploading(true);
    try {
      const pdfUrl = await dbService.uploadFile(selectedFile);
      await dbService.addExam({ ...examForm, pdfUrl });
      toast.success('Exam uploaded to Jaara Academy Hub');
      setExamForm({ title: '', subjectId: '', year: 2024, level: 'Form 4' });
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return toast.error('Please select a PDF file');
    
    setIsUploading(true);
    try {
      const pdfUrl = await dbService.uploadFile(selectedFile);
      await dbService.addBook({ ...bookForm, pdfUrl });
      toast.success('Book added to library');
      setBookForm({ title: '', subjectId: '', grade: '' });
      setSelectedFile(null);
      fetchData();
    } catch (err) {
      toast.error('Failed to add book');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dbService.addQuestion({
        text: questionForm.text,
        subjectId: questionForm.subjectId,
        correctAnswer: questionForm.correctAnswer,
        explanation: 'Check curriculum books for details',
        // Support for both simple and structured questions
        ...(questionForm.options ? { options: questionForm.options } : {})
      } as any);
      toast.success('Question added to database');
      setQuestionForm({ text: '', subjectId: '', correctAnswer: '', options: ['', '', '', ''] });
      fetchData();
    } catch (err) {
      toast.error('Failed to add question');
    }
  };

  const handleDelete = async (type: 'exam' | 'book' | 'question', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (type === 'exam') await dbService.deleteExam(id);
      else if (type === 'book') await dbService.deleteBook(id);
      else await dbService.deleteQuestion(id);
      toast.success('Item deleted');
      fetchData();
    } catch (e) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jaara Admin Terminal</h1>
        <p className="text-slate-500">Learn Smart, Succeed Easily • Global Content Manager</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Exams', val: stats.exams, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Books Available', val: stats.books, icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Interactive Qs', val: stats.questions, icon: HelpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group">
            <div className={`h-1 w-full ${stat.color.replace('text', 'bg')}`} />
            <CardContent className="pt-6 flex items-center gap-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.val}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="exams" className="w-full">
        <TabsList className="bg-white p-1 border border-slate-200 rounded-2xl w-full md:w-fit mb-8">
          <TabsTrigger value="exams" className="rounded-xl px-8">Exams</TabsTrigger>
          <TabsTrigger value="books" className="rounded-xl px-8">Books</TabsTrigger>
          <TabsTrigger value="questions" className="rounded-xl px-8">Questions</TabsTrigger>
          <TabsTrigger value="list" className="rounded-xl px-8">View Records</TabsTrigger>
        </TabsList>

        <TabsContent value="exams" className="space-y-6 outline-none">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 p-6">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Enroll New National Exam
              </CardTitle>
            </div>
            <CardContent className="p-8">
              <form onSubmit={handleAddExam} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Exam Title</label>
                  <Input 
                    placeholder="e.g., Mathematics Paper 2 Final 2023" 
                    value={examForm.title}
                    onChange={e => setExamForm({...examForm, title: e.target.value})}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Educational Subject</label>
                  <Select onValueChange={v => setExamForm({...examForm, subjectId: v as string})} required>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Categorize subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Academic Year</label>
                  <Input 
                    type="number"
                    value={examForm.year}
                    onChange={e => setExamForm({...examForm, year: parseInt(e.target.value)})}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Examination Level</label>
                  <Select onValueChange={v => setExamForm({...examForm, level: v as any})} defaultValue="Form 4">
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Class 8">Primary (Class 8)</SelectItem>
                      <SelectItem value="Form 4">Secondary (Form 4)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">PDF Document Upload</label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FileUp className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-700">{selectedFile ? selectedFile.name : "Click to select or drag PDF file"}</p>
                    <p className="text-xs text-slate-400 mt-1 italic">Maximum file size 10MB</p>
                  </div>
                </div>
                <div className="md:col-span-2 pt-4">
                  <Button type="submit" disabled={isUploading} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 transition-all">
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Publish to Hub</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="books" className="space-y-6 outline-none">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-orange-50/50 border-b border-orange-100 p-6">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-orange-600" />
                Add New Library Resource
              </CardTitle>
            </div>
            <CardContent className="p-8">
              <form onSubmit={handleAddBook} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Digital Book Title</label>
                  <Input 
                    placeholder="e.g., Biology Student Textbook" 
                    value={bookForm.title}
                    onChange={e => setBookForm({...bookForm, title: e.target.value})}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Subject Area</label>
                  <Select onValueChange={v => setBookForm({...bookForm, subjectId: v as string})} required>
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Target Grade / Class</label>
                  <Input 
                    placeholder="e.g., Form 3 / Grade 11"
                    value={bookForm.grade}
                    onChange={e => setBookForm({...bookForm, grade: e.target.value})}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-slate-700">Upload PDF Copy</label>
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:bg-slate-50 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FileUp className="w-10 h-10 text-slate-300 mb-2" />
                    <p className="text-sm font-medium text-slate-700">{selectedFile ? selectedFile.name : "Select book PDF"}</p>
                  </div>
                </div>
                <div className="md:col-span-2 pt-4">
                  <Button type="submit" disabled={isUploading} className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-100">
                    {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-2" /> Add to Library</>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6 outline-none">
          <Card className="border-slate-200 shadow-sm">
            <div className="bg-emerald-50/50 border-b border-emerald-100 p-6">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                Enroll Quiz Question
              </CardTitle>
            </div>
            <CardContent className="p-8">
              <form onSubmit={handleAddQuestion} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-700">Question Text</label>
                    <Input 
                      placeholder="e.g., What is the capital of Somalia?" 
                      value={questionForm.text}
                      onChange={e => setQuestionForm({...questionForm, text: e.target.value})}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Subject</label>
                    <Select onValueChange={v => setQuestionForm({...questionForm, subjectId: v as string})} required>
                      <SelectTrigger className="h-12 rounded-xl">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">Correct Answer</label>
                    <Input 
                      placeholder="Answer index or text" 
                      value={questionForm.correctAnswer}
                      onChange={e => setQuestionForm({...questionForm, correctAnswer: e.target.value})}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl">
                  Save Question
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-12 outline-none pt-4">
          <section>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              Exams Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exams.map(e => (
                <Card key={e.id} className="p-4 border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:rotate-6 transition-transform">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none mb-1">{e.title}</p>
                      <p className="text-xs text-slate-500 font-medium">{e.year} • {e.level}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete('exam', e.id)}
                    className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
              <BookOpen className="w-6 h-6 text-orange-600" />
              Books Management
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map(b => (
                <Card key={b.id} className="p-4 border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 group-hover:rotate-6 transition-transform">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none mb-1 dark:text-white">{b.title}</p>
                      <p className="text-xs text-slate-500 font-medium">{b.grade}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete('book', b.id)}
                    className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-xl font-bold flex items-center gap-2 mb-6 dark:text-white">
              <HelpCircle className="w-6 h-6 text-emerald-600" />
              Interactive Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {questions.map(q => (
                <Card key={q.id} className="p-4 border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:rotate-6 transition-transform">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 leading-none mb-1 dark:text-white truncate max-w-[200px]">{q.text}</p>
                      <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">Ans: {q.correctAnswer}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete('question', q.id)}
                    className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
