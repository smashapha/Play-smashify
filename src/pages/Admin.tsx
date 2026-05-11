import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CheckCircle2, Trash2, Music2, Plus, FileAudio, X, Flame, Volume2, VolumeX, Edit3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Admin = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listeners' | 'artists' | 'songs' | 'applications' | 'song-reviews' | 'ads'>('overview');
  const [artists, setArtists] = useState<any[]>([]); // Approved artists
  const [listeners, setListeners] = useState<any[]>([]); // All listeners
  const [allSongs, setAllSongs] = useState<any[]>([]); // All songs on platform
  const [applications, setApplications] = useState<any[]>([]); // Pending artists
  const [pendingSongs, setPendingSongs] = useState<any[]>([]); // Songs awaiting review
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userProfile && !userProfile.is_admin) {
      toast.error('Unauthorized access');
      navigate('/');
      return;
    }
    if (userProfile?.is_admin) {
      fetchAllData();
    }
  }, [userProfile, navigate]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchArtists(),
      fetchListeners(),
      fetchApplications(),
      fetchPendingSongs(),
      fetchAllSongs(),
      fetchAds()
    ]);
    setLoading(false);
  };

  const fetchAds = async () => {
    const { data } = await supabase.from('audio_ads').select('*').order('created_at', { ascending: false });
    setAds(data || []);
  };

  const fetchListeners = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    setListeners(data || []);
  };

  const fetchPendingSongs = async () => {
    const { data } = await supabase
      .from('songs')
      .select('*, profiles!artist_id(stage_name, full_name, email)')
      .eq('approved', false)
      .order('created_at', { ascending: true });
    setPendingSongs(data || []);
  };

  const fetchAllSongs = async () => {
    const { data } = await supabase
      .from('songs')
      .select('*, profiles!artist_id(stage_name, full_name, email)')
      .order('created_at', { ascending: false });
    setAllSongs(data || []);
  };

  const toggleAdStatus = async (ad: any) => {
    const { error } = await supabase.from('audio_ads').update({ active: !ad.active }).eq('id', ad.id);
    if (error) toast.error(error.message);
    else {
      toast.success(`Ad ${ad.active ? 'deactivated' : 'activated'}`);
      fetchAds();
    }
  };

  const deleteAd = async (adId: string) => {
    if (!confirm('Delete this ad permanently?')) return;
    const { error } = await supabase.from('audio_ads').delete().eq('id', adId);
    if (error) toast.error(error.message);
    else {
      toast.success('Ad deleted');
      fetchAds();
    }
  };

  const fetchArtists = async () => {
    const { data: artistsData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'artist')
      .eq('approved', true)
      .order('created_at', { ascending: false });
    
    if (artistsData) {
      const artistsWithPending = await Promise.all(artistsData.map(async (art) => {
        const { count } = await supabase.from('songs').select('*', { count: 'exact', head: true }).eq('artist_id', art.id).eq('approved', false);
        return { ...art, pending_songs: count || 0 };
      }));
      setArtists(artistsWithPending);
    }
  };

  const fetchApplications = async () => {
    const { data } = await supabase
      .from('artist_applications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true });
    setApplications(data || []);
  };

  const approveArtist = async (application: any) => {
    try {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: application.profile_id,
        full_name: application.full_name,
        stage_name: application.stage_name,
        email: application.email,
        genre: application.genre,
        city: application.city,
        phone: application.phone,
        approved: true,
        verified: false,
        wallet_balance: 0,
        user_type: 'artist',
      });
      if (profileError) throw profileError;

      const { error: appError } = await supabase
        .from('artist_applications')
        .update({ status: 'approved' })
        .eq('id', application.id);
      if (appError) throw appError;

      toast.success(`${application.stage_name} approved!`);
      fetchApplications();
      fetchArtists();

    } catch (err: any) {
      toast.error('Approval failed: ' + err.message);
    }
  };

  const approveSong = async (songId: string) => {
    const { error } = await supabase.from('songs').update({ approved: true }).eq('id', songId);
    if (error) toast.error(error.message);
    else {
      toast.success('Song approved and is now live!');
      fetchPendingSongs();
      fetchArtists();
    }
  };

  const rejectSong = async (songId: string) => {
    if (!confirm('Reject and delete this song permanently?')) return;
    const { error } = await supabase.from('songs').delete().eq('id', songId);
    if (error) toast.error(error.message);
    else {
      toast.success('Song rejected and removed');
      fetchPendingSongs();
    }
  };

  const rejectArtist = async (application: any, reason: string = "Not eligible") => {
    try {
      await supabase.from('artist_applications')
        .update({ status: 'rejected', admin_notes: reason })
        .eq('id', application.id);

      await supabase.from('user_profiles').upsert({
        id: application.profile_id,
        full_name: application.full_name,
        email: application.email,
        subscription_tier: 'Free',
        user_type: 'listener',
      });

      toast.success('Application rejected.');
      fetchApplications();

    } catch (err: any) {
      toast.error('Rejection failed: ' + err.message);
    }
  };

  const approveAllSongs = async (artistId: string) => {
    const { error } = await supabase.from('songs').update({ approved: true }).eq('artist_id', artistId).eq('approved', false);
    if (error) toast.error(error.message);
    else {
      toast.success('All songs for this artist approved!');
      fetchArtists();
      fetchPendingSongs();
    }
  };

  const toggleArtistVerification = async (artistId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ verified: !currentStatus })
      .eq('id', artistId);
    
    if (error) toast.error(error.message);
    else {
      toast.success(`Artist ${!currentStatus ? 'verified' : 'unverified'}`);
      fetchArtists();
    }
  };

  const deleteArtist = async (id: string, name: string) => {
    if (!confirm(`Permanently delete artist "${name}"?`)) return;
    try {
      await supabase.from('songs').delete().eq('artist_id', id);
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;
      toast.success('Artist removed.');
      fetchArtists();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  };

  const deleteUser = async (id: string, name: string) => {
    if (!confirm(`Permanently delete listener "${name}"?`)) return;
    try {
      const { error } = await supabase.from('user_profiles').delete().eq('id', id);
      if (error) throw error;
      toast.success('Listener removed.');
      fetchListeners();
    } catch (err: any) {
      toast.error('Error: ' + err.message);
    }
  };

  if (!userProfile?.is_admin) return null;

  const TabButton = ({ id, label, icon: Icon, count }: { id: typeof activeTab, label: string, icon: any, count?: number }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all uppercase font-black text-[10px] tracking-widest ${
        activeTab === id 
          ? 'border-smash-purple text-white bg-smash-purple/5' 
          : 'border-transparent text-smash-gray hover:text-white hover:bg-white/5'
      }`}
    >
      <Icon size={16} />
      {label}
      {count !== undefined && count > 0 && (
        <span className="ml-1 px-2 py-0.5 bg-smash-red text-white rounded-full text-[8px] animate-pulse">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-smash-black text-white p-6 md:p-12 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <h2 className="text-4xl font-studio font-black flex items-center gap-3 uppercase italic tracking-tighter">
              <ShieldCheck className="text-smash-purple" size={40} /> Admin Control
            </h2>
            <p className="text-smash-gray text-xs font-bold uppercase tracking-widest mt-1">Platform Governance & Asset Moderation</p>
          </div>
          <div className="bg-smash-purple/10 text-smash-purple px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border border-smash-purple/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-smash-purple rounded-full animate-ping" />
            Live Admin Session
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="flex overflow-x-auto border-b border-white/5 no-scrollbar">
          <TabButton id="overview" label="Overview" icon={ShieldCheck} />
          <TabButton id="listeners" label="Listeners" icon={Volume2} count={listeners.length} />
          <TabButton id="artists" label="Artists" icon={Flame} count={artists.length} />
          <TabButton id="songs" label="All Music" icon={Music2} count={allSongs.length} />
          <TabButton id="applications" label="Apps" icon={CheckCircle2} count={applications.length} />
          <TabButton id="song-reviews" label="Reviews" icon={ShieldCheck} count={pendingSongs.length} />
          <TabButton id="ads" label="Ads" icon={FileAudio} />
        </div>

        <div className="min-h-[400px]">
          {loading ? (
             <div className="flex flex-col items-center justify-center p-20 gap-4">
                <div className="w-12 h-12 border-4 border-smash-purple border-t-transparent rounded-full animate-spin" />
                <p className="text-smash-gray font-black uppercase text-[10px] tracking-widest">Hydrating Dashboard...</p>
             </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 space-y-4">
                      <p className="text-smash-gray text-[10px] font-black uppercase tracking-widest">Total Listeners</p>
                      <h4 className="text-5xl font-studio font-black tracking-tighter">{listeners.length}</h4>
                   </div>
                   <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 space-y-4">
                      <p className="text-smash-gray text-[10px] font-black uppercase tracking-widest">Total Artists</p>
                      <h4 className="text-5xl font-studio font-black tracking-tighter text-smash-purple">{artists.length}</h4>
                   </div>
                   <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 space-y-4">
                      <p className="text-smash-gray text-[10px] font-black uppercase tracking-widest">Pending Music</p>
                      <h4 className={`text-5xl font-studio font-black tracking-tighter ${pendingSongs.length > 0 ? 'text-smash-orange animate-pulse' : ''}`}>{pendingSongs.length}</h4>
                   </div>
                   <div className="bg-white/5 p-8 rounded-[32px] border border-white/5 space-y-4">
                      <p className="text-smash-gray text-[10px] font-black uppercase tracking-widest">Pending Apps</p>
                      <h4 className={`text-5xl font-studio font-black tracking-tighter ${applications.length > 0 ? 'text-smash-red animate-pulse' : ''}`}>{applications.length}</h4>
                   </div>
                </motion.div>
              )}

              {activeTab === 'listeners' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 rounded-[32px] border border-white/5 overflow-hidden">
                  <div className="p-6 border-b border-white/5 font-black uppercase text-[10px] tracking-widest text-smash-gray">Listener Directory</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-smash-gray bg-white/5">
                          <th className="p-6">User</th>
                          <th className="p-6">Subscription</th>
                          <th className="p-6">Joined</th>
                          <th className="p-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-sm">
                        {listeners.map(l => (
                          <tr key={l.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-6">
                              <div className="flex items-center gap-3">
                                <img src={l.avatar_url || "https://placehold.co/40x40/18162C/9B5DE5?text=?"} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                  <p className="font-bold">{l.full_name}</p>
                                  <p className="text-[10px] text-smash-gray truncate max-w-[150px]">{l.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="p-6">
                              <span className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest ${l.subscription_tier === 'Premium' ? 'bg-smash-orange text-white' : 'bg-white/10 text-smash-gray'}`}>
                                {l.subscription_tier || 'Free'}
                              </span>
                            </td>
                            <td className="p-6 text-smash-gray text-xs">{new Date(l.created_at).toLocaleDateString()}</td>
                            <td className="p-6 text-right">
                              <button onClick={() => deleteUser(l.id, l.full_name)} className="p-2 hover:bg-smash-red/20 text-smash-gray hover:text-smash-red rounded-lg transition-all">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'artists' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 rounded-[32px] border border-white/5 overflow-hidden">
                   <div className="p-6 border-b border-white/5 flex justify-between items-center">
                      <span className="font-black uppercase text-[10px] tracking-widest text-smash-gray">Verified Artist Roster</span>
                   </div>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left">
                       <thead>
                         <tr className="text-[10px] font-black uppercase tracking-widest text-smash-gray bg-white/5">
                           <th className="p-6">Artist</th>
                           <th className="p-6">Wallet</th>
                           <th className="p-6">Pending Music</th>
                           <th className="p-6 text-right">Actions</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5 text-sm">
                         {artists.map(a => (
                           <tr key={a.id} className="hover:bg-white/5 transition-colors">
                             <td className="p-6">
                                <div className="flex items-center gap-3">
                                  <img src={a.avatar_url || "https://placehold.co/40x40/18162C/9B5DE5?text=?"} className="w-10 h-10 rounded-full object-cover" />
                                  <div>
                                    <p className="font-bold flex items-center gap-1">{a.stage_name} {a.verified && <ShieldCheck size={12} className="text-smash-cyan" />}</p>
                                    <p className="text-[10px] text-smash-gray">{a.city} • {a.genre}</p>
                                  </div>
                                </div>
                             </td>
                             <td className="p-6 font-bold text-smash-green uppercase text-xs">MK {a.wallet_balance?.toLocaleString() || 0}</td>
                             <td className="p-6">
                                {a.pending_songs > 0 ? (
                                   <div className="flex items-center gap-2 text-smash-orange font-bold text-xs">
                                      <Music2 size={14} /> {a.pending_songs} pending
                                   </div>
                                ) : (
                                   <span className="text-smash-gray text-[10px] uppercase font-bold italic">Clean</span>
                                )}
                             </td>
                             <td className="p-6 text-right space-x-2">
                                <button 
                                  onClick={() => toggleArtistVerification(a.id, !!a.verified)}
                                  className={`px-3 py-1.5 border rounded-lg text-[8px] font-black uppercase transition-all ${
                                    a.verified 
                                      ? 'bg-smash-cyan/10 text-smash-cyan border-smash-cyan/20 hover:bg-smash-cyan hover:text-black' 
                                      : 'bg-white/5 text-smash-gray border-white/10 hover:border-smash-cyan hover:text-smash-cyan'
                                  }`}
                                >
                                  {a.verified ? 'Verified' : 'Verify'}
                                </button>
                                {a.pending_songs > 0 && (
                                   <button onClick={() => approveAllSongs(a.id)} className="px-3 py-1.5 bg-smash-purple/10 text-smash-purple border border-smash-purple/20 rounded-lg text-[8px] font-black uppercase hover:bg-smash-purple hover:text-white transition-all">Approve All</button>
                                )}
                                <button onClick={() => deleteArtist(a.id, a.stage_name)} className="p-2 hover:bg-smash-red/20 text-smash-gray hover:text-smash-red rounded-lg transition-all">
                                  <Trash2 size={16} />
                                </button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </motion.div>
              )}

              {activeTab === 'songs' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 rounded-[32px] border border-white/5 overflow-hidden">
                  <div className="p-6 border-b border-white/5 font-black uppercase text-[10px] tracking-widest text-smash-gray">Master Song List</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-white/5 text-smash-gray text-[10px] uppercase tracking-widest font-black">
                        <tr>
                          <th className="p-6">Song</th>
                          <th className="p-6">Artist</th>
                          <th className="p-6">Status</th>
                          <th className="p-6 text-right">Moderation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {allSongs.map((song) => (
                          <tr key={song.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-6">
                              <div className="flex items-center gap-3 font-bold">
                                 <div className="w-10 h-10 bg-smash-purple/20 rounded-xl flex items-center justify-center text-smash-purple">
                                    <Music2 size={18} />
                                 </div>
                                 <p>{song.title}</p>
                              </div>
                            </td>
                            <td className="p-6">
                              <p className="font-bold">{song.profiles?.stage_name || 'Unknown'}</p>
                            </td>
                            <td className="p-6">
                               <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${song.approved ? 'bg-smash-green/10 text-smash-green' : 'bg-smash-orange/10 text-smash-orange'}`}>
                                  {song.approved ? 'Live' : 'Pending'}
                               </span>
                            </td>
                            <td className="p-6 text-right flex items-center justify-end gap-2">
                              {!song.approved && (
                                <button onClick={() => approveSong(song.id)} className="px-3 py-1.5 bg-smash-green/10 text-smash-green border border-smash-green/20 rounded-lg text-[8px] font-black uppercase hover:bg-smash-green hover:text-white transition-all">Approve</button>
                              )}
                              <button onClick={() => rejectSong(song.id)} className="p-2 hover:bg-smash-red/20 text-smash-gray hover:text-smash-red rounded-lg transition-all">
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'applications' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 rounded-[32px] border border-white/5 overflow-hidden">
                  <div className="p-6 border-b border-white/5 font-black uppercase text-[10px] tracking-widest text-smash-gray">Artist Applications</div>
                  <div className="overflow-x-auto">
                    {applications.length > 0 ? (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-smash-gray text-[10px] uppercase tracking-widest font-black">
                          <tr>
                            <th className="p-6">Applicant</th>
                            <th className="p-6">Verification</th>
                            <th className="p-6 text-right">Review</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {applications.map((app) => (
                            <tr key={app.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-6">
                                <div>
                                  <p className="font-bold">{app.stage_name}</p>
                                  <p className="text-[10px] text-smash-gray uppercase font-bold tracking-widest">{app.genre} • {app.city}</p>
                                  <p className="text-[10px] text-smash-gray italic">{app.email}</p>
                                </div>
                              </td>
                              <td className="p-6">
                                {app.id_document_url && (
                                  <a href={app.id_document_url} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-smash-cyan/10 text-smash-cyan border border-smash-cyan/20 rounded-lg text-[8px] font-black uppercase hover:bg-smash-cyan hover:text-white transition-all inline-block">
                                    ID Document
                                  </a>
                                )}
                              </td>
                              <td className="p-6 text-right flex items-center justify-end gap-2">
                                <button onClick={() => approveArtist(app)} className="p-3 bg-smash-green text-white rounded-xl hover:bg-smash-green/80 transition-all active:scale-95"><CheckCircle2 size={18} /></button>
                                <button onClick={() => rejectArtist(app)} className="p-3 bg-smash-red text-white rounded-xl hover:bg-smash-red/80 transition-all active:scale-95"><X size={18} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-20 text-center text-smash-gray font-black uppercase tracking-widest text-xs italic">All Clear. No apps pending.</div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'song-reviews' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 rounded-[32px] border border-white/5 overflow-hidden">
                  <div className="p-6 border-b border-white/5 font-black uppercase text-[10px] tracking-widest text-smash-gray">Song Review Queue</div>
                  <div className="overflow-x-auto">
                    {pendingSongs.length > 0 ? (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-white/5 text-smash-gray text-[10px] uppercase tracking-widest font-black">
                          <tr>
                            <th className="p-6">Song</th>
                            <th className="p-6">Artist</th>
                            <th className="p-6">Preview</th>
                            <th className="p-6 text-right">Moderation</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {pendingSongs.map((song) => (
                            <tr key={song.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-6">
                                <div className="flex items-center gap-3 font-bold">
                                   <div className="w-10 h-10 bg-smash-purple/20 rounded-xl flex items-center justify-center text-smash-purple">
                                      <Music2 size={18} />
                                   </div>
                                   <div>
                                      <p>{song.title}</p>
                                      <p className="text-[10px] text-smash-gray uppercase tracking-widest">{song.genre}</p>
                                   </div>
                                </div>
                              </td>
                              <td className="p-6">
                                <p className="font-bold">{song.profiles?.stage_name || 'Unknown'}</p>
                                <p className="text-[10px] text-smash-gray">{song.profiles?.email}</p>
                              </td>
                              <td className="p-6">
                                <audio controls className="h-8 w-40 opacity-50 hover:opacity-100 transition-opacity">
                                  <source src={song.audio_url} type="audio/mpeg" />
                                </audio>
                              </td>
                              <td className="p-6 text-right flex items-center justify-end gap-2">
                                <button onClick={() => approveSong(song.id)} className="px-3 py-1.5 bg-smash-green/10 text-smash-green border border-smash-green/20 rounded-lg text-[8px] font-black uppercase hover:bg-smash-green hover:text-white transition-all">Approve</button>
                                <button onClick={() => rejectSong(song.id)} className="p-2 hover:bg-smash-red/20 text-smash-gray hover:text-smash-red rounded-lg transition-all">
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="p-20 text-center text-smash-gray font-black uppercase tracking-widest text-xs italic">Review Queue is Empty</div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'ads' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 rounded-[32px] border border-white/5 overflow-hidden">
                   <div className="p-6 border-b border-white/5 font-black uppercase text-[10px] tracking-widest text-smash-gray">Audio Ads Inventory</div>
                   <div className="overflow-x-auto">
                     <table className="w-full text-left text-sm">
                       <thead className="bg-white/5 text-smash-gray text-[10px] uppercase tracking-widest font-black">
                         <tr>
                           <th className="p-6">Campaign</th>
                           <th className="p-6">Budget</th>
                           <th className="p-6">Status</th>
                           <th className="p-6 text-right">Manage</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-white/5">
                         {ads.map(ad => (
                           <tr key={ad.id} className="hover:bg-white/5 transition-colors">
                             <td className="p-6 text-left">
                               <p className="font-bold">{ad.advertiser_name}</p>
                               <p className="text-[10px] text-smash-gray uppercase tracking-widest">{ad.title}</p>
                             </td>
                             <td className="p-6">
                                <p className="text-xs font-bold">{ad.plays_used.toLocaleString()} / {ad.plays_purchased.toLocaleString()}</p>
                                <div className="w-20 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                                   <div className="h-full bg-smash-orange" style={{ width: `${(ad.plays_used / ad.plays_purchased) * 100}%` }} />
                                </div>
                             </td>
                             <td className="p-6">
                                <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${ad.active ? 'bg-smash-green/10 text-smash-green border border-smash-green/20' : 'bg-smash-red/10 text-smash-red border border-smash-red/20'}`}>
                                   {ad.active ? 'Active' : 'Offline'}
                                </span>
                             </td>
                             <td className="p-6 text-right space-x-2">
                                <button onClick={() => toggleAdStatus(ad)} className={`p-2 rounded-lg transition-all ${ad.active ? 'bg-smash-red/10 text-smash-red group-hover:bg-smash-red' : 'bg-smash-green/10 text-smash-green'}`}>
                                   {ad.active ? <VolumeX size={16} /> : <Volume2 size={16} />}
                                </button>
                                <button onClick={() => deleteAd(ad.id)} className="p-2 hover:bg-smash-red/20 text-smash-gray hover:text-smash-red rounded-lg transition-all"><Trash2 size={16} /></button>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
