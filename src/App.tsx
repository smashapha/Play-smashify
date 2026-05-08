import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/common/MainLayout';
import Home from './pages/Home';
import ArtistHub from './pages/ArtistHub';
import MotoFeed from './pages/MotoFeed';
import Auth from './pages/Auth';
import Landing from './pages/Landing';
import { useAuth } from './context/AuthContext';
import { supabase } from './lib/supabase';

import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

import Pricing from './pages/Pricing';

// Placeholder components for the new routes
import ArtistProfile from './pages/ArtistProfile';
import ArtistLanding from './pages/ArtistLanding';
import Discover from './pages/Discover';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Trending from './pages/Trending';

import { Mail, Phone, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('contact_messages').insert([formData]);
      if (error) throw error;
      toast.success('Message sent! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', message: '' });
    } catch (error: any) {
      toast.error('Failed to send message: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-6xl font-black font-studio italic uppercase tracking-tighter mb-4">Contact <span className="text-smash-purple">US</span></h1>
      <p className="text-smash-gray text-xl mb-12">Have questions? We're here to help you amplify your music.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
            <div className="w-12 h-12 bg-smash-purple/20 rounded-2xl flex items-center justify-center text-smash-purple">
              <Mail size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-smash-gray mb-1">Email Us</p>
              <p className="font-bold text-lg">support@smashify.mw</p>
            </div>
          </div>

          <div className="flex items-center gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
            <div className="w-12 h-12 bg-smash-cyan/20 rounded-2xl flex items-center justify-center text-smash-cyan">
              <Phone size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest text-smash-gray mb-1">WhatsApp</p>
              <a href="https://wa.me/265990000000" target="_blank" rel="noopener noreferrer" className="font-bold text-lg hover:text-smash-cyan transition-colors">+265 99 000 0000</a>
            </div>
          </div>

          <div className="p-8 bg-smash-purple/10 rounded-3xl border border-smash-purple/20">
            <h3 className="text-lg font-black uppercase italic mb-2">Artist Support</h3>
            <p className="text-sm text-smash-gray leading-relaxed">Dedicated line for Malawian artists. We help you with distribution, payouts, and promotion.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-smash-gray ml-2">Name</label>
            <input 
              required
              type="text" 
              placeholder="Your Name" 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold focus:outline-none focus:border-smash-purple transition-all"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-smash-gray ml-2">Email</label>
            <input 
              required
              type="email" 
              placeholder="Email Address" 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold focus:outline-none focus:border-smash-purple transition-all"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-smash-gray ml-2">Message</label>
            <textarea 
              required
              rows={4}
              placeholder="How can we help?" 
              className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-bold focus:outline-none focus:border-smash-purple transition-all resize-none"
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-smash-purple text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={18} /> Send Message</>}
          </button>
        </form>
      </div>
    </div>
  );
};

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-smash-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-smash-orange border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={<Auth />} />
      <Route path="/artists" element={<ArtistLanding />} />
      <Route path="/moto-feed" element={<MotoFeed />} />
      <Route path="/artist-hub" element={user ? <ArtistHub /> : <Navigate to="/auth?mode=artist" />} />
      <Route element={<MainLayout />}>
        <Route index element={user ? <Home /> : <Landing />} />
        <Route path="home" element={user ? <Home /> : <Navigate to="/" />} />
        <Route path="discover" element={<Discover />} />
        <Route path="trending" element={<Trending />} />
        <Route path="library" element={<Library />} />
        <Route path="profile" element={<Profile />} />
        <Route path="artist/:id" element={<ArtistProfile />} />
        <Route path="search" element={<Discover />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="about" element={<About />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="contact" element={<Contact />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <Toaster position="bottom-center" toastOptions={{
        style: {
          background: '#1A1A1A',
          color: '#FFF',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '16px',
        }
      }} />
      <AuthProvider>
        <PlayerProvider>
          <AppContent />
        </PlayerProvider>
      </AuthProvider>
    </Router>
  );
}
