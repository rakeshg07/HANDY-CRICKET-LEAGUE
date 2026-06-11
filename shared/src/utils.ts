import { HandNumber, Innings, MatchSettings, MatchFormat, PlayerMatchStats } from './types';
import { MATCH_FORMAT_PRESETS } from './constants';

export function createDefaultStats(): PlayerMatchStats {
  return {
    runs: 0,
    ballsFaced: 0,
    wickets: 0,
    ballsBowled: 0,
    runsConceded: 0,
    strikeRate: 0,
    economy: 0,
  };
}

export function resolveMatchSettings(
  format: MatchFormat,
  custom?: Partial<MatchSettings>
): MatchSettings {
  if (format === 'CUSTOM' && custom) {
    return {
      format: 'CUSTOM',
      overs: custom.overs ?? 20,
      maxWickets: custom.maxWickets ?? 10,
      playersPerTeam: custom.playersPerTeam ?? 11,
      matchName: custom.matchName ?? 'Custom Match',
      custom: {
        overs: custom.overs ?? 20,
        wickets: custom.maxWickets ?? 10,
        playersPerTeam: custom.playersPerTeam ?? 11,
        matchName: custom.matchName ?? 'Custom Match',
      },
    };
  }

  const preset = MATCH_FORMAT_PRESETS[format as keyof typeof MATCH_FORMAT_PRESETS];
  return {
    format,
    overs: preset.overs,
    maxWickets: custom?.maxWickets ?? preset.wickets,
    playersPerTeam: custom?.playersPerTeam ?? preset.playersPerTeam,
    matchName: custom?.matchName ?? preset.name,
  };
}

export function calculateRunRate(runs: number, overs: number, balls: number): number {
  const totalBalls = overs * 6 + balls;
  if (totalBalls === 0) return 0;
  return Math.round((runs / totalBalls) * 6 * 100) / 100;
}

export function calculateRequiredRunRate(
  target: number,
  currentRuns: number,
  oversRemaining: number,
  ballsRemaining: number
): number {
  const runsNeeded = target - currentRuns + 1;
  const ballsLeft = oversRemaining * 6 + ballsRemaining;
  if (ballsLeft <= 0 || runsNeeded <= 0) return 0;
  return Math.round((runsNeeded / ballsLeft) * 6 * 100) / 100;
}

export function calculateStrikeRate(runs: number, ballsFaced: number): number {
  if (ballsFaced === 0) return 0;
  return Math.round((runs / ballsFaced) * 100 * 100) / 100;
}

export function calculateEconomy(runsConceded: number, ballsBowled: number): number {
  if (ballsBowled === 0) return 0;
  return Math.round((runsConceded / ballsBowled) * 6 * 100) / 100;
}

export function formatOvers(overs: number, balls: number): string {
  return `${overs}.${balls}`;
}

export function isValidHandNumber(n: number): n is HandNumber {
  return Number.isInteger(n) && n >= 0 && n <= 6;
}

export function processBall(
  bowlerChoice: HandNumber,
  batsmanChoice: HandNumber
): { result: 'out' | 'runs'; runs: number; isWicket: boolean } {
  if (bowlerChoice === batsmanChoice) {
    return { result: 'out', runs: 0, isWicket: true };
  }
  return { result: 'runs', runs: batsmanChoice, isWicket: false };
}

export function getOversRemaining(settings: MatchSettings, innings: Innings): { overs: number; balls: number } {
  const totalBalls = settings.overs * 6;
  const bowledBalls = innings.overs * 6 + innings.balls;
  const remaining = Math.max(0, totalBalls - bowledBalls);
  return { overs: Math.floor(remaining / 6), balls: remaining % 6 };
}

export function generateRoomCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
