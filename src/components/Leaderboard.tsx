import { useState, useEffect } from 'react';
import { LeaderboardEntry, getLeaderboard } from '../utils/supabase';

export function Leaderboard({ game }: { game: string }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const data = await getLeaderboard(game);
        setEntries(data);
      } catch (err) {
        setError('Failed to load leaderboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, [game]);

  if (loading) return <div>Loading leaderboard...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="mt-4">
      <h2 className="text-xl mb-2">Global Leaderboard</h2>
      <div className="border border-green-500 p-2">
        {entries.map((entry, index) => (
          <div key={entry.id} className="flex justify-between py-1">
            <span>{index + 1}. {entry.player_name}</span>
            <span>{entry.score}</span>
          </div>
        ))}
        {entries.length === 0 && (
          <div className="text-center py-2">No scores yet!</div>
        )}
      </div>
    </div>
  );
} 