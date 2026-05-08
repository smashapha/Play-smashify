import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Share2, Instagram, Twitter, Music2, MapPin, Users, Check, Crown, Heart, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Song, UserProfile } from '../types';
import SongCard from '../components/common/SongCard';
import SupportArtistModal from '../components/common/SupportArtistModal';
import { usePlayer } from '../context/PlayerContext';

const ArtistProfile: React.FC = () => {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const { userProfile } = useAuth();
   const { playQueue } = usePlayer();
   
   const [artist, setArtist] = useState<UserProfile | null>(null);
   const [songs, setSongs] = useState<Song[]>([]);
   const [loading, setLoading] = useState(true);

   const [isFollowing, setIsFollowing] = useState(false);
   const [followLoading, setFollowLoading] = useState(false);
   const [copied, setCopied] = useState(false);
   const [showSupportModal, setShowSupportModal] = useState(false);

   const handleShare = () => {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
   };
 
   useEffect(() => {
      const checkFollow = async () => {
         if (!userProfile || !id) return;
         const { data } = await supabase
            .from('followers')
            .select('*')
            .eq('follower_id', userProfile.id)
            .eq('artist_id', id)
            .maybeSingle();
         if (data) setIsFollowing(true);
      };
      
      const fetchArtist = async () => {
         if (!id) return;
         setLoading(true);
         try {
            const { data: artistData, error: artistError } = await supabase
               .from('profiles')
               .select('*')
               .eq('id', id)
               .single();
            
            if (artistError) throw artistError;
            setArtist(artistData);
            checkFollow();

            const { data: songsData, error: songsError } = await supabase
               .from('songs')
               .select('*')
               .eq('artist_id', id)
               .eq('approved', true);

            if (songsError) throw songsError;

            const formattedSongs = (songsData || []).map((s: any) => ({
               ...s,
               artist_name: artistData.stage_name || artistData.full_name || 'Artist',
               cover_url: s.cover_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop',
               url: s.audio_url,
               profiles: artistData
             }));
            setSongs(formattedSongs);

         } catch (err) {
            console.error('Error fetching artist:', err);
         } finally {
            setLoading(false);
         }
      };

      fetchArtist();
   }, [id, userProfile]);

   const handleFollow = async () => {
      if (!userProfile) {
         toast.error('Please sign in to follow artists.');
         return;
      }
      setFollowLoading(true);
      try {
         if (isFollowing) {
            const { error } = await supabase.from('followers').delete().eq('follower_id', userProfile.id).eq('artist_id', id);
            if (error) throw error;
            setIsFollowing(false);
            setArtist(prev => prev ? { ...prev, followers_count: Math.max(0, (prev.followers_count || 0) - 1) } : null);
            toast.success(`Unfollowed ${artist?.stage_name || 'artist'}`);
         } else {
            const { error } = await supabase.from('followers').insert({ follower_id: userProfile.id, artist_id: id });
            if (error) throw error;
            setIsFollowing(true);
            setArtist(prev => prev ? { ...prev, followers_count: (prev.followers_count || 0) + 1 } : null);
            toast.success(`Following ${artist?.stage_name || 'artist'}!`);
         }
      } catch (err: any) {
         toast.error('Error: ' + err.message);
      } finally {
         setFollowLoading(false);
      }
   };
 
   if (loading) {
      return (
         <div className="min-h-screen bg-smash-black flex justify-center items-center">
            <div className="w-12 h-12 border-4 border-smash-orange border-t-transparent rounded-full animate-spin"></div>
         </div>
      );
   }

   if (!artist) {
      return (
         <div className="min-h-[50vh] flex flex-col justify-center items-center p-12 text-center">
            <Users size={64} className="text-smash-gray opacity-30 mb-6" />
            <h1 className="text-4xl font-black font-display italic uppercase mb-4">Artist Not Found</h1>
            <button onClick={() => navigate(-1)} className="text-smash-orange font-black uppercase tracking-widest hover:underline">Go Back</button>
         </div>
      );
   }

   const isOwner = userProfile?.id === artist.id;

   const formatCompact = (num: number) => {
      if (num < 1000) return String(num);
      if (num < 1000000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
   };

   return (
      <div className="space-y-12">
         {/* Hero Section */}
         <div className="relative h-auto md:h-96 rounded-[32px] overflow-hidden mb-16 shadow-2xl mt-4 pb-8 md:pb-0">
            <div className="absolute inset-0 bg-gradient-to-t from-smash-black via-smash-dark/90 to-transparent z-10" />
            <img src={artist.banner_url || artist.avatar_url || "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f92e?w=1200&h=800&fit=crop"} alt={artist.full_name} className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-overlay" />
            <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
               <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-smash-orange overflow-hidden shadow-xl shadow-smash-orange/20 relative md:top-12 flex-shrink-0">
                     <img src={artist.avatar_url || "https://i.pravatar.cc/300"} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="space-y-3">
                     <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                        {artist.genre && (
                           <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                              <Music2 size={12} /> {artist.genre}
                           </span>
                        )}
                        {artist.city && (
                           <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                              <MapPin size={12} /> {artist.city}
                           </span>
                        )}
                        {(artist.subscription_tier === 'pro' || artist.subscription_tier === 'label' || artist.subscription_tier === 'standard') && (
                           <span className="px-3 py-1 bg-smash-orange/20 text-smash-orange border border-smash-orange/30 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
                              <Crown size={12} /> PRO
                           </span>
                        )}
                     </div>
                     <h1 className="text-4xl md:text-7xl font-black font-display italic uppercase tracking-tighter drop-shadow-lg leading-none flex items-center justify-center md:justify-start gap-3">
                        {artist.stage_name || artist.full_name || 'Unknown Artist'}
                        {artist.verified && <div className="w-8 h-8 bg-smash-cyan rounded-full flex items-center justify-center shrink-0"><Check size={16} className="text-black" /></div>}
                     </h1>
                     
                     <div className="flex items-center justify-center md:justify-start gap-8 pt-2">
                        <div>
                           <p className="text-xl md:text-2xl font-black font-display italic text-white">{formatCompact(artist.followers_count || 0)}</p>
                           <p className="text-[10px] uppercase font-black tracking-widest text-smash-gray">Followers</p>
                        </div>
                        <div>
                           <p className="text-xl md:text-2xl font-black font-display italic text-white">{songs.length}</p>
                           <p className="text-[10px] uppercase font-black tracking-widest text-smash-gray">Songs</p>
                        </div>
                        <div>
                           <p className="text-xl md:text-2xl font-black font-display italic text-white">{formatCompact(artist.total_plays || 0)}</p>
                           <p className="text-[10px] uppercase font-black tracking-widest text-smash-gray">Plays</p>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 mt-4 md:mt-0">
                  {isOwner ? (
                     <button onClick={() => navigate('/artist-hub')} className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-xs transition-all backdrop-blur-lg">
                        Edit Profile
                     </button>
                  ) : (
                     <div className="flex flex-wrap justify-center gap-3">
                        <button 
                           onClick={handleFollow}
                           disabled={followLoading}
                           className={`px-6 py-3.5 ${isFollowing ? 'bg-white/10 border border-white/10' : 'bg-smash-orange hover:bg-orange-600'} text-white rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center gap-2`}
                        >
                           <Users size={16} /> {isFollowing ? 'Following' : 'Follow'}
                        </button>
                        <button 
                           onClick={handleShare}
                           className="px-6 py-3.5 bg-white/5 hover:bg-white/10 text-white rounded-full font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 border border-white/10"
                        >
                           {copied ? (
                              <><Check size={16} className="text-smash-green" /> Copied</>
                           ) : (
                              <><Share2 size={16} /> Share</>
                           )}
                        </button>
                        <button 
                           onClick={() => setShowSupportModal(true)}
                           className="px-6 py-3.5 bg-smash-purple hover:bg-purple-600 text-white rounded-full font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-smash-purple/20 flex items-center gap-2"
                        >
                           <Heart size={16} /> Support
                        </button>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Content Grid */}
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:ml-4 px-4 lg:px-0">
            
            {/* Left Column - Details */}
            <div className="lg:col-span-1 space-y-8">
               <div className="bento-card p-8 space-y-6 bg-white/5 border border-white/5 rounded-3xl">
                  <h3 className="text-xl font-black font-display italic uppercase border-b border-white/10 pb-4">About the Artist</h3>
                  {artist.bio ? (
                     <p className="text-smash-gray font-medium leading-relaxed">{artist.bio}</p>
                  ) : (
                     <p className="text-smash-gray/50 font-medium italic">No bio available yet.</p>
                  )}
                  
                  {/* Social Links */}
                  <div className="pt-4 border-t border-white/10 flex gap-4">
                     {artist.instagram && (
                        <a href={artist.instagram} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-smash-gray hover:text-white hover:bg-smash-orange transition-all">
                           <Instagram size={20} />
                        </a>
                     )}
                     {artist.twitter && (
                        <a href={artist.twitter} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-smash-gray hover:text-white hover:bg-smash-purple transition-all">
                           <Twitter size={20} />
                        </a>
                     )}
                     <button onClick={handleShare} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-smash-gray hover:text-white transition-all ml-auto relative">
                        {copied ? <Check size={20} className="text-smash-green" /> : <Share2 size={20} />}
                        {copied && (
                           <motion.span 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="absolute -top-10 right-0 bg-smash-green text-white text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest whitespace-nowrap"
                           >
                              Copied!
                           </motion.span>
                        )}
                     </button>
                  </div>
               </div>
            </div>

            {/* Right Column - Music */}
            <div className="lg:col-span-2 space-y-8">
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <div>
                     <h2 className="text-3xl font-black font-display italic uppercase tracking-tighter">Releases</h2>
                     <p className="text-sm font-bold text-smash-gray uppercase tracking-widest">{songs.length} Tracks</p>
                  </div>
                  {songs.length > 0 && (
                     <button 
                        onClick={() => playQueue(songs, 0)}
                        className="px-6 py-3 bg-white text-black rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-smash-orange hover:text-white transition-all"
                     >
                        <Play size={14} fill="currentColor" /> Play All
                     </button>
                  )}
               </div>
               
               {songs.length > 0 ? (
                  <div className="space-y-4">
                     {songs.map(song => (
                        <SongCard key={song.id} song={song} queue={songs} variant="list" />
                     ))}
                  </div>
               ) : (
                  <div className="bento-card p-12 text-center flex flex-col items-center justify-center">
                     <Music2 size={48} className="text-smash-gray/30 mb-6" />
                     <h3 className="text-2xl font-black font-display italic uppercase mb-2 text-smash-gray">No Music Yet</h3>
                     <p className="text-smash-gray/60 font-bold max-w-sm">This artist hasn't uploaded any tracks yet.</p>
                  </div>
               )}
            </div>

         </div>

         <AnimatePresence>
            {showSupportModal && artist && (
               <SupportArtistModal 
                  artist={artist} 
                  onClose={() => setShowSupportModal(false)} 
               />
            )}
         </AnimatePresence>
      </div>
   );
};

export default ArtistProfile;
