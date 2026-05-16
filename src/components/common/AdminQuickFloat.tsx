import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, CheckCircle2, Music2, Users, DollarSign, X, ChevronRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const AdminQuickFloat = () => {
    const { userProfile } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [stats, setStats] = useState({ applications: 0, songs: 0 });
    const navigate = useNavigate();

    const isAdmin = userProfile?.is_admin || userProfile?.role === 'admin';

    useEffect(() => {
        if (!isAdmin) return;

        const fetchCounts = async () => {
            const [
                { count: appCount },
                { count: songCount }
            ] = await Promise.all([
                supabase.from('artist_applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('songs').select('*', { count: 'exact', head: true }).eq('approved', false)
            ]);
            setStats({
                applications: appCount || 0,
                songs: songCount || 0
            });
        };

        fetchCounts();
        
        // Polling for updates every minute
        const interval = setInterval(fetchCounts, 60000);
        return () => clearInterval(interval);
    }, [isAdmin]);

    if (!isAdmin) return null;

    const totalAlerts = stats.applications + stats.songs;

    const items = [
        { id: 'apps', label: 'Artist Applicants', count: stats.applications, icon: Users, tab: 'applications' },
        { id: 'songs', label: 'Song Reviews', count: stats.songs, icon: Music2, tab: 'song-reviews' },
        { id: 'admin', label: 'Full Dashboard', icon: Activity, tab: 'overview' },
    ];

    return (
        <div className="fixed bottom-24 right-6 md:bottom-32 md:right-10 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
                        className="absolute bottom-16 right-0 w-[240px] bg-[#0c0c10]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                            <span className="text-[10px] font-black uppercase tracking-widest text-smash-purple">Quick Admin Access</span>
                            <button onClick={() => setIsOpen(false)} className="text-smash-gray hover:text-white transition-colors">
                                <X size={14} />
                            </button>
                        </div>
                        <div className="p-2 space-y-1">
                            {items.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        navigate(`/admin?tab=${item.tab}`);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-lg bg-smash-purple/10 flex items-center justify-center text-smash-purple">
                                        <item.icon size={16} />
                                    </div>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-[11px] font-bold text-white group-hover:text-smash-purple transition-colors truncate">{item.label}</p>
                                        {item.count !== undefined && (
                                            <p className="text-[9px] text-smash-gray font-black uppercase tracking-widest leading-none mt-1">
                                                {item.count} Pending
                                            </p>
                                        )}
                                    </div>
                                    <ChevronRight size={14} className="text-smash-gray group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-2xl active:scale-95 ${
                    isOpen ? 'bg-white text-black' : 'bg-smash-purple text-white shadow-smash-purple/20'
                }`}
            >
                {isOpen ? <X size={24} /> : <ShieldCheck size={28} />}
                
                {!isOpen && totalAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-smash-red text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-bg-page animate-pulse">
                        {totalAlerts}
                    </span>
                )}
            </button>
        </div>
    );
};

export default AdminQuickFloat;
