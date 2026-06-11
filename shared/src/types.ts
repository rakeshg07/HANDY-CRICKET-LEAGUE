export type HandNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type MatchFormat = 'TEST' | 'T10' | 'T20' | 'CUSTOM';

export type RoomStatus = 'waiting' | 'team-formation' | 'toss' | 'in-progress' | 'completed';

export type MatchPhase = 'lobby' | 'teams' | 'toss' | 'innings' | 'break' | 'result' | 'super-over';

export type TossChoice = 'heads' | 'tails';

export type InningsChoice = 'bat' | 'bowl';

export type BallResultType = 'runs' | 'out' | 'wide' | 'no-ball';

export type MatchResult = 'team-a' | 'team-b' | 'draw' | 'super-over';

/** Per-player role during an active match */
export type PlayerMatchState =
  | 'WAITING'
  | 'BATTING'
  | 'BOWLING'
  | 'SPECTATING'
  | 'OUT';

export type BallPhase = 'idle' | 'waiting-moves' | 'processing' | 'revealing';

export interface Player {
  id: string;
  socketId: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  teamId?: string;
  matchState?: PlayerMatchState;
  stats: PlayerMatchStats;
}

export interface PlayerMatchStats {
  runs: number;
  ballsFaced: number;
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
  strikeRate: number;
  economy: number;
}

export interface Team {
  id: string;
  name: string;
  captainId: string;
  playerIds: string[];
  battingOrder: string[];
  bowlingOrder: string[];
  color: string;
}

export interface CustomFormatSettings {
  overs: number;
  wickets: number;
  playersPerTeam: number;
  matchName: string;
}

export interface MatchSettings {
  format: MatchFormat;
  custom?: CustomFormatSettings;
  overs: number;
  maxWickets: number;
  playersPerTeam: number;
  matchName: string;
}

export interface Ball {
  id: string;
  inningsNumber: number;
  overNumber: number;
  ballNumber: number;
  bowlerId: string;
  batsmanId: string;
  bowlerChoice: HandNumber;
  batsmanChoice: HandNumber;
  result: BallResultType;
  runs: number;
  isWicket: boolean;
  timestamp: number;
  partnership: number;
}

export interface Innings {
  number: number;
  battingTeamId: string;
  bowlingTeamId: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  runRate: number;
  requiredRunRate?: number;
  target?: number;
  currentBatsmanId: string;
  currentBowlerId: string;
  strikerId: string;
  partnership: { runs: number; balls: number };
  isComplete: boolean;
  extras: number;
  dismissedBatsmanIds: string[];
}

export interface Scoreboard {
  inningsNumber: number;
  battingTeam: TeamScore;
  bowlingTeam: TeamScore;
  currentBatsman: PlayerScore | null;
  currentBowler: BowlerScore | null;
  partnership: { runs: number; balls: number };
  target?: number;
  requiredRunRate?: number;
  matchPhase: MatchPhase;
}

export interface TeamScore {
  teamId: string;
  teamName: string;
  runs: number;
  wickets: number;
  overs: number;
  balls: number;
  runRate: number;
}

export interface PlayerScore {
  playerId: string;
  playerName: string;
  runs: number;
  ballsFaced: number;
  strikeRate: number;
}

export interface BowlerScore {
  playerId: string;
  playerName: string;
  wickets: number;
  runsConceded: number;
  ballsBowled: number;
  economy: number;
}

export interface PlayerLiveState {
  playerId: string;
  playerName: string;
  state: PlayerMatchState;
}

export interface MatchLiveState {
  batsmanId: string;
  bowlerId: string;
  batsmanName: string;
  bowlerName: string;
  ballPhase: BallPhase;
  /** How many of the 2 required moves have been received (0-2). Never reveals who. */
  movesReceived: number;
  playerStates: PlayerLiveState[];
}

export interface MatchHistory {
  balls: Ball[];
  innings: Innings[];
  tossWinner?: string;
  tossChoice?: InningsChoice;
}

export interface Match {
  id: string;
  roomId: string;
  settings: MatchSettings;
  teams: [Team, Team];
  phase: MatchPhase;
  currentInnings: number;
  innings: Innings[];
  history: MatchHistory;
  scoreboard: Scoreboard;
  result?: MatchResult;
  winnerId?: string;
  tossWinnerId?: string;
  tossChoice?: InningsChoice;
  startedAt?: number;
  endedAt?: number;
  liveState?: MatchLiveState;
  pendingChoices: {
    batsman?: HandNumber;
    bowler?: HandNumber;
    batsmanSubmitted?: boolean;
    bowlerSubmitted?: boolean;
  };
}

export interface Room {
  id: string;
  code: string;
  hostId: string;
  maxPlayers: number;
  status: RoomStatus;
  players: Player[];
  teams: Team[];
  match?: Match;
  settings?: MatchSettings;
  tossCompleted?: boolean;
  createdAt: number;
}

export interface CreateRoomPayload {
  playerName: string;
  maxPlayers?: number;
  matchSettings?: Partial<MatchSettings>;
}

export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
}

export interface TeamFormationPayload {
  teamA: { name: string; playerIds: string[]; captainId: string; battingOrder?: string[]; bowlingOrder?: string[] };
  teamB: { name: string; playerIds: string[]; captainId: string; battingOrder?: string[]; bowlingOrder?: string[] };
}

export interface CoinTossPayload {
  choice: TossChoice;
}

export interface InningsDecisionPayload {
  choice: InningsChoice;
}

export interface SubmitMovePayload {
  number: HandNumber;
}

export interface BallResultEvent {
  ball: Ball;
  scoreboard: Scoreboard;
  liveState: MatchLiveState;
  isWicket: boolean;
  nextBatsmanId?: string;
  nextBowlerId?: string;
}

export interface MatchEndEvent {
  result: MatchResult;
  winnerId?: string;
  winnerName?: string;
  teamAScore: TeamScore;
  teamBScore: TeamScore;
  isDraw: boolean;
  superOver?: boolean;
}

export interface ReconnectPayload {
  roomCode: string;
  playerId: string;
}

export interface ServerToClientEvents {
  'room-created': (room: Room) => void;
  'room-joined': (room: Room) => void;
  'player-joined': (player: Player) => void;
  'player-left': (playerId: string) => void;
  'player-disconnected': (data: { playerId: string; playerName: string; graceSeconds: number }) => void;
  'player-reconnected': (data: { playerId: string; room: Room }) => void;
  'player-ready': (playerId: string, isReady: boolean) => void;
  'teams-updated': (teams: Team[]) => void;
  'match-started': (match: Match) => void;
  'toss-result': (data: { winnerId: string; winnerName: string; choice: TossChoice }) => void;
  'innings-decision': (data: { teamId: string; choice: InningsChoice }) => void;
  'innings-start': (data: { innings: Innings; scoreboard: Scoreboard; liveState: MatchLiveState }) => void;
  'ball-waiting': (data: MatchLiveState) => void;
  'move-accepted': (data: { role: 'batsman' | 'bowler' }) => void;
  'move-pending': (data: { movesReceived: number; totalRequired: 2 }) => void;
  'ball-result': (data: BallResultEvent) => void;
  'player-out': (data: { playerId: string; playerName: string; nextBatsmanId?: string; liveState: MatchLiveState }) => void;
  'next-batter': (data: { playerId: string; playerName: string; liveState: MatchLiveState }) => void;
  'next-bowler': (data: { playerId: string; playerName: string; liveState: MatchLiveState }) => void;
  'over-complete': (data: { overNumber: number; liveState: MatchLiveState }) => void;
  'innings-end': (data: { innings: Innings; scoreboard: Scoreboard }) => void;
  'innings-complete': (data: { innings: Innings; scoreboard: Scoreboard }) => void;
  'match-end': (data: MatchEndEvent) => void;
  'match-complete': (data: MatchEndEvent) => void;
  'match-state': (data: { room: Room; liveState?: MatchLiveState }) => void;
  'room-state': (room: Room) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'create-room': (payload: CreateRoomPayload) => void;
  'join-room': (payload: JoinRoomPayload) => void;
  'leave-room': () => void;
  'player-ready': (isReady: boolean) => void;
  'update-teams': (payload: TeamFormationPayload) => void;
  'assign-team': (payload: TeamFormationPayload) => void;
  'start-match': () => void;
  'coin-toss': (payload: CoinTossPayload) => void;
  'innings-decision': (payload: InningsDecisionPayload) => void;
  'submit-move': (payload: SubmitMovePayload) => void;
  'reconnect': (payload: ReconnectPayload) => void;
}
