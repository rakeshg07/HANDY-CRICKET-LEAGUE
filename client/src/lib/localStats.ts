export interface LocalStats {
  matchesPlayed: number;
  wins: number;
  losses: number;
  runsScored: number;
  highestScore: number;
  ballsFaced: number;
}

export function getLocalStats(): LocalStats {
  if (typeof window === 'undefined') {
    return {
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      runsScored: 0,
      highestScore: 0,
      ballsFaced: 0,
    };
  }
  const data = localStorage.getItem('hcl_local_stats');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to parse local stats', e);
    }
  }
  return {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    runsScored: 0,
    highestScore: 0,
    ballsFaced: 0,
  };
}

export function updateLocalStats(result: { won: boolean; runs: number; balls: number }) {
  if (typeof window === 'undefined') return;
  
  const stats = getLocalStats();
  stats.matchesPlayed++;
  if (result.won) stats.wins++;
  else stats.losses++;
  
  stats.runsScored += result.runs;
  stats.ballsFaced += result.balls;
  if (result.runs > stats.highestScore) {
    stats.highestScore = result.runs;
  }
  
  localStorage.setItem('hcl_local_stats', JSON.stringify(stats));
}

export function getAverage(stats: LocalStats): string {
  if (stats.matchesPlayed === 0) return '0.00';
  return (stats.runsScored / stats.matchesPlayed).toFixed(2);
}

export function getStrikeRate(stats: LocalStats): string {
  if (stats.ballsFaced === 0) return '0.00';
  return ((stats.runsScored / stats.ballsFaced) * 100).toFixed(2);
}
