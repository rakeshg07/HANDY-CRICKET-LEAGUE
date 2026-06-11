export interface PlayerProfile {
  name: string;
  avatar: string;
  country: string;
  matchesPlayed: number;
  wins: number;
  losses: number;
  totalRuns: number;
  highestScore: number;
  rank: string;
  recentMatches: { opponent: string; result: 'win' | 'loss' | 'draw'; score: string; date: string }[];
}

const STORAGE_KEY = 'hcl-player-profile';

export const DEFAULT_PROFILE: PlayerProfile = {
  name: 'Player',
  avatar: '🏏',
  country: 'India',
  matchesPlayed: 0,
  wins: 0,
  losses: 0,
  totalRuns: 0,
  highestScore: 0,
  rank: 'Rookie',
  recentMatches: [],
};

export function loadProfile(): PlayerProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: PlayerProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function getWinPercentage(profile: PlayerProfile): number {
  if (profile.matchesPlayed === 0) return 0;
  return Math.round((profile.wins / profile.matchesPlayed) * 100);
}

export function getRank(matchesPlayed: number, wins: number): string {
  const winRate = matchesPlayed > 0 ? wins / matchesPlayed : 0;
  if (matchesPlayed >= 50 && winRate >= 0.7) return 'Legend';
  if (matchesPlayed >= 30 && winRate >= 0.6) return 'Pro';
  if (matchesPlayed >= 15 && winRate >= 0.5) return 'All-Rounder';
  if (matchesPlayed >= 5) return 'Rising Star';
  return 'Rookie';
}

export const AVATAR_OPTIONS = ['🏏', '🏆', '⭐', '🔥', '💪', '🎯', '👑', '🦁', '🐯', '🦅'];

export const COUNTRY_OPTIONS = [
  'India', 'Australia', 'England', 'Pakistan', 'South Africa',
  'New Zealand', 'Sri Lanka', 'Bangladesh', 'West Indies', 'Other',
];
