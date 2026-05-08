import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, ShieldCheck, ExternalLink } from 'lucide-react';
import { UserProfile } from '../../types';

interface SupportArtistModalProps {
  artist: UserProfile;
  onClose: () => void;
}

const SupportArtistModal: React.FC<SupportArtistModalProps> = ({ artist, onClose }) => {
  const donationUrl = `https://paychangu.com/donation/${artist.id}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-smash-black/90 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl h-[85vh] glass-morphism border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full border-2 border-smash-orange overflow-hidden">
               <img src={artist.avatar_url || "https://i.pravatar.cc/300"} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display italic uppercase tracking-tighter">Support {artist.stage_name || artist.full_name}</h2>
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-smash-green" />
                <p className="text-[10px] font-black text-smash-gray uppercase tracking-widest">Secure Payment via Paychangu</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-smash-gray hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-smash-black flex flex-col items-center justify-center p-12 text-center">
            <div className="max-w-md w-full">
               <div className="w-24 h-24 bg-smash-orange/10 text-smash-orange rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-smash-orange/20 animate-pulse">
                  <Heart size={48} fill="currentColor" />
               </div>
               
               <h3 className="text-4xl md:text-5xl font-black font-display italic uppercase mb-4 leading-none">FUEL THE <span className="text-smash-orange">DREAM</span></h3>
               <p className="text-smash-gray text-lg font-medium leading-relaxed mb-10">
                  Your support goes directly to <span className="text-white font-black">{artist.stage_name || artist.full_name}</span>. Artists on Smashify keep <span className="text-smash-green font-black">90%</span> of every donation.
               </p>

               <div className="space-y-4">
                  <a 
                    href={donationUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block w-full py-6 bg-white text-smash-black rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:bg-smash-orange hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                  >
                    Support via PayChangu <ExternalLink size={20} />
                  </a>
                  
                  <div className="flex items-center justify-center gap-6 pt-4">
                     <div className="flex flex-col items-center gap-1 opacity-50 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                        <div className="text-[10px] font-black text-smash-gray uppercase tracking-widest uppercase italic">Airtel Money</div>
                     </div>
                     <div className="flex flex-col items-center gap-1 opacity-50 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                        <div className="text-[10px] font-black text-smash-gray uppercase tracking-widest uppercase italic">TNM Mpamba</div>
                     </div>
                     <div className="flex flex-col items-center gap-1 opacity-50 grayscale hover:grayscale-0 transition-all cursor-crosshair">
                        <div className="text-[10px] font-black text-smash-gray uppercase tracking-widest uppercase italic">Visa/Mastercard</div>
                     </div>
                  </div>
               </div>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-smash-black text-center border-t border-white/5">
           <p className="text-[10px] text-smash-gray font-black uppercase tracking-[0.2em]">Thank you for supporting real music</p>
        </div>
      </motion.div>
    </div>
  );
};

export default SupportArtistModal;
