import { supabase } from './supabase';
import { Song, UserProfile } from '../types';

declare const PaychanguCheckout: (config: any) => void;

interface BuyTrackParams {
  song: Song;
  user: UserProfile;
  onSuccess?: () => void;
  onClose?: () => void;
}

export function supportArtist({ artist, user, amount, onSuccess, onClose }: { artist: UserProfile, user: UserProfile, amount: number, onSuccess?: () => void, onClose?: () => void }) {
  if (typeof PaychanguCheckout === 'undefined') {
    console.error('Paychangu script not loaded');
    return;
  }

  PaychanguCheckout({
    public_key: 'pub-test-ci3LGk20HC41OXlwYDjReNH2mUQH4hox',
    tx_ref: 'TIP-' + Date.now() + '-' + artist.id,
    amount: amount,
    currency: 'MWK',
    callback_url: window.location.href,
    return_url: window.location.href,
    customer: {
      email: user.email,
      name: user.full_name || 'Fan',
    },
    customization: {
      title: 'Support ' + artist.stage_name,
      description: 'Support for ' + artist.stage_name,
    },
    onclose: onClose,
    callback: async (response: any) => {
      if (response?.status === 'successful') {
        try {
          await supabase.from('transactions').insert({
            artist_id: artist.id,
            fan_id: user.id,
            type: 'donation',
            amount: amount,
            platform_fee: amount * 0.1,
            status: 'completed',
            paychangu_ref: response.tx_ref,
            description: `Donation to ${artist.stage_name}`
          });

          const { error: rpcError } = await supabase.rpc('increment_wallet_balance', { 
            user_id: artist.id, 
            amount_to_add: amount * 0.9 
          });
          
          if (rpcError) {
             const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', artist.id).single();
             await supabase.from('profiles').update({
               wallet_balance: (profile?.wallet_balance || 0) + (amount * 0.9)
             }).eq('id', artist.id);
          }
          onSuccess?.();
        } catch (error) {
          console.error("Donation sync failed: ", error);
        }
      }
    }
  });
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

          // Record as transaction
          await supabase.from('transactions').insert({
            artist_id: song.artist_id,
            fan_id: user.id,
            type: 'sale',
            amount: song.price,
            platform_fee: song.price * 0.1,
            status: 'completed',
            paychangu_ref: response.tx_ref,
            description: `Sale of "${song.title}"`
          });

          // Update artist balance (manual fallback if RPC fails)
          const { error: rpcError } = await supabase.rpc('increment_wallet_balance', { 
            user_id: song.artist_id, 
            amount_to_add: song.price * 0.9 
          });
          
          if (rpcError) {
             const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', song.artist_id).single();
             await supabase.from('profiles').update({
               wallet_balance: (profile?.wallet_balance || 0) + (song.price * 0.9)
             }).eq('id', song.artist_id);
          }

          onSuccess?.();
        } catch (error) {
          console.error("Payment sync failed: ", error);
        }
      }
    }
  });
}
