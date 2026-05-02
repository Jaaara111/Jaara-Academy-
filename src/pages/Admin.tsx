import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { dbService } from '@/services/db';
import { authService } from '@/services/authService';
import { Subject, Exam, Book, Question } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ShieldAlert, Plus, Save, Trash2, FileUp, GraduationCap, BookOpen, HelpCircle, LayoutDashboard, Loader2, List, User } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export default function Admin() {
  const [user, loading] = useAuthState(auth);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [stats, setStats] = useState({ exams: 0, books: 0, questions: 0, users: 0 });
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingSubject, setIsSavingSubject] = useState(false);
  
  // Data lists
  const [exams, setExams] = useState<Exam[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('exams');

  // Forms state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', icon: 'Book' });
  const [examForm, setExamForm] = useState({ title: '', subjectId: '', year: 2024, level: 'Form 4' as any });
  const [bookForm, setBookForm] = useState({ title: '', subjectId: '', grade: '' });
  const [questionForm, setQuestionForm] = useState({ text: '', subjectId: '', correctAnswer: '', options: ['', '', '', ''] });

  const fetchData = async () => {
    const [s, st, e, b, q, u] = await Promise.all([
      dbService.getSubjects(),
      dbService.getStats(),
      dbService.getExams(),
      dbService.getBooks(),
      dbService.getQuestions(),
      dbService.getAllUsers()
    ]);
    setSubjects(s);
    setStats(st);
    setExams(e);
    setBooks(b);
    setQuestions(q);
    setAllUsers(u);
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const session = authService.getSession();
  const isAdmin = session?.role === 'admin' || 
                  user?.email === 'hassanjaarapinho@gmail.com' || 
                  user?.email === 'xassanjaara@gmail.com';

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

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectForm.name) return toast.error('Name is required');
    setIsSavingSubject(true);
    try {
      await dbService.addSubject(subjectForm.name, subjectForm.icon);
      toast.success('Subject created successfully');
      setSubjectForm({ name: '', icon: 'Book' });
      fetchData();
    } catch (err) {
      toast.error('Failed to create subject');
    } finally {
      setIsSavingSubject(false);
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

  const handleDelete = async (type: 'exam' | 'book' | 'question' | 'subject', id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      if (type === 'exam') await dbService.deleteExam(id);
      else if (type === 'book') await dbService.deleteBook(id);
      else if (type === 'subject') await dbService.deleteSubject(id);
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        {[
          { label: 'Users', val: stats.users, icon: User, color: 'text-purple-600', bg: 'bg-purple-50', tab: 'users' },
          { label: 'Exams', val: stats.exams, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', tab: 'exams' },
          { label: 'Books', val: stats.books, icon: BookOpen, color: 'text-orange-600', bg: 'bg-orange-50', tab: 'books' },
          { label: 'Questions', val: stats.questions, icon: HelpCircle, color: 'text-emerald-600', bg: 'bg-emerald-50', tab: 'questions' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group relative">
            <div className={`h-1 w-full ${stat.color.replace('text', 'bg')}`} />
            <CardContent className="pt-6 flex items-center gap-4">
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl transition-transform group-hover:scale-110`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.val}</p>
              </div>
              {stat.label !== 'Users' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setActiveTab(stat.tab)}
                  className={`rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${stat.bg} ${stat.color}`}
                >
                  <Plus className="w-5 h-5" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-1 border border-slate-200 rounded-2xl w-full md:w-fit mb-8 overflow-x-auto">
          <TabsTrigger value="exams" className="rounded-xl px-4 md:px-8 shrink-0">Exams</TabsTrigger>
          <TabsTrigger value="books" className="rounded-xl px-4 md:px-8 shrink-0">Books</TabsTrigger>
          <TabsTrigger value="questions" className="rounded-xl px-4 md:px-8 shrink-0">Questions</TabsTrigger>
          <TabsTrigger value="subjects" className="rounded-xl px-4 md:px-8 shrink-0">Subjects</TabsTrigger>
          <TabsTrigger value="users" className="rounded-xl px-4 md:px-8 shrink-0">Users</TabsTrigger>
          <TabsTrigger value="records" className="rounded-xl px-4 md:px-8 shrink-0">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="subjects" className="space-y-6 outline-none">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-blue-50/50 border-b border-blue-100 p-6">
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-blue-600" />
                Define New Subject
              </CardTitle>
            </div>
            <CardContent className="p-8">
              <form onSubmit={handleAddSubject} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Subject Name</label>
                  <Input 
                    placeholder="e.g., Physics, Geography, ICT" 
                    value={subjectForm.name}
                    onChange={e => setSubjectForm({...subjectForm, name: e.target.value})}
                    required
                    className="h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Icon Type</label>
                  <Select onValueChange={v => setSubjectForm({...subjectForm, icon: v})} defaultValue="Book">
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Choose icon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Calculator">Calculator (Math)</SelectItem>
                      <SelectItem value="Microscope">Microscope (Bio)</SelectItem>
                      <SelectItem value="Beaker">Beaker (Chem)</SelectItem>
                      <SelectItem value="Zap">Zap (Physics)</SelectItem>
                      <SelectItem value="Book">Book (Language)</SelectItem>
                      <SelectItem value="History">History (History)</SelectItem>
                      <SelectItem value="Globe">Globe (Geo)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Button type="submit" disabled={isSavingSubject} className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl">
                    {isSavingSubject ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Subject Category'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

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
                    <label className="text-sm font-semibold text-slate-700">Correct Answer Index (0-3)</label>
                    <Input 
                      type="number"
                      min="0"
                      max="3"
                      placeholder="0 for Option A, 1 for Option B..." 
                      value={questionForm.correctAnswer}
                      onChange={e => setQuestionForm({...questionForm, correctAnswer: e.target.value})}
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['A', 'B', 'C', 'D'].map((label, idx) => (
                    <div key={idx} className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Option {label}</label>
                      <Input 
                        placeholder={`Choice ${label}`}
                        value={questionForm.options[idx]}
                        onChange={e => {
                          const newOpts = [...questionForm.options];
                          newOpts[idx] = e.target.value;
                          setQuestionForm({...questionForm, options: newOpts});
                        }}
                        required
                        className="h-11 rounded-xl"
                      />
                    </div>
                  ))}
                </div>

                <Button type="submit" className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl">
                  Save Question
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6 outline-none">
          <Card className="border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-purple-50/50 border-b border-purple-100 p-6">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                User Directory
              </CardTitle>
            </div>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Joined</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {allUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4">
                          <p className="font-bold text-slate-900">{u.displayName}</p>
                          <p className="text-[10px] text-slate-400 font-mono uppercase">{u.id.substring(0, 8)}</p>
                        </td>
                        <td className="p-4 text-sm text-slate-600">{u.phoneNumber || 'N/A'}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {u.role || 'student'}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-500">
                          {u.createdAt ? format(u.createdAt.toDate(), 'dd MMM yyyy') : 'N/A'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-purple-600"
                              onClick={async () => {
                                const newRole = u.role === 'admin' ? 'student' : 'admin';
                                await dbService.updateUserRole(u.id, newRole);
                                toast.success(`User role updated to ${newRole}`);
                                fetchData();
                              }}
                            >
                              <ShieldAlert className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-red-600"
                              onClick={async () => {
                                if (confirm('Delete user?')) {
                                  await dbService.deleteUser(u.id);
                                  toast.success('User deleted');
                                  fetchData();
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-12 outline-none pt-4">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <List className="w-6 h-6 text-slate-600" />
                Subjects Management
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('subjects')}
                className="rounded-xl bg-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Subject
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subjects.map(s => (
                <Card key={s.id} className="p-4 border-slate-100 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <p className="font-bold text-slate-900">{s.name}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete('subject', s.id)}
                    className="text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-600" />
                Exams Management
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('exams')}
                className="rounded-xl bg-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Exam
              </Button>
            </div>
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-orange-600" />
                Books Management
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('books')}
                className="rounded-xl bg-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Book
              </Button>
            </div>
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-emerald-600" />
                Interactive Questions
              </h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setActiveTab('questions')}
                className="rounded-xl bg-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Question
              </Button>
            </div>
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
