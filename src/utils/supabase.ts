import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fbpsgpcqoxeflimwbafc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicHNncGNxb3hlZmxpbXdiYWZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyMDQxMjYsImV4cCI6MjA1MTc4MDEyNn0.p-ABsq2e1QvF9Fom3qlbYaUe_CkDOH1PnPAof-09ask';

export const supabase = createClient(supabaseUrl, supabaseKey);

export type LeaderboardEntry = {
  id: number;
  player_name: string;
  game: string;
  score: number;
  created_at: string;
};

export async function submitScore(game: string, score: number, playerName: string) {
  const { data, error } = await supabase
    .from('leaderboard')
    .insert([
      { game, score, player_name: playerName }
    ])
    .select();

  if (error) throw error;
  return data;
}

export async function getLeaderboard(game: string) {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('game', game)
    .order('score', { ascending: false })
    .limit(10);

  if (error) throw error;
  return data as LeaderboardEntry[];
} 