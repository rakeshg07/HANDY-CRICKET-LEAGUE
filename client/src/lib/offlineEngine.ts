import {
  HandNumber,
  Innings,
  MatchSettings,
  Ball,
  Scoreboard,
  BallResultEvent,
  MatchEndEvent,
  TeamScore,
} from '@hcl/shared';
import {
  processBall,
  calculateRunRate,
  calculateRequiredRunRate,
  generateId,
  resolveMatchSettings,
  MatchFormat,
} from '@hcl/shared';

export interface OfflinePlayer {
  id: string;
  name: string;
  runs: number;
  ballsFaced: number;
  wickets: number;
  ballsBowled: number;
  runsConceded: number;
}

export interface OfflineMatchState {
  settings: MatchSettings;
  teamA: { id: string; name: string; players: OfflinePlayer[] };
  teamB: { id: string; name: string; players: OfflinePlayer[] };
  innings: Innings[];
  currentInnings: number;
  balls: Ball[];
  phase: 'innings' | 'break' | 'result';
  battingTeamId: string;
  bowlingTeamId: string;
  batsmanIndex: number;
  bowlerIndex: number;
  result?: MatchEndEvent;
}

function createPlayers(name: string, count: number): OfflinePlayer[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${name}-p${i}`,
    name: `${name} Player ${i + 1}`,
    runs: 0,
    ballsFaced: 0,
    wickets: 0,
    ballsBowled: 0,
    runsConceded: 0,
  }));
}

export function createOfflineMatch(
  format: MatchFormat = 'T10',
  teamSize = 2,
  overs?: number,
  matchName = 'Test Match'
): OfflineMatchState {
  const settings = resolveMatchSettings(format, {
    format,
    overs: overs ?? (format === 'T10' ? 10 : 20),
    maxWickets: teamSize - 1,
    playersPerTeam: teamSize,
    matchName,
  });

  const teamA = { id: 'team-a', name: 'Team Alpha', players: createPlayers('Alpha', teamSize) };
  const teamB = { id: 'team-b', name: 'Team Beta', players: createPlayers('Beta', teamSize) };

  const innings = createInnings(1, teamA.id, teamB.id);

  return {
    settings,
    teamA,
    teamB,
    innings: [innings],
    currentInnings: 1,
    balls: [],
    phase: 'innings',
    battingTeamId: teamA.id,
    bowlingTeamId: teamB.id,
    batsmanIndex: 0,
    bowlerIndex: 0,
  };
}

function createInnings(number: number, battingTeamId: string, bowlingTeamId: string, target?: number): Innings {
  return {
    number,
    battingTeamId,
    bowlingTeamId,
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    runRate: 0,
    target,
    currentBatsmanId: '',
    currentBowlerId: '',
    strikerId: '',
    partnership: { runs: 0, balls: 0 },
    isComplete: false,
    extras: 0,
    dismissedBatsmanIds: [],
  };
}

function getTeam(state: OfflineMatchState, teamId: string) {
  return teamId === state.teamA.id ? state.teamA : state.teamB;
}

function getBattingPlayers(state: OfflineMatchState) {
  return getTeam(state, state.battingTeamId).players;
}

function getBowlingPlayers(state: OfflineMatchState) {
  return getTeam(state, state.bowlingTeamId).players;
}

export function buildOfflineScoreboard(state: OfflineMatchState): Scoreboard {
  const innings = state.innings[state.currentInnings - 1];
  const battingTeam = getTeam(state, innings.battingTeamId);
  const bowlingTeam = getTeam(state, innings.bowlingTeamId);
  const batsman = getBattingPlayers(state)[state.batsmanIndex];
  const bowler = getBowlingPlayers(state)[state.bowlerIndex];

  return {
    inningsNumber: innings.number,
    battingTeam: {
      teamId: battingTeam.id,
      teamName: battingTeam.name,
      runs: innings.runs,
      wickets: innings.wickets,
      overs: innings.overs,
      balls: innings.balls,
      runRate: innings.runRate,
    },
    bowlingTeam: {
      teamId: bowlingTeam.id,
      teamName: bowlingTeam.name,
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      runRate: 0,
    },
    currentBatsman: batsman
      ? {
          playerId: batsman.id,
          playerName: batsman.name,
          runs: batsman.runs,
          ballsFaced: batsman.ballsFaced,
          strikeRate: batsman.ballsFaced > 0 ? Math.round((batsman.runs / batsman.ballsFaced) * 10000) / 100 : 0,
        }
      : null,
    currentBowler: bowler
      ? {
          playerId: bowler.id,
          playerName: bowler.name,
          wickets: bowler.wickets,
          runsConceded: bowler.runsConceded,
          ballsBowled: bowler.ballsBowled,
          economy: bowler.ballsBowled > 0 ? Math.round((bowler.runsConceded / bowler.ballsBowled) * 600) / 100 : 0,
        }
      : null,
    partnership: { ...innings.partnership },
    target: innings.target,
    requiredRunRate: innings.requiredRunRate,
    matchPhase: state.phase === 'result' ? 'result' : 'innings',
  };
}

function checkInningsComplete(state: OfflineMatchState, innings: Innings): boolean {
  const battingTeam = getTeam(state, innings.battingTeamId);
  const maxWickets = Math.min(state.settings.maxWickets, battingTeam.players.length - 1);
  const totalBalls = state.settings.overs * 6;
  const bowledBalls = innings.overs * 6 + innings.balls;

  if (innings.wickets >= maxWickets) return true;
  if (bowledBalls >= totalBalls) return true;
  if (innings.target && innings.runs >= innings.target) return true;
  if (state.batsmanIndex >= battingTeam.players.length) return true;
  return false;
}

export function simulateBall(
  state: OfflineMatchState,
  bowlerChoice: HandNumber,
  batsmanChoice: HandNumber
): { state: OfflineMatchState; result: BallResultEvent; inningsEnded: boolean; matchEnded: boolean } {
  const innings = { ...state.innings[state.currentInnings - 1] };
  const battingPlayers = getBattingPlayers(state);
  const bowlingPlayers = getBowlingPlayers(state);
  const batsman = battingPlayers[state.batsmanIndex];
  const bowler = bowlingPlayers[state.bowlerIndex];

  const outcome = processBall(bowlerChoice, batsmanChoice);

  const ball: Ball = {
    id: generateId(),
    inningsNumber: innings.number,
    overNumber: innings.overs,
    ballNumber: innings.balls + 1,
    bowlerId: bowler.id,
    batsmanId: batsman.id,
    bowlerChoice,
    batsmanChoice,
    result: outcome.result,
    runs: outcome.runs,
    isWicket: outcome.isWicket,
    timestamp: Date.now(),
    partnership: innings.partnership.runs + (outcome.isWicket ? 0 : outcome.runs),
  };

  batsman.ballsFaced++;
  bowler.ballsBowled++;

  if (outcome.isWicket) {
    innings.wickets++;
    innings.dismissedBatsmanIds.push(batsman.id);
    bowler.wickets++;
    state.batsmanIndex++;
  } else {
    innings.runs += outcome.runs;
    batsman.runs += outcome.runs;
    bowler.runsConceded += outcome.runs;
    innings.partnership.runs += outcome.runs;
    innings.partnership.balls++;
  }

  innings.balls++;
  if (innings.balls >= 6) {
    innings.overs++;
    innings.balls = 0;
    state.bowlerIndex = (state.bowlerIndex + 1) % bowlingPlayers.length;
    innings.partnership = { runs: 0, balls: 0 };
  }

  innings.runRate = calculateRunRate(innings.runs, innings.overs, innings.balls);

  if (innings.target) {
    const totalBalls = state.settings.overs * 6;
    const bowled = innings.overs * 6 + innings.balls;
    const remaining = totalBalls - bowled;
    innings.requiredRunRate = calculateRequiredRunRate(
      innings.target,
      innings.runs,
      Math.floor(remaining / 6),
      remaining % 6
    );
  }

  const newState = {
    ...state,
    innings: state.innings.map((inn, i) => (i === state.currentInnings - 1 ? innings : inn)),
    balls: [...state.balls, ball],
  };

  const inningsEnded = checkInningsComplete(newState, innings);
  let matchEnded = false;

  if (inningsEnded) {
    innings.isComplete = true;
    newState.innings = newState.innings.map((inn, i) =>
      i === state.currentInnings - 1 ? innings : inn
    );

    if (state.currentInnings === 1) {
      newState.phase = 'break';
    } else {
      newState.result = calculateOfflineResult(newState);
      newState.phase = 'result';
      matchEnded = true;
    }
  }

  const scoreboard = buildOfflineScoreboard(newState);
  const liveState = {
    batsmanId: batsman.id,
    bowlerId: bowler.id,
    batsmanName: batsman.name,
    bowlerName: bowler.name,
    ballPhase: 'revealing' as const,
    movesReceived: 2,
    playerStates: [],
  };

  return {
    state: newState,
    result: { ball, scoreboard, liveState, isWicket: outcome.isWicket },
    inningsEnded,
    matchEnded,
  };
}

export function startSecondInnings(state: OfflineMatchState): OfflineMatchState {
  const first = state.innings[0];
  const target = first.runs + 1;
  const innings = createInnings(2, state.bowlingTeamId, state.battingTeamId, target);

  const totalBalls = state.settings.overs * 6;
  innings.requiredRunRate = calculateRequiredRunRate(target, 0, Math.floor(totalBalls / 6), totalBalls % 6);

  return {
    ...state,
    innings: [...state.innings, innings],
    currentInnings: 2,
    phase: 'innings',
    battingTeamId: state.bowlingTeamId,
    bowlingTeamId: state.battingTeamId,
    batsmanIndex: 0,
    bowlerIndex: 0,
  };
}

function buildTeamScore(state: OfflineMatchState, teamId: string, inningsNum: number): TeamScore {
  const inn = state.innings.find((i) => i.number === inningsNum && i.battingTeamId === teamId);
  const team = getTeam(state, teamId);
  if (!inn) {
    return { teamId, teamName: team.name, runs: 0, wickets: 0, overs: 0, balls: 0, runRate: 0 };
  }
  return {
    teamId,
    teamName: team.name,
    runs: inn.runs,
    wickets: inn.wickets,
    overs: inn.overs,
    balls: inn.balls,
    runRate: inn.runRate,
  };
}

export function calculateOfflineResult(state: OfflineMatchState): MatchEndEvent {
  const inn1 = state.innings[0];
  const inn2 = state.innings[1];
  const teamAScore = buildTeamScore(state, state.teamA.id, 1);
  const teamBScore = buildTeamScore(state, state.teamB.id, 2);

  const scoreA = state.teamA.id === inn1.battingTeamId ? inn1.runs : (inn2?.runs ?? 0);
  const scoreB = state.teamB.id === inn1.battingTeamId ? inn1.runs : (inn2?.runs ?? 0);

  const actualTeamA = state.teamA.id === inn1.battingTeamId ? inn1.runs : (inn2?.runs ?? 0);
  const actualTeamB = state.teamB.id === inn1.battingTeamId ? inn1.runs : (inn2?.runs ?? 0);

  let result: MatchEndEvent['result'];
  let winnerId: string | undefined;
  let winnerName: string | undefined;
  const isDraw = actualTeamA === actualTeamB;

  if (actualTeamA > actualTeamB) {
    result = 'team-a';
    winnerId = state.teamA.id;
    winnerName = state.teamA.name;
  } else if (actualTeamB > actualTeamA) {
    result = 'team-b';
    winnerId = state.teamB.id;
    winnerName = state.teamB.name;
  } else {
    result = 'draw';
  }

  return {
    result,
    winnerId,
    winnerName,
    teamAScore: { ...teamAScore, runs: actualTeamA, wickets: state.teamA.id === inn1.battingTeamId ? inn1.wickets : (inn2?.wickets ?? 0) },
    teamBScore: { ...teamBScore, runs: actualTeamB, wickets: state.teamB.id === inn1.battingTeamId ? inn1.wickets : (inn2?.wickets ?? 0) },
    isDraw,
    superOver: isDraw,
  };
}

export function simulateRandomBall(state: OfflineMatchState): ReturnType<typeof simulateBall> {
  const bowler = Math.floor(Math.random() * 7) as HandNumber;
  const batsman = Math.floor(Math.random() * 7) as HandNumber;
  return simulateBall(state, bowler, batsman);
}

export function simulateInnings(state: OfflineMatchState): OfflineMatchState {
  let current = { ...state };
  let safety = 200;
  while (!checkInningsComplete(current, current.innings[current.currentInnings - 1]) && safety-- > 0) {
    const bowler = Math.floor(Math.random() * 7) as HandNumber;
    const batsman = Math.floor(Math.random() * 7) as HandNumber;
    const { state: next } = simulateBall(current, bowler, batsman);
    current = next;
    if (checkInningsComplete(current, current.innings[current.currentInnings - 1])) break;
  }
  const innings = current.innings[current.currentInnings - 1];
  innings.isComplete = true;
  current.innings[current.currentInnings - 1] = innings;
  if (current.currentInnings === 1) {
    current.phase = 'break';
  }
  return current;
}

export function simulateFullMatch(format: MatchFormat = 'T10', teamSize = 2): OfflineMatchState {
  let state = createOfflineMatch(format, teamSize);
  state = simulateInnings(state);
  state = startSecondInnings(state);
  state = simulateInnings(state);
  const result = calculateOfflineResult(state);
  return { ...state, phase: 'result', result };
}
