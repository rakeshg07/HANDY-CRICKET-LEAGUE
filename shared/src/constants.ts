import { HandNumber } from './types';

export const HAND_EMOJIS: Record<HandNumber, string> = {
  0: '✊',
  1: '☝️',
  2: '✌️',
  3: '🤟',
  4: '🖖',
  5: '🖐️',
  6: '🤙',
};

export const HAND_NUMBERS: HandNumber[] = [0, 1, 2, 3, 4, 5, 6];

export const MATCH_FORMAT_PRESETS = {
  TEST: { overs: 9999, wickets: 10, playersPerTeam: 11, name: 'Test Match' },
  T10: { overs: 10, wickets: 10, playersPerTeam: 11, name: 'T10' },
  T20: { overs: 20, wickets: 10, playersPerTeam: 11, name: 'T20' },
} as const;

export const DEFAULT_MAX_PLAYERS = 12;
export const ROOM_CODE_LENGTH = 6;
export const BALL_REVEAL_DELAY_MS = 2000;
export const TOSS_ANIMATION_MS = 3000;
export const RECONNECT_GRACE_MS = 60000;
