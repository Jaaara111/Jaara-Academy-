import { useEffect, useState } from 'react';
import { authService, AuthUser } from '@/services/authService';
import { dbService } from '@/services/db';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, LogOut, Shield, Award, Calendar, Book, GraduationCap, ArrowRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = authService.getSession();
    if (!session) {
      navigate('/login');
      return;
    }
    setUser(session);
    
    // Fetch user specific data if needed, or just use general stats for now
    async function loadStats() {
      // In a real app we'd fetch specific user stats like "exams completed"
      setStats({
        points: session.points || 0,
        joinedDate: session.createdAt ? session.createdAt.toDate() : new Date(),
        role: session.role || 'student'
      });
      setLoading(false);
    }
    loadStats();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  if (loading || !user) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="relative h-48 rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute -bottom-16 left-8">
            <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-xl flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                {user.photoURL ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" /> : <User className="w-16 h-16" />}
            </div>
        </div>
      </div>

      <div className="pt-20 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{user.displayName || 'Student Name'}</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            {user.phoneNumber} • {stats.role.toUpperCase()}
          </p>
        </div>
        <div className="flex gap-3">
          {user.role === 'admin' && (
            <Link to="/admin">
              <Button variant="outline" className="rounded-xl border-blue-200 text-blue-700 hover:bg-blue-50">
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
          )}
          <Button variant="destructive" onClick={handleLogout} className="rounded-xl">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          {user.role !== 'admin' && (
            <Button 
              variant="secondary" 
              className="rounded-xl bg-slate-100 text-slate-600"
              onClick={async () => {
                await dbService.updateUserRole(user.uid, 'admin');
                toast.success('You are now an Admin! Refreshing...');
                const updatedUser = { ...user, role: 'admin' as const };
                localStorage.setItem('auth_session', JSON.stringify(updatedUser));
                setTimeout(() => window.location.reload(), 1500);
              }}
            >
              Become Admin
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-600/60 uppercase tracking-widest">Total Influence</p>
                <p className="text-2xl font-black text-blue-900">{stats.points} pts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-emerald-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-widest">Learning Since</p>
                <p className="text-2xl font-black text-emerald-900">{format(stats.joinedDate, 'MMM yyyy')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-purple-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-600/60 uppercase tracking-widest">Account Status</p>
                <p className="text-2xl font-black text-purple-900">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Book className="w-6 h-6 text-blue-600" />
            Quick Actions
          </h2>
          <div className="grid gap-3">
            {[
              { label: 'Browse Latest Exams', to: '/exams', icon: GraduationCap, color: 'bg-blue-600' },
              { label: 'Continue Reading', to: '/books', icon: Book, color: 'bg-orange-600' },
              { label: 'Try Daily Quiz', to: '/questions', icon: Award, color: 'bg-emerald-600' },
            ].map((action, i) => (
              <Link key={i} to={action.to}>
                <motion.div 
                  whileHover={{ x: 5 }}
                  className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-white`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-slate-700">{action.label}</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </motion.div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-600" />
            Preferences
          </h2>
          <Card className="border-slate-100 shadow-sm rounded-3xl overflow-hidden">
            <div className="divide-y divide-slate-100">
               <div className="p-6 flex items-center justify-between">
                 <div>
                    <p className="font-bold">Notifications</p>
                    <p className="text-sm text-slate-400">Manage daily reminders</p>
                 </div>
                 <div className="w-12 h-6 bg-slate-200 rounded-full relative cursor-not-allowed">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full" />
                 </div>
               </div>
               <div className="p-6 flex items-center justify-between">
                 <div>
                    <p className="font-bold">Public Profile</p>
                    <p className="text-sm text-slate-400">Show name on leaderboard</p>
                 </div>
                 <div className="w-12 h-6 bg-blue-600 rounded-full relative cursor-pointer">
                    <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                 </div>
               </div>
               <div className="p-6 flex items-center justify-between">
                 <div>
                    <p className="font-bold">App Version</p>
                    <p className="text-sm text-slate-400">Jaara AI Mobile v1.0.4</p>
                 </div>
                 <span className="text-xs font-black text-slate-300">PWA</span>
               </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
