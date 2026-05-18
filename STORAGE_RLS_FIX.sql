-- RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR TO FIX UPLOAD ERRORS AND PROFILE CRASHES

-- 0. Ensure Albums Table Exists
CREATE TABLE IF NOT EXISTS public.albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT,
    cover_url TEXT,
    release_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "public_album_select" ON public.albums;
CREATE POLICY "public_album_select" ON public.albums FOR SELECT USING (true);
DROP POLICY IF EXISTS "artist_album_insert" ON public.albums;
CREATE POLICY "artist_album_insert" ON public.albums FOR INSERT WITH CHECK (auth.uid() = artist_id);

-- 0.1 Add missing Verification columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS id_type TEXT,
ADD COLUMN IF NOT EXISTS nrc_number TEXT,
ADD COLUMN IF NOT EXISTS id_document_url TEXT,
ADD COLUMN IF NOT EXISTS selfie_url TEXT;

-- 1. Create buckets if they do not exist
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('avatars', 'avatars', true),
  ('banners', 'banners', true),
  ('artist-verifications', 'artist-verifications', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Avatars bucket policies
DROP POLICY IF EXISTS "Avatar uploads" ON storage.objects;
CREATE POLICY "Avatar uploads" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Avatar updates" ON storage.objects;
CREATE POLICY "Avatar updates" ON storage.objects FOR UPDATE 
USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Avatar reads" ON storage.objects;
CREATE POLICY "Avatar reads" ON storage.objects FOR SELECT 
USING (bucket_id = 'avatars');

-- 3. Banners bucket policies
DROP POLICY IF EXISTS "Banner uploads" ON storage.objects;
CREATE POLICY "Banner uploads" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Banner updates" ON storage.objects;
CREATE POLICY "Banner updates" ON storage.objects FOR UPDATE 
USING (bucket_id = 'banners' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Banner reads" ON storage.objects;
CREATE POLICY "Banner reads" ON storage.objects FOR SELECT 
USING (bucket_id = 'banners');

-- 4. Artist Verifications bucket (Private) 
DROP POLICY IF EXISTS "Verification uploads" ON storage.objects;
CREATE POLICY "Verification uploads" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'artist-verifications' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Verification updates" ON storage.objects;
CREATE POLICY "Verification updates" ON storage.objects FOR UPDATE 
USING (bucket_id = 'artist-verifications' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Verification reads" ON storage.objects;
CREATE POLICY "Verification reads" ON storage.objects FOR SELECT 
USING (bucket_id = 'artist-verifications' AND auth.role() = 'authenticated');
