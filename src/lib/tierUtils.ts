export type ArtistTier = 'Free' | 'RisingStar' | 'Standard' | 'Elite' | 'free' | 'rising_star' | 'standard' | 'elite';
export type ListenerTier = 'Free' | 'Premium' | 'Family' | 'free' | 'premium' | 'family';

export const getListenerTier = (user: any): ListenerTier => {
  if (!user) return 'Free';
  return user.subscription_tier || 'Free';
};

export const getListenerLimits = (user: any) => {
  const tier = (getListenerTier(user) || 'free').toLowerCase();
  switch (tier) {
    case 'premium':
    case 'family':
      return { hdAudio: true, hasAds: false, canDownload: true, maxPlaylists: Infinity, canAccessSnippets: true };
    case 'free':
    default:
      return { hdAudio: false, hasAds: true, canDownload: false, maxPlaylists: 3, canAccessSnippets: false };
  }
};

export const getArtistTier = (artist: any): ArtistTier => {
  if (!artist) return 'free';
  return artist.subscription_tier || artist.artist_tier || 'free';
};

export const getTierLimits = (artist: any) => {
  const tier = (getArtistTier(artist) || 'free').toLowerCase();
  switch (tier) {
    case 'elite':
      return { maxUploads: Infinity, canWithdraw: true, platformFee: 0.05, analytics: 'full', hasFullAnalytics: true, canCreateAlbums: true, songLimit: Infinity, monthlyLimit: Infinity, canPostSnippets: true, canSellSongs: true };
    case 'standard':
      return { maxUploads: Infinity, canWithdraw: true, platformFee: 0.07, analytics: 'full', hasFullAnalytics: true, canCreateAlbums: true, songLimit: Infinity, monthlyLimit: Infinity, canPostSnippets: true, canSellSongs: true };
    case 'risingstar':
    case 'rising_star':
      return { maxUploads: 30, canWithdraw: true, platformFee: 0.10, analytics: 'basic', hasFullAnalytics: false, canCreateAlbums: true, songLimit: 30, monthlyLimit: 30, canPostSnippets: true, canSellSongs: true };
    case 'free':
    default:
      return { maxUploads: 5, canWithdraw: false, platformFee: 0.15, analytics: 'basic', hasFullAnalytics: false, canCreateAlbums: false, songLimit: 5, monthlyLimit: 5, canPostSnippets: false, canSellSongs: false };
  }
};

export const getSongsUploadedThisMonth = async (userProfile: any, supabaseClient: any) => {
  // Logic to query supabase for songs uploaded
  // This is a stub for synchronous operations; real check done in backend or skipped for MVP
  // The UI doesn't strictly depend on this to compile, we just need it exported if imported
  return 0;
};

export const canUploadTrack = async (artist: any, supabaseClient: any): Promise<boolean> => {
  if (!artist || !artist.id) return false;
  const tier: ArtistTier = artist.artist_tier || artist.subscription_tier || 'Free';
  const limits = getTierLimits(artist);

  const { count, error } = await supabaseClient
    .from('songs')
    .select('*', { count: 'exact', head: true })
    .eq('artist_id', artist.id);

  if (error) {
    console.error("Error checking upload limits:", error);
    return false;
  }

  return (count || 0) < limits.maxUploads;
};

export const canWithdrawalFunds = (artist: any): boolean => {
  if (!artist) return false;
  const limits = getTierLimits(artist);
  return limits.canWithdraw;
};

export const canReceiveFanSubscriptions = (artist: any): boolean => {
  if (!artist) return false;
  const tier = (getArtistTier(artist) || 'free').toLowerCase();
  return tier !== 'free';
};

export const canAccessAdvancedAnalytics = (artist: any): boolean => {
  if (!artist) return false;
  const tier = (getArtistTier(artist) || 'free').toLowerCase();
  return tier === 'standard' || tier === 'elite';
};

export const canSetExclusiveContent = (artist: any): boolean => {
  if (!artist) return false;
  const tier = (getArtistTier(artist) || 'free').toLowerCase();
  return tier !== 'free';
};

export const getWithdrawalLimit = (artist: any): number => {
  if (!artist) return 50000;
  const tier = (getArtistTier(artist) || 'free').toLowerCase();
  switch (tier) {
    case 'free': return 50000;
    case 'risingstar':
    case 'rising_star': return 200000;
    case 'standard': return 500000;
    case 'elite': return Infinity;
    default: return 50000;
  }
};

export const getPlatformFee = (artist: any, type: 'tip' | 'sale' | 'subscription'): number => {
  const tier = (getArtistTier(artist) || 'free').toLowerCase();
  
  if (type === 'tip' || type === 'sale') {
    switch (tier) {
      case 'free': return 0.15;
      case 'risingstar':
      case 'rising_star': return 0.10;
      case 'standard': return 0.07;
      case 'elite': return 0.05;
      default: return 0.15;
    }
  } else if (type === 'subscription') {
    switch (tier) {
      case 'free': return 0.20;
      case 'risingstar':
      case 'rising_star': return 0.15;
      case 'standard': return 0.10;
      case 'elite': return 0.08;
      default: return 0.20;
    }
  }
  return 0.15;
};

export const isFeatureAvailable = (feature: string, tier: string | undefined): boolean => {
  const currentTier = (tier || 'free').toLowerCase();
  
  const featureRequirements: Record<string, string[]> = {
    'advancedAnalytics': ['standard', 'elite'],
    'exclusiveContent': ['risingstar', 'rising_star', 'standard', 'elite'],
    'fanSubscriptions': ['risingstar', 'rising_star', 'standard', 'elite'],
    'verifiedBadge': ['standard', 'elite'],
    'customUrl': ['standard', 'elite'],
    'fanMessaging': ['risingstar', 'rising_star', 'standard', 'elite'],
  };
  
  const allowedTiers = featureRequirements[feature];
  if (!allowedTiers) return true;
  
  return allowedTiers.includes(currentTier);
};

