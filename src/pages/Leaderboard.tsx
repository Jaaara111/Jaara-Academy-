import { useEffect, useState } from 'react';
import { dbService } from '@/services/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Medal, User, Crown } from 'lucide-react';
import { motion } from 'motion/react';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await dbService.getLeaderboard();
      setLeaders(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-2">
          <Trophy className="w-8 h-8 text-yellow-600" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Leaderboard</h1>
        <p className="text-slate-500">Top students achieving excellence across Somalia.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {leaders.slice(0, 3).map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`relative overflow-hidden border-2 h-full ${
              i === 0 ? 'border-yellow-400 bg-yellow-50/30' : 
              i === 1 ? 'border-slate-300 bg-slate-50/30' : 
              'border-orange-300 bg-orange-50/30'
            }`}>
              {i === 0 && <Crown className="absolute top-2 right-2 w-6 h-6 text-yellow-500" />}
              <CardContent className="pt-8 text-center space-y-4">
                <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-bold border-4 ${
                  i === 0 ? 'bg-yellow-400 text-white border-yellow-200' : 
                  i === 1 ? 'bg-slate-400 text-white border-slate-200' : 
                  'bg-orange-400 text-white border-orange-200'
                }`}>
                  {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <User className="w-10 h-10" />}
                </div>
                <div>
                  <h3 className="font-bold text-xl">{user.displayName || 'Anonymous'}</h3>
                  <p className="text-slate-500 text-sm">{user.phoneNumber?.replace(/.(?=.{4})/g, '*') || 'Hidden'}</p>
                </div>
                <div className="bg-white rounded-xl p-3 shadow-sm inline-block">
                  <span className="text-2xl font-black text-slate-800">{user.totalScore || 0}</span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-widest">Points</span>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="font-black text-3xl opacity-10 italic">#{i + 1}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100">
          <CardTitle className="text-lg flex items-center gap-2">
            <Medal className="w-5 h-5 text-blue-600" />
            Top Learners
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {leaders.slice(3).length > 0 ? (
              leaders.slice(3).map((user, i) => (
                <div key={user.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <div className="w-8 text-center font-bold text-slate-400 italic">#{i + 4}</div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{user.displayName || 'Student'}</p>
                    <p className="text-xs text-slate-400">{user.phoneNumber?.replace(/.(?=.{3})/g, '*') || 'Private'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-blue-600">{user.totalScore || 0}</p>
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-tighter">Points</p>
                  </div>
                </div>
              ))
            ) : leaders.length <= 3 && (
              <div className="p-12 text-center text-slate-400">
                Join the competition to appear here!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
