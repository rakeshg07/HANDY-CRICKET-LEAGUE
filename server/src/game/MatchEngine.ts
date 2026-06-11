import {
  Ball,
  Innings,
  Match,
  MatchSettings,
  Player,
  Scoreboard,
  Team,
  TeamScore,
  HandNumber,
  InningsChoice,
  MatchResult,
  MatchEndEvent,
  BallResultEvent,
  PlayerScore,
  BowlerScore,
  MatchLiveState,
  PlayerLiveState,
  PlayerMatchState,
} from '@hcl/shared';
import {
  generateId,
  processBall,
  calculateRunRate,
  calculateRequiredRunRate,
  calculateStrikeRate,
  calculateEconomy,
  createDefaultStats,
} from '@hcl/shared';

export class MatchEngine {
  private match: Match;
  private players: Map<string, Player>;

  constructor(match: Match, players: Player[]) {
    this.match = match;
    this.players = new Map(players.map((p) => [p.id, p]));
  }

  getMatch(): Match {
    return this.match;
  }

  getPlayers(): Player[] {
    return Array.from(this.players.values());
  }

  setTossResult(winnerId: string, choice: InningsChoice): void {
    this.match.tossWinnerId = winnerId;
    this.match.tossChoice = choice;
    this.match.history.tossWinner = winnerId;
    this.match.history.tossChoice = choice;
    this.startFirstInnings(choice);
    this.beginBallPhase();
  }

  private startFirstInnings(choice: InningsChoice): void {
    const [teamA, teamB] = this.match.teams;
    const tossWinnerId = this.match.tossWinnerId!;
    
    const tossWinnerTeam = teamA.playerIds.includes(tossWinnerId) ? teamA.id : teamB.id;
    
    const battingTeamId =
      choice === 'bat'
        ? tossWinnerTeam === teamA.id
          ? teamA.id
          : teamB.id
        : tossWinnerTeam === teamA.id
          ? teamB.id
          : teamA.id;
          
    const bowlingTeamId = battingTeamId === teamA.id ? teamB.id : teamA.id;
    this.createInnings(1, battingTeamId, bowlingTeamId);
    this.match.phase = 'innings';
  }

  startSecondInnings(): Innings {
    const firstInnings = this.match.innings[0];
    const battingTeamId = firstInnings.bowlingTeamId;
    const bowlingTeamId = firstInnings.battingTeamId;
    const target = firstInnings.runs + 1;
    const innings = this.createInnings(2, battingTeamId, bowlingTeamId, target);
    this.beginBallPhase();
    return innings;
  }

  private createInnings(
    number: number,
    battingTeamId: string,
    bowlingTeamId: string,
    target?: number
  ): Innings {
    const battingTeam = this.getTeam(battingTeamId);
    const bowlingTeam = this.getTeam(bowlingTeamId);
    const strikerId = battingTeam.battingOrder[0];
    const bowlerId = bowlingTeam.bowlingOrder[0];

    const innings: Innings = {
      number,
      battingTeamId,
      bowlingTeamId,
      runs: 0,
      wickets: 0,
      overs: 0,
      balls: 0,
      runRate: 0,
      target,
      currentBatsmanId: strikerId,
      currentBowlerId: bowlerId,
      strikerId,
      partnership: { runs: 0, balls: 0 },
      isComplete: false,
      extras: 0,
      dismissedBatsmanIds: [],
    };

    if (target) {
      const { overs, balls } = this.getRemainingOvers(innings);
      innings.requiredRunRate = calculateRequiredRunRate(target, 0, overs, balls);
    }

    this.match.innings.push(innings);
    this.match.currentInnings = number;
    this.match.scoreboard = this.buildScoreboard(innings);
    return innings;
  }

  beginBallPhase(): void {
    this.match.pendingChoices = {};
    const liveState = this.buildLiveState('waiting-moves');
    this.match.liveState = liveState;
    this.syncPlayerMatchStates(liveState);
  }

  /**
   * Submit a move from exactly one player — must be current batsman OR bowler, never both.
   */
  submitMove(
    playerId: string,
    number: HandNumber
  ): { role: 'batsman' | 'bowler'; waiting: true } | BallResultEvent {
    const innings = this.getCurrentInnings();
    const isBatsman = playerId === innings.currentBatsmanId;
    const isBowler = playerId === innings.currentBowlerId;

    if (!isBatsman && !isBowler) {
      throw new Error('Only the active batter or bowler can submit a move');
    }
    if (isBatsman && isBowler) {
      throw new Error('Invalid state: player cannot be both batter and bowler');
    }

    if (isBatsman) {
      if (this.match.pendingChoices.batsmanSubmitted) {
        throw new Error('Batter has already submitted');
      }
      this.match.pendingChoices.batsman = number;
      this.match.pendingChoices.batsmanSubmitted = true;
    }

    if (isBowler) {
      if (this.match.pendingChoices.bowlerSubmitted) {
        throw new Error('Bowler has already submitted');
      }
      this.match.pendingChoices.bowler = number;
      this.match.pendingChoices.bowlerSubmitted = true;
    }

    const role = isBatsman ? 'batsman' : 'bowler';
    const batsmanChoice = this.match.pendingChoices.batsman;
    const bowlerChoice = this.match.pendingChoices.bowler;

    if (batsmanChoice === undefined || bowlerChoice === undefined) {
      const movesReceived =
        (this.match.pendingChoices.batsmanSubmitted ? 1 : 0) +
        (this.match.pendingChoices.bowlerSubmitted ? 1 : 0);
      this.match.liveState = this.buildLiveState('waiting-moves', movesReceived);
      return { role, waiting: true };
    }

    this.match.liveState = this.buildLiveState('processing', 2);
    const result = this.processBallChoice(batsmanChoice, bowlerChoice);
    this.match.pendingChoices = {};
    return result;
  }

  getMovesReceived(): number {
    return (
      (this.match.pendingChoices.batsmanSubmitted ? 1 : 0) +
      (this.match.pendingChoices.bowlerSubmitted ? 1 : 0)
    );
  }

  private processBallChoice(batsmanChoice: HandNumber, bowlerChoice: HandNumber): BallResultEvent {
    const innings = this.getCurrentInnings();
    const outcome = processBall(bowlerChoice, batsmanChoice);
    const outBatsmanId = innings.currentBatsmanId;

    const ball: Ball = {
      id: generateId(),
      inningsNumber: innings.number,
      overNumber: innings.overs,
      ballNumber: innings.balls + 1,
      bowlerId: innings.currentBowlerId,
      batsmanId: outBatsmanId,
      bowlerChoice,
      batsmanChoice,
      result: outcome.result,
      runs: outcome.runs,
      isWicket: outcome.isWicket,
      timestamp: Date.now(),
      partnership: innings.partnership.runs + (outcome.isWicket ? 0 : outcome.runs),
    };

    this.match.history.balls.push(ball);
    this.updatePlayerStats(ball, outcome);

    let overCompleted = false;

    if (outcome.isWicket) {
      innings.wickets++;
      innings.dismissedBatsmanIds.push(outBatsmanId);
      this.rotateBatsman();
    } else {
      innings.runs += outcome.runs;
      innings.partnership.runs += outcome.runs;
      innings.partnership.balls++;
    }

    innings.balls++;
    if (innings.balls >= 6) {
      innings.overs++;
      innings.balls = 0;
      overCompleted = true;
      this.rotateBowler();
      innings.partnership = { runs: 0, balls: 0 };
    }

    innings.runRate = calculateRunRate(innings.runs, innings.overs, innings.balls);

    if (innings.target) {
      const { overs, balls } = this.getRemainingOvers(innings);
      innings.requiredRunRate = calculateRequiredRunRate(
        innings.target,
        innings.runs,
        overs,
        balls
      );
    }

    const scoreboard = this.buildScoreboard(innings);
    this.match.scoreboard = scoreboard;

    const inningsComplete = this.checkInningsComplete(innings);
    if (inningsComplete) {
      innings.isComplete = true;
    }

    const liveState = this.buildLiveState(inningsComplete ? 'idle' : 'revealing');
    this.match.liveState = liveState;

    return {
      ball,
      scoreboard,
      liveState,
      isWicket: outcome.isWicket,
      nextBatsmanId: outcome.isWicket ? innings.currentBatsmanId : undefined,
      nextBowlerId: overCompleted ? innings.currentBowlerId : undefined,
    };
  }

  buildLiveState(ballPhase: MatchLiveState['ballPhase'], movesReceived?: number): MatchLiveState {
    const innings = this.getCurrentInnings();
    const batsman = this.players.get(innings.currentBatsmanId);
    const bowler = this.players.get(innings.currentBowlerId);
    const playerStates = this.computePlayerStates(innings);

    return {
      batsmanId: innings.currentBatsmanId,
      bowlerId: innings.currentBowlerId,
      batsmanName: batsman?.name ?? 'Batter',
      bowlerName: bowler?.name ?? 'Bowler',
      ballPhase,
      movesReceived: movesReceived ?? this.getMovesReceived(),
      playerStates,
    };
  }

  computePlayerStates(innings: Innings): PlayerLiveState[] {
    const battingTeam = this.getTeam(innings.battingTeamId);
    const bowlingTeam = this.getTeam(innings.bowlingTeamId);
    const states: PlayerLiveState[] = [];

    for (const player of this.players.values()) {
      let state: PlayerMatchState = 'SPECTATING';

      if (innings.dismissedBatsmanIds.includes(player.id)) {
        state = 'OUT';
      } else if (player.id === innings.currentBatsmanId) {
        state = 'BATTING';
      } else if (player.id === innings.currentBowlerId) {
        state = 'BOWLING';
      } else if (battingTeam.playerIds.includes(player.id)) {
        const orderIndex = battingTeam.battingOrder.indexOf(player.id);
        const dismissedBefore = battingTeam.battingOrder
          .slice(0, orderIndex)
          .filter((id) => innings.dismissedBatsmanIds.includes(id)).length;
        const effectiveIndex = orderIndex - dismissedBefore;
        const currentIndex = battingTeam.battingOrder.indexOf(innings.currentBatsmanId);
        const currentEffective = currentIndex - innings.dismissedBatsmanIds.filter((id) => {
          const idx = battingTeam.battingOrder.indexOf(id);
          return idx >= 0 && idx < currentIndex;
        }).length;

        if (effectiveIndex === currentEffective + 1) {
          state = 'WAITING';
        } else {
          state = 'SPECTATING';
        }
      } else if (bowlingTeam.playerIds.includes(player.id)) {
        state = 'SPECTATING';
      }

      player.matchState = state;
      states.push({ playerId: player.id, playerName: player.name, state });
    }

    return states;
  }

  private syncPlayerMatchStates(liveState: MatchLiveState): void {
    for (const ps of liveState.playerStates) {
      const player = this.players.get(ps.playerId);
      if (player) player.matchState = ps.state;
    }
  }

  private updatePlayerStats(
    ball: Ball,
    outcome: { runs: number; isWicket: boolean }
  ): void {
    const batsman = this.players.get(ball.batsmanId);
    const bowler = this.players.get(ball.bowlerId);

    if (batsman) {
      batsman.stats.ballsFaced++;
      if (!outcome.isWicket) {
        batsman.stats.runs += outcome.runs;
      }
      batsman.stats.strikeRate = calculateStrikeRate(
        batsman.stats.runs,
        batsman.stats.ballsFaced
      );
    }

    if (bowler) {
      bowler.stats.ballsBowled++;
      if (!outcome.isWicket) {
        bowler.stats.runsConceded += outcome.runs;
      }
      if (outcome.isWicket) {
        bowler.stats.wickets++;
      }
      bowler.stats.economy = calculateEconomy(
        bowler.stats.runsConceded,
        bowler.stats.ballsBowled
      );
    }
  }

  private rotateBatsman(): void {
    const innings = this.getCurrentInnings();
    const battingTeam = this.getTeam(innings.battingTeamId);
    const next = battingTeam.battingOrder.find(
      (id) => !innings.dismissedBatsmanIds.includes(id) && id !== innings.currentBatsmanId
    );
    if (next) {
      innings.currentBatsmanId = next;
      innings.strikerId = next;
    }
  }

  private rotateBowler(): void {
    const innings = this.getCurrentInnings();
    const bowlingTeam = this.getTeam(innings.bowlingTeamId);
    const bowlerIndex = innings.overs % bowlingTeam.bowlingOrder.length;
    innings.currentBowlerId = bowlingTeam.bowlingOrder[bowlerIndex];
  }

  private checkInningsComplete(innings: Innings): boolean {
    const battingTeam = this.getTeam(innings.battingTeamId);
    const maxWickets = Math.min(
      this.match.settings.maxWickets,
      battingTeam.battingOrder.length - 1
    );

    if (innings.wickets >= maxWickets) return true;

    const totalBalls = this.match.settings.overs * 6;
    const bowledBalls = innings.overs * 6 + innings.balls;
    if (bowledBalls >= totalBalls) return true;

    if (innings.target && innings.runs >= innings.target) return true;

    const remainingBatters =
      battingTeam.battingOrder.length - innings.dismissedBatsmanIds.length - 1;
    if (remainingBatters <= 0) return true;

    return false;
  }

  calculateMatchResult(): MatchEndEvent {
    const [inn1, inn2] = this.match.innings;
    const [teamA, teamB] = this.match.teams;

    const teamAScore = this.buildTeamScore(
      teamA.id === inn1.battingTeamId ? inn1 : inn2,
      teamA
    );
    const teamBScore = this.buildTeamScore(
      teamB.id === inn1.battingTeamId ? inn1 : inn2,
      teamB
    );

    const scoreA = teamA.id === inn1.battingTeamId ? inn1.runs : inn2?.runs ?? 0;
    const scoreB = teamB.id === inn1.battingTeamId ? inn1.runs : inn2?.runs ?? 0;

    let result: MatchResult;
    let winnerId: string | undefined;
    let winnerName: string | undefined;
    const isDraw = scoreA === scoreB;

    if (scoreA > scoreB) {
      result = 'team-a';
      winnerId = teamA.id;
      winnerName = teamA.name;
    } else if (scoreB > scoreA) {
      result = 'team-b';
      winnerId = teamB.id;
      winnerName = teamB.name;
    } else {
      result = 'draw';
    }

    this.match.result = result;
    this.match.winnerId = winnerId;
    this.match.phase = 'result';
    this.match.endedAt = Date.now();

    return {
      result,
      winnerId,
      winnerName,
      teamAScore,
      teamBScore,
      isDraw,
      superOver: isDraw,
    };
  }

  private buildTeamScore(innings: Innings | undefined, team: Team): TeamScore {
    if (!innings) {
      return {
        teamId: team.id,
        teamName: team.name,
        runs: 0,
        wickets: 0,
        overs: 0,
        balls: 0,
        runRate: 0,
      };
    }
    return {
      teamId: team.id,
      teamName: team.name,
      runs: innings.runs,
      wickets: innings.wickets,
      overs: innings.overs,
      balls: innings.balls,
      runRate: innings.runRate,
    };
  }

  buildScoreboard(innings: Innings): Scoreboard {
    const battingTeam = this.getTeam(innings.battingTeamId);
    const bowlingTeam = this.getTeam(innings.bowlingTeamId);
    const batsman = this.players.get(innings.currentBatsmanId);
    const bowler = this.players.get(innings.currentBowlerId);

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
            runs: batsman.stats.runs,
            ballsFaced: batsman.stats.ballsFaced,
            strikeRate: batsman.stats.strikeRate,
          }
        : null,
      currentBowler: bowler
        ? {
            playerId: bowler.id,
            playerName: bowler.name,
            wickets: bowler.stats.wickets,
            runsConceded: bowler.stats.runsConceded,
            ballsBowled: bowler.stats.ballsBowled,
            economy: bowler.stats.economy,
          }
        : null,
      partnership: { ...innings.partnership },
      target: innings.target,
      requiredRunRate: innings.requiredRunRate,
      matchPhase: this.match.phase,
    };
  }

  private getCurrentInnings(): Innings {
    const innings = this.match.innings[this.match.currentInnings - 1];
    if (!innings) throw new Error('No active innings');
    return innings;
  }

  private getTeam(teamId: string): Team {
    const team = this.match.teams.find((t) => t.id === teamId);
    if (!team) throw new Error(`Team ${teamId} not found`);
    return team;
  }

  private getRemainingOvers(innings: Innings): { overs: number; balls: number } {
    const totalBalls = this.match.settings.overs * 6;
    const bowledBalls = innings.overs * 6 + innings.balls;
    const remaining = Math.max(0, totalBalls - bowledBalls);
    return { overs: Math.floor(remaining / 6), balls: remaining % 6 };
  }

  static createMatch(roomId: string, teams: [Team, Team], settings: MatchSettings): Match {
    return {
      id: generateId(),
      roomId,
      settings,
      teams,
      phase: 'toss',
      currentInnings: 0,
      innings: [],
      history: { balls: [], innings: [] },
      scoreboard: {
        inningsNumber: 0,
        battingTeam: {
          teamId: teams[0].id,
          teamName: teams[0].name,
          runs: 0,
          wickets: 0,
          overs: 0,
          balls: 0,
          runRate: 0,
        },
        bowlingTeam: {
          teamId: teams[1].id,
          teamName: teams[1].name,
          runs: 0,
          wickets: 0,
          overs: 0,
          balls: 0,
          runRate: 0,
        },
        currentBatsman: null,
        currentBowler: null,
        partnership: { runs: 0, balls: 0 },
        matchPhase: 'toss',
      },
      pendingChoices: {},
      startedAt: Date.now(),
    };
  }

  static createTeams(
    teamAData: {
      name: string;
      playerIds: string[];
      captainId: string;
      battingOrder?: string[];
      bowlingOrder?: string[];
    },
    teamBData: {
      name: string;
      playerIds: string[];
      captainId: string;
      battingOrder?: string[];
      bowlingOrder?: string[];
    }
  ): [Team, Team] {
    const teamA: Team = {
      id: generateId(),
      name: teamAData.name,
      captainId: teamAData.captainId,
      playerIds: teamAData.playerIds,
      battingOrder: teamAData.battingOrder ?? [...teamAData.playerIds],
      bowlingOrder: teamAData.bowlingOrder ?? [...teamAData.playerIds],
      color: '#22c55e',
    };
    const teamB: Team = {
      id: generateId(),
      name: teamBData.name,
      captainId: teamBData.captainId,
      playerIds: teamBData.playerIds,
      battingOrder: teamBData.battingOrder ?? [...teamBData.playerIds],
      bowlingOrder: teamBData.bowlingOrder ?? [...teamBData.playerIds],
      color: '#3b82f6',
    };
    return [teamA, teamB];
  }

  static resetPlayerStats(players: Player[]): void {
    players.forEach((p) => {
      p.stats = createDefaultStats();
      p.matchState = undefined;
    });
  }
}
