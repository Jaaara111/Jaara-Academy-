import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { Question, Subject } from '@/types';
import { authService } from '@/services/authService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HelpCircle, CheckCircle2, XCircle, ChevronRight, Info, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';

export default function Questions() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [allQuestions, allSubjects] = await Promise.all([
        dbService.getQuestions(),
        dbService.getSubjects()
      ]);
      // Shuffle and take 10 for "Daily Challenge" vibe
      const shuffled = [...allQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
      setQuestions(shuffled);
      setSubjects(allSubjects);
      setLoading(false);
    }
    init();
  }, []);

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    const currentQ = questions[currentIdx];
    const isCorrect = idx === parseInt(currentQ.correctAnswer);
    
    setSelectedAnswer(idx);
    setIsAnswered(true);
    
    if (isCorrect) {
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
      const user = authService.getSession();
      if (user) {
        dbService.updateUserScore(user.uid, 10); 
      }
    }
  };

  const nextQuestion = () => {
    if (currentIdx === questions.length - 1) {
      setCompleted(true);
      // Give bonus points for finishing
      const user = authService.getSession();
      if (user) {
        dbService.updateUserScore(user.uid, 50);
      }
      return;
    }
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentIdx(i => i + 1);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!questions.length) return <div className="text-center py-20">No questions available. Check back soon!</div>;

  if (completed) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto text-center space-y-8 py-12"
      >
        <div className="w-24 h-24 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center text-white shadow-2xl shadow-blue-200">
          <Award className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-slate-900">Challenge Complete!</h1>
          <p className="text-slate-500">You've earned some massive influence points today.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-sm bg-blue-50/50 p-6">
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Score</p>
            <p className="text-3xl font-black text-blue-900">{score + 50}</p>
            <p className="text-[10px] text-blue-400 mt-1">+50 Bonus Included</p>
          </Card>
          <Card className="border-none shadow-sm bg-emerald-50/50 p-6">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Accuracy</p>
            <p className="text-3xl font-black text-emerald-900">{Math.round((correctCount / questions.length) * 100)}%</p>
            <p className="text-[10px] text-emerald-400 mt-1">{correctCount} of {questions.length} Correct</p>
          </Card>
        </div>

        <div className="flex gap-4 pt-4">
           <Button onClick={() => window.location.reload()} className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg">
             Try Again
           </Button>
           <Button variant="outline" onClick={() => window.location.href = '/leaderboard'} className="flex-1 h-14 rounded-2xl border-slate-200 font-black text-lg">
             View Rank
           </Button>
        </div>
      </motion.div>
    );
  }

  const currentQ = questions[currentIdx];
  const subjectName = subjects.find(s => s.id === currentQ.subjectId)?.name || 'General';

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Quick Quiz</h1>
          <p className="text-slate-500">Test your knowledge with bite-sized questions.</p>
        </div>
        <div className="text-right">
          <Badge variant="outline" className="text-lg py-1 px-4">
            Score: {score}
          </Badge>
          <p className="text-xs text-slate-400 mt-1">Question {currentIdx + 1} of {questions.length}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm mb-2">
                <HelpCircle className="w-4 h-4" />
                {subjectName}
              </div>
              <CardTitle className="text-xl leading-relaxed">
                {currentQ.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {(currentQ.options || []).map((option, i) => {
                  const isCorrect = i === parseInt(currentQ.correctAnswer);
                  const isSelected = i === selectedAnswer;
                  
                  let buttonClass = "flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ";
                  if (!isAnswered) {
                    buttonClass += "border-slate-100 hover:border-blue-200 hover:bg-blue-50";
                  } else if (isCorrect) {
                    buttonClass += "border-emerald-500 bg-emerald-50 text-emerald-900";
                  } else if (isSelected && !isCorrect) {
                    buttonClass += "border-red-500 bg-red-50 text-red-900";
                  } else {
                    buttonClass += "border-slate-100 opacity-50";
                  }

                  return (
                    <button
                      key={i}
                      disabled={isAnswered}
                      onClick={() => handleAnswer(i)}
                      className={buttonClass}
                    >
                      <span className="font-medium">{option}</span>
                      {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                    </button>
                  );
                })}
              </div>

              {isAnswered && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 mb-1">Explanation</p>
                      <p className="text-slate-600 text-sm leading-relaxed">
                        {currentQ.explanation}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={nextQuestion}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl group"
                  >
                    Next Question
                    <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
