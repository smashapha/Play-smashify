import { supabase } from "../lib/supabase";
import { Song } from "../types";

export async function getAiRecommendations(userLikes: string[], availableSongs: Song[]): Promise<Song[]> {
  if (availableSongs.length === 0) return [];
  // Fallback: random songs
  return availableSongs.sort(() => 0.5 - Math.random()).slice(0, 5);
}

export async function getRadioNextSong(currentSong: Song, availableSongs: Song[]): Promise<Song | null> {
  const otherSongs = availableSongs.filter(s => s.id !== currentSong.id);
  if (otherSongs.length === 0) return null;
  // Fallback: next random song
  return otherSongs.sort(() => 0.5 - Math.random())[0];
}
