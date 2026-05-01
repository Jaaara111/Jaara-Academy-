import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { Book as BookType, Subject } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { BookOpen, Download, Search, Library } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { Input } from '@/components/ui/input';

export default function Books() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [allBooks, allSubjects] = await Promise.all([
        dbService.getBooks(),
        dbService.getSubjects()
      ]);
      setBooks(allBooks);
      setSubjects(allSubjects);
      setLoading(false);
    }
    init();
  }, []);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subjects.find(s => s.id === b.subjectId)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Curriculum Books</h1>
          <p className="text-slate-500">Official MoE curriculum books for all grades and subjects.</p>
        </div>
        <div className="w-full md:w-80 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search books..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book, i) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full hover:shadow-md transition-all border-slate-100 flex flex-col group">
                <CardHeader className="flex-1">
                  <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                    <BookOpen className="w-6 h-6 text-orange-600" />
                  </div>
                  <Badge variant="outline" className="w-fit mb-2">{book.grade}</Badge>
                  <CardTitle className="text-lg leading-tight mb-2">
                    {book.title}
                  </CardTitle>
                  <CardDescription>
                    {subjects.find(s => s.id === book.subjectId)?.name || 'Subject'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <a 
                    href={book.pdfUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-full bg-slate-900 text-white rounded-lg px-4 py-2 flex items-center justify-center gap-2 text-sm font-bold hover:bg-slate-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Read / Download
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : !loading ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <Library className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <h3 className="text-slate-500 font-medium">No books found in our library yet.</h3>
          </div>
        ) : (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))
        )}
      </div>
    </div>
  );
}
