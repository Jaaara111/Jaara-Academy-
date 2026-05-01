import { useState, useEffect, FormEvent } from 'react';
import { auth } from '@/lib/firebase';
import { dbService } from '@/services/db';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GraduationCap, Phone, ShieldCheck, ArrowRight, Loader2, RefreshCcw, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function Login() {
  const navigate = useNavigate();
  const [countryCode, setCountryCode] = useState('+252');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');

  useEffect(() => {
    // Initialize Recaptcha
    if (!(window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          'size': 'invisible',
          'callback': () => {
            console.log("Recaptcha resolved");
          },
          'expired-callback': () => {
            toast.error("Recaptcha expired. Please refresh.");
          }
        });
      } catch (e) {
        console.error("Recaptcha init failed", e);
      }
    }
  }, []);

  const handleSendOTP = async (e: FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return toast.error('Please enter a phone number');
    
    setLoading(true);
    const appVerifier = (window as any).recaptchaVerifier;
    
    try {
      // Clean phone number (remove leading zeros if any)
      const cleanNumber = phoneNumber.replace(/^0+/, '');
      const fullNumber = `${countryCode}${cleanNumber}`;
      
      console.log("Attempting to send OTP to:", fullNumber);
      
      const result = await signInWithPhoneNumber(auth, fullNumber, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
      toast.success('OTP sent successfully!');
    } catch (error: any) {
      console.error("Firebase Auth Error:", error);
      
      if (error.code === 'auth/invalid-phone-number') {
        toast.error('The phone number is invalid.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later.');
      } else if (error.code === 'auth/unauthorized-domain') {
        toast.error('This domain is not authorized in Firebase Console.');
      } else {
        toast.error(error.message || 'Failed to send OTP. Check your connection.');
      }

      // Reset recaptcha on failure
      if ((window as any).recaptchaVerifier) {
        try {
          const widgetId = await (window as any).recaptchaVerifier.render();
          (window as any).grecaptcha.reset(widgetId);
        } catch (reErr) {
          console.error("Recaptcha reset failed", reErr);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');
    if (!confirmationResult) return;

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      if (result.user) {
        // Update Firebase profile
        const { updateProfile } = await import('firebase/auth');
        await updateProfile(result.user, { displayName: fullName });
        
        // Sync with local users collection for chat discovery
        await dbService.syncUser(result.user.uid, result.user.phoneNumber, fullName);
      }
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('phone');
    setConfirmationResult(null);
    setOtp('');
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div id="recaptcha-container"></div>
      
      <Card className="w-full max-w-md border-slate-200 shadow-xl overflow-hidden rounded-3xl">
        <div className="bg-blue-600 p-8 text-white text-center">
          <div className="w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden border-4 border-white/20 shadow-xl">
            <img src="/logo.png" alt="Jaara Academy" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold">Jaara Academy</h1>
          <p className="opacity-80 text-sm italic">Learn Smart, Succeed Easily</p>
        </div>

        <CardHeader className="pt-8 text-center px-8">
          <CardTitle className="text-2xl">
            {step === 'phone' ? 'Welcome Back' : 'Verification'}
          </CardTitle>
          <CardDescription>
            {step === 'phone' 
              ? 'Enter your phone number to continue' 
              : `Enter the 6-digit code sent to ${phoneNumber}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-12 px-8">
          <div className="space-y-6">
            {step === 'phone' ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="text"
                      placeholder="Your name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-slate-200 focus:ring-blue-500 bg-slate-50"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                  <div className="flex gap-2">
                    <div className="w-24 shrink-0">
                      <select 
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="+252">🇸🇴 +252</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+254">🇰🇪 +254</option>
                        <option value="+251">🇪🇹 +251</option>
                        <option value="+253">🇩🇯 +253</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+966">🇸🇦 +966</option>
                      </select>
                    </div>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <Input 
                        type="tel"
                        placeholder="61xxxxxxx"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                        className="pl-11 h-14 rounded-2xl border-slate-200 focus:ring-blue-500 bg-slate-50"
                        required
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">Include your area code without the leading zero.</p>
                </div>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send OTP <ArrowRight className="w-5 h-5" /></>}
                </Button>
                
                <div className="pt-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                  >
                    Continue as Guest
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Enter OTP</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                      type="text"
                      placeholder="· · · · · ·"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-11 h-14 rounded-2xl border-slate-200 focus:ring-blue-500 bg-slate-50 text-center text-2xl tracking-[0.5em] font-bold"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={resetFlow}
                    className="h-14 rounded-2xl px-6 border-slate-200 bg-white"
                  >
                    <RefreshCcw className="w-5 h-5" />
                  </Button>
                  <Button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-100 transition-all"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Login'}
                  </Button>
                </div>
                <p className="text-center text-sm text-slate-500">
                  Didn't get the code? <button type="button" onClick={handleSendOTP} className="text-blue-600 font-bold hover:underline">Resend</button>
                </p>
              </form>
            )}

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-xs uppercase px-2 text-slate-400 bg-white">
                Secure Authentication
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 leading-relaxed">
              Your security is our priority. Jaara Academy uses industry standard encryption to protect your account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
