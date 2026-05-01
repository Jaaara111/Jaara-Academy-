import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { Question, Subject } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { HelpCircle, CheckCircle2, XCircle, ChevronRight, Info } from 'lucide-react';
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

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [allQuestions, allSubjects] = await Promise.all([
        dbService.getQuestions(),
        dbService.getSubjects()
      ]);
      setQuestions(allQuestions);
      setSubjects(allSubjects);
      setLoading(false);
    }
    init();
  }, []);

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);
    if (idx === parseInt(questions[currentIdx].correctAnswer)) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setCurrentIdx(i => (i + 1) % questions.length);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;
  if (!questions.length) return <div className="text-center py-20">No questions available.</div>;

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
