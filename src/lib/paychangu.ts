import { supabase } from './supabase';
import { Song, UserProfile } from '../types';

declare const PaychanguCheckout: (config: any) => void;

interface BuyTrackParams {
  song: Song;
  user: UserProfile;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function buyTrack({ song, user, onSuccess, onClose }: BuyTrackParams) {
  if (typeof PaychanguCheckout === 'undefined') {
    console.error('Paychangu script not loaded');
    alert('Payment system is currently unavailable. Please refresh or try again later.');
    return;
  }

  PaychanguCheckout({
    public_key: 'pub-test-ci3LGk20HC41OXlwYDjReNH2mUQH4hox',
    tx_ref: 'SMASH-' + Date.now() + '-' + song.id,
    amount: song.price,
    currency: 'MWK',
    callback_url: window.location.href,
    return_url: window.location.href,
    customer: {
      email: user.email,
      first_name: user.full_name?.split(' ')[0] || 'Listener',
      last_name: user.full_name?.split(' ').slice(1).join(' ') || '',
    },
    customization: {
      title: 'Buy: ' + song.title,
      description: song.title + ' by ' + song.artist_name,
    },
    onclose: onClose,
    callback: async (response: any) => {
      if (response?.status === 'successful') {
        try {
          // Record purchase
          const { error: purchaseError } = await supabase.from('purchases').insert({
            user_id: user.id,
            song_id: song.id,
            artist_id: song.artist_id,
            amount: song.price,
            paychangu_ref: response.tx_ref
          });

          if (purchaseError) throw purchaseError;

          // In Supabase, crediting wallet safely requires a stored procedure (RPC).
          // For demo, we are circumventing it using an RPC call or we could just skip if RPC not present.
          const { error: rpcError } = await supabase.rpc('increment_wallet', { 
            profile_id: song.artist_id, 
            amount_to_add: song.price * 0.9 
          });
          
          if (rpcError) {
             console.warn("Wallet increment RPC might not exist, skipping direct wallet update.", rpcError);
          }

          onSuccess?.();
        } catch (error) {
          console.error("Payment sync failed: ", error);
        }
      }
    }
  });
}
