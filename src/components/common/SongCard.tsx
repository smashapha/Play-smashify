import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, ShoppingBag, Heart, MoreVertical, Plus, Share2, User, Music2, ListMusic } from 'lucide-react';
import { Song } from '../../types';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import { buyTrack } from '../../lib/paychangu';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import AddToPlaylistModal from './AddToPlaylistModal';

interface SongCardProps {
  song: Song;
  queue: Song[];
  className?: string;
}

const SongCard: React.FC<SongCardProps> = ({ song, queue, className = '' }) => {
  const navigate = useNavigate();
  const { currentSong, isPlaying, playSong, addToQueue } = usePlayer();
  const { userProfile } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [isLiked, setIsLiked] = useState(() => {
    try {
      const liked = JSON.parse(localStorage.getItem('smash_liked_songs') || '[]');
      return Array.isArray(liked) && liked.includes(song.id);
    } catch (e) {
      return false;
    }
  });

  const isCurrent = currentSong?.id === song.id;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    let liked: string[] = [];
    try {
      liked = JSON.parse(localStorage.getItem('smash_liked_songs') || '[]');
      if (!Array.isArray(liked)) liked = [];
    } catch (e) {
      liked = [];
    }
    let newLiked;
    
    if (isLiked) {
      newLiked = liked.filter((id: string) => id !== song.id);
      if (userProfile) {
        await supabase
          .from('likes')
          .delete()
          .eq('user_id', userProfile.id)
          .eq('song_id', song.id);
      }
    } else {
      newLiked = [...liked, song.id];
      if (userProfile) {
        await supabase
          .from('likes')
          .insert({
            user_id: userProfile.id,
            song_id: song.id
          });
      }
    }
    localStorage.setItem('smash_liked_songs', JSON.stringify(newLiked));
    setIsLiked(!isLiked);
  };

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playSong(song, queue);
  };

  const handleBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userProfile) {
      alert('Please sign in to buy tracks');
      return;
    }
    buyTrack({
      song,
      user: userProfile,
      onSuccess: () => {
        alert('Purchase successful! You now own ' + song.title);
        window.location.reload();
      }
    });
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group relative bento-card p-4 bg-smash-dark/40 border-white/5 hover:border-smash-orange/30 transition-all cursor-pointer ${className}`}
      onClick={handlePlay}
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-2xl">
        <img 
          src={song.cover_url} 
          alt={song.title} 
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
          referrerPolicy="no-referrer"
        />
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-14 h-14 rounded-full bg-smash-orange text-white flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
            {isCurrent && isPlaying ? <Pause size={28} fill="white" /> : <Play size={28} fill="white" className="ml-1" />}
          </div>
        </div>

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
           {song.is_purchased ? (
             <div className="px-3 py-1 bg-smash-green text-black text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">OWNED</div>
           ) : song.is_for_sale ? (
             <div className="px-3 py-1 bg-smash-orange text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">MK {song.price}</div>
           ) : null}
        </div>

        {/* Equalizer Animation */}
        {isCurrent && isPlaying && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-end gap-1 h-6">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ height: [4, 24, 8, 16, 4] }}
                transition={{ duration: 0.5 + i * 0.1, repeat: Infinity, ease: 'linear' }}
                className="w-1 bg-smash-orange rounded-full"
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <h3 className={`font-display font-black text-lg italic uppercase tracking-tight truncate ${isCurrent ? 'text-smash-orange' : 'text-white'}`}>
            {song.title}
          </h3>
          <p className="text-sm text-smash-gray font-bold truncate hover:text-white transition-colors">{song.artist_name}</p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
           <button 
             onClick={handleLike}
             className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isLiked ? 'text-smash-red' : 'text-smash-gray'}`}
           >
              <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
           </button>
           <div className="relative">
             <button 
               onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
               className="p-2 rounded-full text-smash-gray hover:text-white hover:bg-white/10 transition-all"
             >
                <MoreVertical size={18} />
             </button>
             
             <AnimatePresence>
               {showMenu && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                   <motion.div
                     initial={{ opacity: 0, scale: 0.9, y: 10 }}
                     animate={{ opacity: 1, scale: 1, y: 0 }}
                     exit={{ opacity: 0, scale: 0.9, y: 10 }}
                     className="absolute right-0 bottom-full mb-2 w-48 glass-morphism border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                   >
                      <button 
                        onClick={(e) => { e.stopPropagation(); addToQueue(song); setShowMenu(false); }}
                        className="w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 hover:bg-white/5 transition-colors"
                      >
                        <Plus size={16} /> Add to Queue
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowPlaylistModal(true); setShowMenu(false); }}
                        className="w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 hover:bg-white/5 transition-colors"
                      >
                        <ListMusic size={16} /> Add to Playlist
                      </button>
                      <button className="w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 hover:bg-white/5 transition-colors">
                        <Share2 size={16} /> Share Song
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/artist/${song.artist_id}`); }}
                        className="w-full px-4 py-3 text-left text-sm font-bold flex items-center gap-3 hover:bg-white/5 transition-colors"
                      >
                        <User size={16} /> View Artist
                      </button>
                      {!song.is_purchased && song.is_for_sale && (
                        <button 
                          onClick={handleBuy}
                          className="w-full px-4 py-3 text-left text-sm font-black flex items-center gap-3 bg-smash-orange/10 text-smash-orange hover:bg-smash-orange/20 transition-colors"
                        >
                          <ShoppingBag size={16} /> Buy MK {song.price}
                        </button>
                      )}
                   </motion.div>
                 </>
               ) as any}
             </AnimatePresence>
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showPlaylistModal && (
          <AddToPlaylistModal 
            song={song} 
            onClose={() => setShowPlaylistModal(false)} 
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SongCard;
