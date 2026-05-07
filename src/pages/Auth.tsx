import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, Mail, Lock, User, Check, ArrowRight, ShieldCheck, 
  Sparkles, Headphones, Mic2, AlertCircle, Phone, MapPin, 
  Music, CreditCard, ChevronLeft, Disc
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Logo from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

type AuthMode = 'login' | 'signup_listener' | 'signup_artist';
type ArtistStep = 1 | 2 | 3;

const Auth: React.FC = () => {
  const { user } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [stageName, setStageName] = useState('');
  const [genre, setGenre] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [artistStep, setArtistStep] = useState<ArtistStep>(1);
  const [idPhoto, setIdPhoto] = useState<File | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/home');
      } else if (mode === 'signup_listener') {
        const { data, error } = await supabase.auth.signUp({ 
           email, 
           password,
           options: { data: { full_name: fullName, is_artist: false } }
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName,
            is_artist: false,
            subscription_tier: 'Free'
          });
          navigate('/home');
        }
      } else if (mode === 'signup_artist' && artistStep === 3) {
        const { data, error } = await supabase.auth.signUp({ 
           email, 
           password,
           options: { data: { full_name: fullName, stage_name: stageName, is_artist: true } }
        });
        if (error) throw error;
        if (data.user) {
           // Using direct insert for demo, in production use RPC for security
           const { error: profileError } = await supabase.from('profiles').insert({
              id: data.user.id,
              full_name: fullName,
              stage_name: stageName,
              is_artist: true,
              genre,
              phone,
              city,
              subscription_tier: 'Basic Artist'
           });
           if (profileError) throw profileError;
           navigate('/artist-hub');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const nextArtistStep = () => setArtistStep(prev => (prev + 1) as ArtistStep);
  const prevArtistStep = () => setArtistStep(prev => (prev - 1) as ArtistStep);

  return (
    <div className="min-h-screen bg-smash-black flex flex-col md:flex-row relative overflow-hidden">
      {/* Background Decorative */}
      <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-smash-orange/5 rounded-full blur-[140px] -ml-64 -mt-64" />
      <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-smash-purple/5 rounded-full blur-[140px] -mr-64 -mb-64" />

      {/* Left Sidebar / Brand Area */}
      <div className="w-full md:w-[40%] bg-smash-dark/50 p-12 md:p-20 flex flex-col justify-between border-r border-white/5 relative z-10">
         <div>
            <Logo size="lg" className="mb-20" />
            <AnimatePresence mode="wait">
               {mode === 'login' && (
                  <motion.div key="l" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                     <h2 className="text-6xl md:text-8xl font-black font-display italic uppercase tracking-tighter leading-none mb-10">WELCOME<br/><span className="text-smash-orange">BACK</span></h2>
                     <p className="text-smash-gray text-xl md:text-2xl font-medium tracking-tight">Your music queue and favorite artists are waiting for you internally.</p>
                  </motion.div>
               )}
               {mode === 'signup_listener' && (
                  <motion.div key="sl" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                     <h2 className="text-6xl md:text-8xl font-black font-display italic uppercase tracking-tighter leading-none mb-10">HEAR THE<br/><span className="text-smash-cyan">FUTURE</span></h2>
                     <p className="text-smash-gray text-xl md:text-2xl font-medium tracking-tight">Join 50k+ Malawians discovering the next local superstars every day.</p>
                  </motion.div>
               )}
               {mode === 'signup_artist' && (
                  <motion.div key="sa" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                     <h2 className="text-6xl md:text-8xl font-black font-display italic uppercase tracking-tighter leading-none mb-10">BUILD AN<br/><span className="text-smash-green">EMPIRE</span></h2>
                     <p className="text-smash-gray text-xl md:text-2xl font-medium tracking-tight">The most artist-friendly platform in Africa. Payouts to mobile money. Instant analytics.</p>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>

         <div className="space-y-6">
            <div className={`p-6 rounded-3xl border transition-all cursor-pointer ${mode === 'signup_listener' ? 'bg-white/10 border-smash-cyan' : 'bg-white/5 border-white/5 hover:bg-white/10'}`} onClick={() => { setMode('signup_listener'); setArtistStep(1); }}>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-smash-cyan/20 flex items-center justify-center text-smash-cyan"><Headphones /></div>
                  <div>
                     <p className="font-display font-black italic uppercase tracking-tight">Listening Account</p>
                     <p className="text-[10px] font-black text-smash-gray uppercase tracking-widest">Free Forever • Unlimited Streaming</p>
                  </div>
               </div>
            </div>
            <div className={`p-6 rounded-3xl border transition-all cursor-pointer ${mode === 'signup_artist' ? 'bg-white/10 border-smash-green' : 'bg-white/5 border-white/5 hover:bg-white/10'}`} onClick={() => { setMode('signup_artist'); setArtistStep(1); }}>
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-smash-green/20 flex items-center justify-center text-smash-green"><Mic2 /></div>
                  <div>
                     <p className="font-display font-black italic uppercase tracking-tight">Artist Studio</p>
                     <p className="text-[10px] font-black text-smash-gray uppercase tracking-widest">Withdraw to Airtel/TNM • Fan Insights</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* Right Content / Form Area */}
      <div className="flex-1 flex flex-col justify-center px-6 py-20 md:px-24 md:py-32 relative z-10">
         <div className="max-w-xl w-full mx-auto">
            <AnimatePresence mode="wait">
               {mode === 'login' ? (
                  <motion.form key="login" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8" onSubmit={handleAuth}>
                     <div className="space-y-6">
                        <AuthInput icon={<Mail size={20} />} type="email" placeholder="Email Address" value={email} onChange={setEmail} />
                        <AuthInput icon={<Lock size={20} />} type="password" placeholder="Password" value={password} onChange={setPassword} />
                     </div>
                     <button type="submit" disabled={loading} className="w-full py-6 bg-white text-smash-black rounded-[32px] font-black text-2xl uppercase tracking-widest shadow-2xl hover:bg-smash-orange hover:text-white transition-all transform hover:scale-[1.02] active:scale-95">
                        {loading ? 'Entering...' : 'Sign In'}
                     </button>
                     <button type="button" onClick={() => setMode('signup_listener')} className="w-full text-center text-sm font-black text-smash-gray uppercase tracking-widest hover:text-white transition-colors">Need an account? Sign up</button>
                  </motion.form>
               ) : mode === 'signup_listener' ? (
                  <motion.form key="listener" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8" onSubmit={handleAuth}>
                     <div className="space-y-6">
                        <AuthInput icon={<User size={20} />} type="text" placeholder="Full Name" value={fullName} onChange={setFullName} />
                        <AuthInput icon={<Mail size={20} />} type="email" placeholder="Email Address" value={email} onChange={setEmail} />
                        <AuthInput icon={<Lock size={20} />} type="password" placeholder="Create Password" value={password} onChange={setPassword} />
                     </div>
                     <button type="submit" disabled={loading} className="w-full py-6 bg-white text-smash-black rounded-[32px] font-black text-2xl uppercase tracking-widest shadow-2xl hover:bg-smash-cyan hover:text-white transition-all transform hover:scale-[1.02] active:scale-95">
                        {loading ? 'Creating...' : 'Join the Vibe'}
                     </button>
                     <button type="button" onClick={() => setMode('login')} className="w-full text-center text-sm font-black text-smash-gray uppercase tracking-widest hover:text-white transition-colors">Already have an account? Log In</button>
                  </motion.form>
               ) : (
                  <motion.div key="artist" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
                     {/* Stepper */}
                     <div className="flex items-center gap-4">
                        {[1, 2, 3].map(s => (
                           <div key={s} className={`h-2 flex-1 rounded-full overflow-hidden bg-white/5`}>
                              <motion.div initial={{ width: 0 }} animate={{ width: artistStep >= s ? '100%' : '0%' }} className="h-full bg-smash-green" />
                           </div>
                        ))}
                     </div>

                     <AnimatePresence mode="wait">
                        {artistStep === 1 && (
                           <motion.div key="as1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                              <div className="space-y-6">
                                 <AuthInput icon={<User size={20} />} type="text" placeholder="Legal Full Name" value={fullName} onChange={setFullName} />
                                 <AuthInput icon={<Music size={20} />} type="text" placeholder="Stage Name" value={stageName} onChange={setStageName} />
                                 <AuthInput icon={<Mail size={20} />} type="email" placeholder="Email Address" value={email} onChange={setEmail} />
                              </div>
                              <button onClick={nextArtistStep} className="w-full py-6 bg-white text-smash-black rounded-[32px] font-black text-2xl uppercase tracking-widest shadow-2xl hover:bg-smash-green hover:text-white transition-all">Next Step <ArrowRight size={24} className="inline ml-2" /></button>
                           </motion.div>
                        )}
                        {artistStep === 2 && (
                           <motion.div key="as2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                              <div className="space-y-6">
                                 <AuthInput icon={<Disc size={20} />} type="text" placeholder="Primary Genre (e.g. Afropop)" value={genre} onChange={setGenre} />
                                 <AuthInput icon={<Phone size={20} />} type="text" placeholder="Phone Number (Airtel/TNM)" value={phone} onChange={setPhone} />
                                 <AuthInput icon={<MapPin size={20} />} type="text" placeholder="City (Lilongwe, Blantyre, etc.)" value={city} onChange={setCity} />
                                 <div className="relative group p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4 hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-3">
                                       <User size={20} className="text-smash-gray group-hover:text-white transition-colors" />
                                       <p className="text-[10px] font-black text-white uppercase tracking-widest">Upload ID Photo (Anti-Fraud)</p>
                                    </div>
                                    <p className="text-xs text-smash-gray font-bold tracking-tight">Please provide a clear photo of your National ID or Passport for verification purposes.</p>
                                    <input 
                                       type="file" 
                                       accept="image/*"
                                       onChange={(e) => setIdPhoto(e.target.files?.[0] || null)}
                                       className="w-full text-sm font-bold text-smash-gray file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-white/10 file:text-white hover:file:bg-white/20 transition-all cursor-pointer" 
                                    />
                                 </div>
                              </div>
                              <div className="flex gap-4">
                                 <button onClick={prevArtistStep} className="p-6 bg-white/5 text-white rounded-[32px] hover:bg-white/10 transition-all"><ChevronLeft size={32} /></button>
                                 <button onClick={nextArtistStep} className="flex-1 py-6 bg-white text-smash-black rounded-[32px] font-black text-2xl uppercase tracking-widest shadow-2xl hover:bg-smash-green hover:text-white transition-all">Almost There</button>
                              </div>
                           </motion.div>
                        )}
                        {artistStep === 3 && (
                           <motion.div key="as3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                              <div className="space-y-6">
                                 <AuthInput icon={<Lock size={20} />} type="password" placeholder="Create Secure Password" value={password} onChange={setPassword} />
                                 <div className="p-6 rounded-[32px] bg-white/5 border border-white/5 space-y-4">
                                    <div className="flex items-center gap-3">
                                       <ShieldCheck className="text-smash-green" size={20} />
                                       <p className="text-[10px] font-black text-white uppercase tracking-widest">Artist Safety Program</p>
                                    </div>
                                    <p className="text-xs text-smash-gray font-bold tracking-tight">By creating a studio, you agree to our Artist Terms. We review all profiles for verification eligibility.</p>
                                 </div>
                              </div>
                              <div className="flex gap-4">
                                 <button onClick={prevArtistStep} className="p-6 bg-white/5 text-white rounded-[32px] hover:bg-white/10 transition-all"><ChevronLeft size={32} /></button>
                                 <button onClick={handleAuth} disabled={loading} className="flex-1 py-6 bg-smash-green text-white rounded-[32px] font-black text-2xl uppercase tracking-widest shadow-2xl shadow-smash-green/20 hover:scale-[1.02] transition-all">
                                    {loading ? 'Creating Studio...' : 'Launch Studio'}
                                 </button>
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>
                  </motion.div>
               )}
            </AnimatePresence>

            {error && (
               <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-smash-red/10 border border-smash-red/20 rounded-2xl flex items-center gap-3 text-smash-red font-bold text-sm">
                  <AlertCircle size={18} /> {error}
               </motion.div>
            )}
         </div>
      </div>
   </div>
  );
};

const AuthInput = ({ icon, ...props }: any) => (
   <div className="relative group">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-smash-gray group-focus-within:text-white transition-colors">
         {icon}
      </div>
      <input 
         {...props} 
         className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-[28px] text-lg font-bold placeholder:text-smash-gray/30 focus:outline-none focus:border-white transition-all"
      />
   </div>
);

export default Auth;
