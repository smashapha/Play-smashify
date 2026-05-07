import React from 'react';
import { motion } from 'motion/react';
import { Shield, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8 md:p-12 pb-32 max-w-4xl mx-auto"
    >
        <div className="flex items-center gap-3 text-sm font-bold text-smash-gray uppercase tracking-widest mb-8">
           <Link to="/" className="hover:text-white transition-colors">Home</Link>
           <ChevronRight size={14} />
           <span className="text-smash-orange">Terms of Service</span>
        </div>

      <div className="flex items-center gap-4 mb-4">
        <Shield size={32} className="text-smash-orange" />
        <h1 className="text-4xl md:text-5xl font-black font-display uppercase italic tracking-tighter">Terms of Service</h1>
      </div>
      <p className="text-smash-gray font-medium mb-12">Effective: 1 January 2026 | Last Updated: 1 January 2026</p>

      <div className="space-y-12 text-zinc-300 font-medium leading-relaxed bg-zinc-900/30 p-8 md:p-12 rounded-3xl border border-white/5">
        <section>
          <h2 className="text-2xl font-black font-display uppercase tracking-tighter text-white mb-4">1. ACCEPTANCE</h2>
          <p>By accessing or using Smashify ("Platform"), you agree to these Terms of Service ("Terms"). If you do not agree, please do not use the Platform.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black font-display uppercase tracking-tighter text-white mb-4">2. ELIGIBILITY</h2>
          <p>You must be at least 13 years old to use Smashify as a listener. Artist accounts require users to be at least 18 years old and possess a valid national ID, passport, or driver's licence. Smashify reserves the right to request identity verification documents at any time.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black font-display uppercase tracking-tighter text-white mb-4">3. PLATFORM FEES</h2>
          <p>Smashify charges a 10% platform fee on all song purchases and fan donations. Artists receive 90% of the transaction amount. Withdrawal fees are 3% (PayChangu processing fee). There are no hidden charges. All prices are in Malawian Kwacha (MWK).</p>
        </section>

        <section>
          <h2 className="text-2xl font-black font-display uppercase tracking-tighter text-white mb-4">4. ARTIST CONTENT POLICY</h2>
          <p className="mb-4">By uploading content, you confirm that:</p>
          <ul className="list-disc pl-8 space-y-2 text-smash-gray">
            <li>(a) You own or have obtained all necessary rights to the content.</li>
            <li>(b) Your content does not infringe any third-party copyright, trademark, or privacy rights.</li>
            <li>(c) Your content does not contain explicit or offensive material without appropriate age-rating.</li>
          </ul>
          <p className="mt-4">Smashify reserves the right to remove content that violates these policies without prior notice.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black font-display uppercase tracking-tighter text-white mb-4">5. PAYMENTS & WITHDRAWALS</h2>
          <p>Payments are processed by PayChangu. Smashify does not store payment card details. Withdrawals are sent to the mobile money number registered on your artist account. Minimum withdrawal amount: MK 5,000. Withdrawal fees: 3% (deducted from the withdrawal amount).</p>
        </section>

        <section>
          <h2 className="text-2xl font-black font-display uppercase tracking-tighter text-white mb-4">6. SUBSCRIPTIONS</h2>
          <p>Listener Premium and Family subscriptions are billed monthly. Artist subscriptions are billed annually. All subscriptions renew automatically. You may cancel at any time; your plan remains active until the end of the billing period. No refunds are issued for partial periods.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black font-display uppercase tracking-tighter text-white mb-4">7. INTELLECTUAL PROPERTY</h2>
          <p>Smashify and its logo, design, and platform technology are the intellectual property of Smashify Ltd., registered in Malawi. Artists retain full copyright ownership of their uploaded music.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black font-display uppercase tracking-tighter text-white mb-4">8. LIMITATION OF LIABILITY</h2>
          <p>Smashify is provided "as is". We are not liable for interruptions, data loss, or payment failures caused by third-party services including PayChangu, Airtel, or TNM.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black font-display uppercase tracking-tighter text-white mb-4">9. GOVERNING LAW</h2>
          <p>These Terms are governed by the laws of the Republic of Malawi. Disputes shall be resolved in Malawian courts.</p>
        </section>

        <section>
          <h2 className="text-2xl font-black font-display uppercase tracking-tighter text-white mb-4">10. CONTACT</h2>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-smash-gray mt-4">
            <p><strong>Email:</strong> legal@smashify.mw</p>
            <p className="mt-2"><strong>Address:</strong> Smashify Ltd., Livingstone Towers, Blantyre, Malawi</p>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

export default Terms;
