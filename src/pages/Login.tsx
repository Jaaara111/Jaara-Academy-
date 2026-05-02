import { useState, FormEvent } from 'react';
import { authService, AuthUser } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GraduationCap, Phone, Lock, User, ArrowRight, Loader2, UserPlus, LogIn, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (loginMethod === 'phone' && !phoneNumber) return toast.error('Fadlan geli lambarka');
    if (loginMethod === 'email' && !email) return toast.error('Fadlan geli email-ka');
    if (!password) return toast.error('Fadlan geli sirta');
    
    setLoading(true);
    try {
      if (loginMethod === 'phone') {
        await authService.login(phoneNumber, password);
      } else {
        await authService.loginByEmail(email, password);
      }
      
      toast.success('Si guul leh ayaad u gashay!');
      navigate('/chat');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Lamberka ama sirta ayaa khaldan');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    if (!fullName || !phoneNumber || !password) return toast.error('Fadlan buuxi dhamaan meelaha banaan');
    if (password.length < 6) return toast.error('Sirta waa inay ka badnaataa 6 xaraf');
    
    setLoading(true);
    try {
      await authService.signup(fullName, phoneNumber, password);
      toast.success('Akoonkaaga si guul leh ayaa loo abuuray!');
      
      // Clear inputs
      setFullName('');
      setPhoneNumber('');
      setPassword('');
      
      navigate('/chat');
      window.location.reload(); // Force reload to update auth state globally
    } catch (error: any) {
      console.error("Signup Error:", error);
      toast.error(error.message || 'Wuu fashilmay abuurista akoonku');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md border-slate-200 shadow-2xl overflow-hidden rounded-3xl">
        <div className="bg-blue-600 p-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
          
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl relative z-10">
            <img src="/logo.png" alt="Jaara Academy" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold relative z-10">Jaara Academy</h1>
          <p className="opacity-80 text-sm italic relative z-10">Learn Smart, Succeed Easily</p>
        </div>

        <CardHeader className="pt-8 text-center px-8">
          <CardTitle className="text-2xl font-bold text-slate-800">
            {view === 'login' ? 'Soo Dhawaaw' : 'Abuur Akoon'}
          </CardTitle>
          <CardDescription className="text-slate-500">
            {view === 'login' 
              ? 'Geli lambarkaaga iyo sirtaada si aad u gasho' 
              : 'Fadlan buuxi xogtaada si aad ugu biirto Jaara Academy'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-10 px-8">
          <div className="space-y-6">
            {view === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
                  <button 
                    type="button" 
                    onClick={() => setLoginMethod('phone')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${loginMethod === 'phone' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  >
                    Phone Number
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setLoginMethod('email')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${loginMethod === 'email' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'}`}
                  >
                    Email Address
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">
                    {loginMethod === 'phone' ? 'Phone Number' : 'Email Address'}
                  </label>
                  <div className="relative">
                    {loginMethod === 'phone' ? (
                      <>
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input 
                          type="tel"
                          placeholder="61xxxxxxx"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          className="pl-12 h-14 rounded-2xl border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 text-slate-700 font-medium transition-all"
                          required
                        />
                      </>
                    ) : (
                      <>
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input 
                          type="email"
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-12 h-14 rounded-2xl border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 text-slate-700 font-medium transition-all"
                          required
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-14 rounded-2xl border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 text-slate-700 font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Login <LogIn className="w-5 h-5" /></>}
                </Button>
                
                <div className="pt-2 text-center text-sm">
                  <span className="text-slate-500">Miyaadan lahayn akoon? </span>
                  <button 
                    type="button"
                    onClick={() => setView('signup')}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Abuur hadda
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Magacaaga oo buuxa</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="text"
                      placeholder="Magacaaga..."
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-12 h-14 rounded-2xl border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 text-slate-700 font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="tel"
                      placeholder="61xxxxxxx"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="pl-12 h-14 rounded-2xl border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 text-slate-700 font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Password (6+ xaraf)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 h-14 rounded-2xl border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50/50 text-slate-700 font-medium transition-all"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign Up <UserPlus className="w-5 h-5" /></>}
                </Button>

                <div className="pt-2 text-center text-sm">
                  <span className="text-slate-500">Ma leedahay akoon? </span>
                  <button 
                    type="button"
                    onClick={() => setView('login')}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Login
                  </button>
                </div>
              </form>
            )}

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest px-4 text-slate-300 bg-white">
                Jaara Academy AI
              </div>
            </div>

            <p className="text-center text-[10px] text-slate-400 leading-relaxed px-4">
              By continuing, you agree to Jaara Academy's Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
