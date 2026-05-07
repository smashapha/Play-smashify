import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, CreditCard, ShoppingBag, Settings, LogOut, 
  ChevronRight, BadgeCheck, Shield, ExternalLink, Sparkles, Mail, Phone, MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Profile: React.FC = () => {
  const { user, userProfile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/landing');
  };

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const updates = {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      city: formData.get('city') as string,
      bio: formData.get('bio') as string,
      avatar_url: formData.get('avatar_url') as string,
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user?.id);
      
      if (error) throw error;
      alert('Profile updated successfully!');
      if (refreshProfile) refreshProfile();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-4xl font-black font-display italic uppercase mb-4 text-smash-gray">Access Denied</h2>
        <p className="mb-8">Please sign in to view your profile.</p>
        <button onClick={() => navigate('/auth')} className="btn-smash-orange">Sign In</button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      {/* Profile Header */}
      <div className="relative group">
         <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-smash-black z-10" />
         <div className="h-48 rounded-[32px] overflow-hidden">
            <img src="https://images.unsplash.com/photo-1619983081563-430f63602796?w=1200&h=400&fit=crop" className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity" alt="" />
         </div>
         
         <div className="absolute -bottom-16 left-12 z-20 flex items-end gap-8">
            <div className="w-40 h-40 rounded-full border-8 border-smash-black overflow-hidden shadow-2xl relative group">
               <img src={userProfile.avatar_url || "https://i.pravatar.cc/300"} className="w-full h-full object-cover" alt="" />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                  <BadgeCheck className="text-white" size={32} />
               </div>
            </div>
            <div className="pb-4 space-y-2">
               <div className="flex items-center gap-3">
                  <h1 className="text-5xl font-black font-display italic uppercase tracking-tighter drop-shadow-xl">{userProfile.full_name || 'Muzic Listener'}</h1>
                  {userProfile.is_artist && <span className="px-3 py-1 bg-smash-orange text-white text-[10px] font-black rounded-full uppercase">Artist</span>}
               </div>
               <p className="text-smash-gray font-bold tracking-tight flex items-center gap-2"><Mail size={16} /> {user?.email}</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-24">
        {/* Account Details Form */}
        <div className="lg:col-span-2 space-y-12">
           <section className="bento-card p-12 bg-white/5 space-y-12">
              <div className="flex items-center justify-between">
                 <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter">PERSONAL <span className="text-smash-orange">INFO</span></h2>
                 <User size={32} className="text-smash-gray opacity-20" />
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-smash-gray uppercase tracking-widest ml-4">Full Name</label>
                       <input 
                         name="full_name"
                         defaultValue={userProfile.full_name}
                         className="w-full bg-white/5 border border-white/10 rounded-[20px] px-8 py-4 font-bold outline-none focus:border-smash-orange transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-smash-gray uppercase tracking-widest ml-4">Phone Number</label>
                       <input 
                         name="phone"
                         defaultValue={userProfile.phone}
                         placeholder="+265..."
                         className="w-full bg-white/5 border border-white/10 rounded-[20px] px-8 py-4 font-bold outline-none focus:border-smash-orange transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-smash-gray uppercase tracking-widest ml-4">Location (City)</label>
                       <input 
                         name="city"
                         defaultValue={userProfile.city}
                         className="w-full bg-white/5 border border-white/10 rounded-[20px] px-8 py-4 font-bold outline-none focus:border-smash-orange transition-all" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-smash-gray uppercase tracking-widest ml-4">Avatar URL</label>
                       <input 
                         name="avatar_url"
                         defaultValue={userProfile.avatar_url}
                         className="w-full bg-white/5 border border-white/10 rounded-[20px] px-8 py-4 font-bold outline-none focus:border-smash-orange transition-all" 
                       />
                    </div>
                    <div className="col-span-full space-y-2">
                       <label className="text-[10px] font-black text-smash-gray uppercase tracking-widest ml-4">Bio / About You</label>
                       <textarea 
                         name="bio"
                         defaultValue={userProfile.bio}
                         rows={4}
                         className="w-full bg-white/5 border border-white/10 rounded-[20px] px-8 py-4 font-bold outline-none focus:border-smash-orange transition-all resize-none" 
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-smash-gray uppercase tracking-widest ml-4">Account Type</label>
                       <div className="w-full bg-white/5 border border-white/10 rounded-[20px] px-8 py-4 font-black uppercase text-xs tracking-widest flex items-center gap-3">
                          <Shield size={16} className="text-smash-orange" />
                          {userProfile.is_artist ? 'Professional Artist' : 'Standard Listener'}
                       </div>
                    </div>
                 </div>

                 <button 
                   disabled={loading}
                   className="w-full py-6 bg-white text-smash-black rounded-[32px] font-black text-xl uppercase tracking-widest hover:bg-smash-orange hover:text-white transition-all shadow-xl disabled:opacity-50"
                 >
                   {loading ? 'SAVING...' : 'UPDATE PROFILE'}
                 </button>
              </form>
           </section>

           <section className="bento-card p-12 bg-white/5 space-y-12">
              <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter">QUICK <span className="text-smash-orange">ACTIONS</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <button onClick={() => navigate('/library')} className="p-6 bg-white/5 border border-white/10 rounded-[24px] flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                       <ShoppingBag className="text-smash-orange" />
                       <span className="font-black uppercase tracking-widest text-xs">View Purchases</span>
                    </div>
                    <ChevronRight className="text-smash-gray group-hover:translate-x-2 transition-transform" />
                 </button>
                 {userProfile.is_artist && (
                    <button onClick={() => navigate('/artist-hub')} className="p-6 bg-smash-orange/10 border border-smash-orange/20 rounded-[24px] flex items-center justify-between group hover:bg-smash-orange/20 transition-all">
                       <div className="flex items-center gap-4">
                          <Sparkles className="text-smash-orange" />
                          <span className="font-black uppercase tracking-widest text-xs text-smash-orange">Artist Dashboard</span>
                       </div>
                       <ExternalLink className="text-smash-orange" size={18} />
                    </button>
                 )}
                 <button className="p-6 bg-white/5 border border-white/10 rounded-[24px] flex items-center justify-between group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-4">
                       <CreditCard className="text-green-500" />
                       <span className="font-black uppercase tracking-widest text-xs">Billing & Subscription</span>
                    </div>
                    <ChevronRight className="text-smash-gray group-hover:translate-x-2 transition-transform" />
                 </button>
              </div>
           </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <div className="bento-card p-8 bg-gradient-to-br from-smash-orange/20 to-transparent border-smash-orange/20">
              <h3 className="text-xl font-black font-display italic uppercase mb-6 flex items-center gap-2">
                 <CreditCard size={20} className="text-smash-orange" /> Plan: <span className="text-smash-orange">{userProfile.subscription_tier || 'Free'}</span>
              </h3>
              <p className="text-sm text-smash-gray font-medium mb-6 leading-relaxed">
                 Enjoy high fidelity audio, unlimited skips and offline listening by upgrading your plan.
              </p>
              <button onClick={() => navigate('/pricing')} className="w-full py-4 bg-white text-smash-black rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-smash-orange hover:text-white transition-all">
                 UPGRADE PLAN
              </button>
           </div>

           <div className="bento-card p-8 space-y-6">
              <h4 className="text-xs font-black uppercase tracking-[0.3em] text-smash-gray">Security</h4>
              <button className="w-full flex items-center justify-between group">
                 <span className="font-bold text-sm">Change Password</span>
                 <Settings size={18} className="text-smash-gray group-hover:rotate-90 transition-transform" />
              </button>
              <button className="w-full flex items-center justify-between group">
                 <span className="font-bold text-sm">Email Notifications</span>
                 <div className="w-10 h-5 bg-smash-orange rounded-full relative">
                    <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                 </div>
              </button>
           </div>

           <button 
             onClick={handleSignOut}
             className="w-full py-6 border-2 border-smash-red/20 text-smash-red rounded-[24px] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-smash-red hover:text-white transition-all"
           >
             <LogOut size={18} /> SIGN OUT ACCOUNT
           </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
