import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import { 
  Play, Pause, Heart, Share2, ShoppingBag, Music2, 
  ArrowUp, ArrowDown, UserPlus, Disc, Flame, Volume2, VolumeX
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Song } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { buyTrack } from '../lib/paychangu';

import { useNavigate } from 'react-router-dom';

const MotoCard = ({ song, active }: { song: Song; active: boolean }) => {
  const navigate = useNavigate();
  const { playSong, isPlaying, togglePlay, currentTime, duration, seek, volume, setVolume } = usePlayer();
  const { userProfile } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);

  useEffect(() => {
    if (active) {
      playSong(song);
    }
  }, [active]);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userProfile) {
       alert('Sign in to buy tracks');
       return;
    }
    buyTrack({
       song,
       user: userProfile,
       onSuccess: () => alert('Purchased!')
    });
  };

  const isPreviewLimit = !song.is_purchased && currentTime >= 30;

  return (
    <div className="relative h-full w-full bg-smash-black overflow-hidden">
      {/* Background Layer */}
      <div className="absolute inset-0">
        <img 
          src={song.cover_url} 
          className="w-full h-full object-cover blur-3xl opacity-40 scale-150" 
          alt="" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
      </div>

      {/* Main Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-6 pb-40">
         <motion.div 
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="relative aspect-square w-full max-w-[340px] md:max-w-[400px] shadow-[0_0_80px_rgba(255,95,0,0.3)] group"
           onClick={togglePlay}
         >
            <img 
              src={song.cover_url} 
              className={`w-full h-full object-cover rounded-[40px] md:rounded-[60px] border-4 border-white/10 ${isPlaying ? 'animate-pulse' : ''}`} 
              alt={song.title} 
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm rounded-[40px] md:rounded-[60px]">
               <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-xl border border-white/30">
                  {isPlaying ? <Pause size={40} /> : <Play size={40} className="ml-2" />}
               </div>
            </div>

            {isPreviewLimit && (
               <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-8 rounded-[40px] md:rounded-[60px]">
                  <ShoppingBag size={48} className="text-smash-orange mb-4" />
                  <h3 className="text-2xl font-black font-display italic uppercase mb-2">Full Track Available</h3>
                  <p className="text-sm text-smash-gray font-bold mb-6 italic tracking-tight">Buy this anthem to support {song.artist_name} and hear the rest.</p>
                  <button 
                    onClick={handleBuy}
                    className="px-8 py-4 bg-smash-orange text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-smash-orange/20"
                  >
                     BUY FOR MK {song.price}
                  </button>
               </div>
            )}
         </motion.div>

         {/* Meta Overlay (Bottom) */}
         <div className="absolute bottom-10 left-8 right-24 space-y-4">
            <div className="flex flex-wrap gap-2">
               <span className="px-3 py-1 bg-smash-orange text-white text-[10px] font-black rounded-full uppercase tracking-widest">{song.genre || 'Trending'}</span>
               {song.region && <span className="px-3 py-1 bg-white/10 text-white text-[10px] font-black rounded-full uppercase tracking-widest">{song.region}</span>}
            </div>
            <div>
               <h2 className="text-4xl md:text-5xl font-black font-display italic uppercase tracking-tighter leading-none mb-2">{song.title}</h2>
               <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-white/80">{song.artist_name || (song.profiles as any)?.stage_name || (song.profiles as any)?.full_name}</p>
                  {song.profiles?.verified && <div className="w-4 h-4 bg-smash-cyan rounded-full flex items-center justify-center"><Check size={10} className="text-black" /></div>}
               </div>
            </div>
         </div>

         {/* Action Bar (Right) */}
         <div className="absolute right-6 bottom-32 flex flex-col items-center gap-8">
            <div 
               className="flex flex-col items-center gap-2 group cursor-pointer"
               onClick={(e) => { e.stopPropagation(); navigate(`/artist/${song.artist_id}`); }}
            >
               <div className="w-14 h-14 rounded-full border-4 border-smash-black overflow-hidden bg-smash-dark ring-2 ring-smash-orange relative hover:scale-110 transition-transform">
                  <img src={song.profiles?.avatar_url || 'https://i.pravatar.cc/100'} className="w-full h-full object-cover" alt="" />
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 bg-smash-orange rounded-full flex items-center justify-center text-white border-2 border-smash-black">
                     <UserPlus size={12} />
                  </div>
               </div>
            </div>

            {song.is_for_sale && (
               <div className="flex flex-col items-center gap-2">
                  <button 
                    onClick={handleBuy}
                    className="w-14 h-14 bg-smash-orange rounded-full flex items-center justify-center text-white hover:scale-110 transition-all shadow-[0_0_20px_rgba(255,95,0,0.4)]"
                  >
                     <ShoppingBag size={24} />
                  </button>
                  <span className="text-[10px] font-black text-smash-orange uppercase tracking-widest">BUY</span>
               </div>
            )}

            <motion.div 
               animate={{ rotate: isPlaying ? 360 : 0 }}
               transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
               className="w-14 h-14 rounded-full bg-smash-dark border-4 border-white/20 flex items-center justify-center p-2 mt-4"
            >
               <Disc className="text-smash-gray" size={24} />
            </motion.div>
         </div>
      </div>
    </div>
  );
};

const MotoFeed: React.FC = () => {
  const navigate = useNavigate();
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const dragY = useMotionValue(0);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*, profiles!artist_id(full_name, stage_name, avatar_url, verified)')
        .eq('approved', true)
        .limit(20);

      if (error) throw error;
      setSongs((data || []).map(s => ({
         ...s,
         artist_name: s.profiles?.stage_name || s.profiles?.full_name || 'Artist',
         cover_url: s.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&h=800&fit=crop',
         url: s.audio_url
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < songs.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.y < -100) handleNext();
    else if (info.offset.y > 100) handlePrev();
  };

  if (loading) return (
     <div className="h-screen bg-smash-black flex items-center justify-center">
        <Flame className="text-smash-orange animate-pulse" size={60} />
     </div>
  );

  if (songs.length === 0) return (
     <div className="h-screen bg-smash-black flex flex-col items-center justify-center p-8 text-center">
        <Disc className="text-smash-gray/20 animate-spin-slow mb-8" size={120} />
        <h2 className="text-4xl font-black font-display italic uppercase tracking-tighter mb-4 text-white">The Feed is Cold</h2>
        <p className="text-smash-gray font-bold max-w-sm mx-auto mb-12">No anthems found in the warm heart today. Check back soon for fresh drops.</p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-white text-smash-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
        >
          Back to Home
        </button>
     </div>
  );

  return (
    <div className="h-screen w-screen bg-smash-black overflow-hidden touch-none">
       {/* UI Tooltips */}
       <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 pointer-events-none">
          <div className="px-4 py-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2">
             <div className="w-2 h-2 bg-smash-orange rounded-full animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">MOTO FEED LIVE</span>
          </div>
       </div>

       <div className="absolute top-1/2 left-4 md:left-12 -translate-y-1/2 z-50 flex flex-col gap-4 pointer-events-none opacity-20">
          <ArrowUp size={32} strokeWidth={3} />
          <div className="h-32 w-[2px] bg-white/20 mx-auto" />
          <ArrowDown size={32} strokeWidth={3} />
       </div>

       <AnimatePresence initial={false}>
          <motion.div
            key={currentIndex}
            initial={{ y: 0 }}
            animate={{ y: 0 }}
            exit={dragY.get() < 0 ? { y: '-100%' } : { y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={handleDragEnd}
            dragElastic={0.2}
            className="h-full w-full absolute inset-0 cursor-grab active:cursor-grabbing"
          >
             <MotoCard song={songs[currentIndex]} active={true} />
          </motion.div>
       </AnimatePresence>
    </div>
  );
};

const Check = ({ size, className }: any) => (
   <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="20 6 9 17 4 12" />
   </svg>
);

export default MotoFeed;
