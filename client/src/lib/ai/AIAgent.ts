import { HandNumber, MatchLiveState, Innings } from '@hcl/shared';

export type AIDifficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'LEGEND';

export interface AIProfile {
  id: string;
  name: string;
  avatar: string;
  difficulty: AIDifficulty;
}

export const AI_PROFILES: AIProfile[] = [
  { id: 'ai-easy', name: 'CricketBot', avatar: '🤖', difficulty: 'EASY' },
  { id: 'ai-med', name: 'HandMaster', avatar: '🧙‍♂️', difficulty: 'MEDIUM' },
  { id: 'ai-hard', name: 'ChampionBot', avatar: '🦸‍♂️', difficulty: 'HARD' },
  { id: 'ai-legend', name: 'LegendX', avatar: '👑', difficulty: 'LEGEND' },
];

export class AIAgent {
  private difficulty: AIDifficulty;
  private userMoveHistory: HandNumber[] = [];
  
  constructor(difficulty: AIDifficulty) {
    this.difficulty = difficulty;
  }

  public recordUserMove(move: HandNumber) {
    this.userMoveHistory.push(move);
  }

  public getMove(
    role: 'batsman' | 'bowler',
    currentInnings: Innings,
    liveState: MatchLiveState
  ): HandNumber {
    switch (this.difficulty) {
      case 'EASY':
        return this.getEasyMove();
      case 'MEDIUM':
        return this.getMediumMove();
      case 'HARD':
        return this.getHardMove();
      case 'LEGEND':
        return this.getLegendMove(role, currentInnings);
      default:
        return this.getEasyMove();
    }
  }

  // EASY: Pure random between 1 and 6 (Hand cricket usually plays 1-6, sometimes 0)
  // Let's stick to 1-6 for simplicity, occasionally 0 if it's a defensive/dot ball move.
  private getEasyMove(): HandNumber {
    return Math.floor(Math.random() * 6) + 1 as HandNumber;
  }

  // MEDIUM: Basic pattern detection. Occasionally counters the user's last move.
  private getMediumMove(): HandNumber {
    if (this.userMoveHistory.length >= 2 && Math.random() < 0.3) {
      // 30% chance to predict user will repeat their last move and counter it (by picking it to get them out, or avoiding it)
      return this.userMoveHistory[this.userMoveHistory.length - 1];
    }
    return this.getEasyMove();
  }

  // HARD: Frequency analysis. Finds the user's most used move and tries to get them out.
  private getHardMove(): HandNumber {
    if (this.userMoveHistory.length < 6) return this.getMediumMove();

    // Frequency map
    const freqs: Record<number, number> = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
    for (const m of this.userMoveHistory) freqs[m]++;

    let mostFrequent = 1;
    let maxFreq = -1;
    for (let i = 1; i <= 6; i++) {
      if (freqs[i] > maxFreq) {
        maxFreq = freqs[i];
        mostFrequent = i;
      }
    }

    // 50% chance to pick the user's most frequent move (to get them out)
    if (Math.random() < 0.5) {
      return mostFrequent as HandNumber;
    }

    return this.getEasyMove();
  }

  // LEGEND: Advanced context awareness (Target, RRR, Balls left)
  private getLegendMove(role: 'batsman' | 'bowler', innings: Innings): HandNumber {
    // Start with Hard's frequency prediction as a baseline counter
    let baseMove = this.getHardMove();

    // Adjust based on context
    if (role === 'batsman') {
      if (innings.target && innings.requiredRunRate) {
        if (innings.requiredRunRate > 12) {
          // High pressure: must hit big (4, 5, 6)
          const bigShots = [4, 5, 6];
          return bigShots[Math.floor(Math.random() * bigShots.length)] as HandNumber;
        } else if (innings.requiredRunRate < 6) {
          // Low pressure: defend, play safe singles (1, 2)
          const safeShots = [1, 2, 3];
          return safeShots[Math.floor(Math.random() * safeShots.length)] as HandNumber;
        }
      }
    } else if (role === 'bowler') {
      if (innings.target && innings.requiredRunRate) {
        if (innings.requiredRunRate > 12) {
          // Batter is under pressure, likely to hit big. Try to match 4, 5, or 6 to get them out!
          if (Math.random() < 0.6) {
            const bigShots = [4, 5, 6];
            return bigShots[Math.floor(Math.random() * bigShots.length)] as HandNumber;
          }
        }
      }
    }

    return baseMove;
  }
}
