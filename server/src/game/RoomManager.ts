import {
  Room,
  Player,
  MatchSettings,
  Team,
  MatchFormat,
  CreateRoomPayload,
  TeamFormationPayload,
  TossChoice,
  InningsChoice,
  MatchLiveState,
} from '@hcl/shared';
import {
  generateId,
  generateRoomCode,
  resolveMatchSettings,
  createDefaultStats,
} from '@hcl/shared';
import { RECONNECT_GRACE_MS } from '@hcl/shared';
import { MatchEngine } from './MatchEngine';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();
  private codeIndex: Map<string, string> = new Map();
  private playerRoomIndex: Map<string, string> = new Map();
  private engines: Map<string, MatchEngine> = new Map();
  private disconnectTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  getRoomCount(): number {
    return this.rooms.size;
  }

  createRoom(socketId: string, payload: CreateRoomPayload): Room {
    const roomId = generateId();
    const code = this.generateUniqueCode();

    const player: Player = {
      id: generateId(),
      socketId,
      name: payload.playerName,
      isHost: true,
      isReady: false,
      isConnected: true,
      stats: createDefaultStats(),
    };

    const settings = resolveMatchSettings(
      (payload.matchSettings?.format as MatchFormat) ?? 'T20',
      payload.matchSettings
    );

    const room: Room = {
      id: roomId,
      code,
      hostId: player.id,
      maxPlayers: payload.maxPlayers ?? 12,
      status: 'waiting',
      players: [player],
      teams: [],
      createdAt: Date.now(),
      settings,
    };

    this.rooms.set(roomId, room);
    this.codeIndex.set(code, roomId);
    this.playerRoomIndex.set(player.id, roomId);

    return room;
  }

  joinRoom(socketId: string, roomCode: string, playerName: string): Room {
    const roomId = this.codeIndex.get(roomCode.toUpperCase());
    if (!roomId) throw new Error('Room not found');

    const room = this.rooms.get(roomId)!;

    const reconnecting = room.players.find((p) => p.id && p.name === playerName && !p.isConnected);
    if (reconnecting) {
      this.clearDisconnectTimer(reconnecting.id);
      reconnecting.socketId = socketId;
      reconnecting.isConnected = true;
      return room;
    }

    if (room.players.length >= room.maxPlayers) {
      throw new Error('Room is full');
    }
    if (room.status !== 'waiting' && room.status !== 'team-formation') {
      throw new Error('Match already in progress — use reconnect with your player ID');
    }

    if (room.players.some((p) => p.name === playerName && p.isConnected)) {
      throw new Error('Player name already taken in this room — use a unique name per device');
    }

    const player: Player = {
      id: generateId(),
      socketId,
      name: playerName,
      isHost: false,
      isReady: false,
      isConnected: true,
      stats: createDefaultStats(),
    };

    room.players.push(player);
    this.playerRoomIndex.set(player.id, roomId);
    return room;
  }

  reconnect(socketId: string, roomCode: string, playerId: string): { room: Room; liveState?: MatchLiveState } | null {
    const roomId = this.codeIndex.get(roomCode.toUpperCase());
    if (!roomId) return null;

    const room = this.rooms.get(roomId);
    if (!room) return null;

    const player = room.players.find((p) => p.id === playerId);
    if (!player) return null;

    this.clearDisconnectTimer(playerId);
    player.socketId = socketId;
    player.isConnected = true;
    this.playerRoomIndex.set(playerId, roomId);

    const engine = this.engines.get(roomId);
    let liveState: MatchLiveState | undefined;
    if (engine && room.match && room.status === 'in-progress') {
      try {
        liveState = engine.buildLiveState(
          room.match.pendingChoices.batsmanSubmitted || room.match.pendingChoices.bowlerSubmitted
            ? 'waiting-moves'
            : 'waiting-moves',
          engine.getMovesReceived()
        );
        room.match.liveState = liveState;
      } catch {
        // innings may not be active
      }
    }

    return { room, liveState };
  }

  leaveRoom(socketId: string): { room: Room; player: Player } | null {
    const result = this.getPlayerBySocketId(socketId);
    if (!result) return null;
    const { room, player } = result;

    if (room.status === 'in-progress') {
      throw new Error('Cannot leave during an active match — disconnect to trigger reconnect grace period');
    }

    room.players = room.players.filter((p) => p.id !== player.id);
    this.playerRoomIndex.delete(player.id);

    if (room.players.length === 0) {
      this.removeRoom(room.id);
    } else if (player.isHost) {
      room.players[0].isHost = true;
      room.hostId = room.players[0].id;
    }

    return { room, player };
  }

  getRoomByPlayerId(playerId: string): Room | null {
    const roomId = this.playerRoomIndex.get(playerId);
    if (!roomId) return null;
    return this.rooms.get(roomId) ?? null;
  }

  getPlayerBySocketId(socketId: string): { room: Room; player: Player } | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find((p) => p.socketId === socketId);
      if (player) return { room, player };
    }
    return null;
  }

  setPlayerReady(socketId: string, isReady: boolean): { room: Room; player: Player } | null {
    const result = this.getPlayerBySocketId(socketId);
    if (!result) return null;
    result.player.isReady = isReady;
    return result;
  }

  updateTeams(socketId: string, payload: TeamFormationPayload): Room | null {
    const result = this.getPlayerBySocketId(socketId);
    if (!result) return null;
    const { room, player } = result;

    if (player.id !== room.hostId) {
      throw new Error('Only host can update teams');
    }

    if (payload.teamA.playerIds.length !== payload.teamB.playerIds.length) {
      throw new Error('Teams must have equal number of players');
    }

    const allIds = [...payload.teamA.playerIds, ...payload.teamB.playerIds];
    const validPlayers = allIds.every((id) => room.players.some((p) => p.id === id));
    if (!validPlayers) throw new Error('Invalid player assignment');

    const teams = MatchEngine.createTeams(payload.teamA, payload.teamB);
    room.teams = teams;
    room.status = 'team-formation';

    room.players.forEach((p) => {
      const team = teams.find((t) => t.playerIds.includes(p.id));
      if (team) p.teamId = team.id;
    });

    return room;
  }

  autoBalanceTeams(socketId: string): Room | null {
    const result = this.getPlayerBySocketId(socketId);
    if (!result) return null;
    const { room, player } = result;
    if (player.id !== room.hostId) throw new Error('Only host can auto-balance teams');

    const half = Math.floor(room.players.length / 2);
    const teamAIds = room.players.slice(0, half).map((p) => p.id);
    const teamBIds = room.players.slice(half, half * 2).map((p) => p.id);

    return this.updateTeams(socketId, {
      teamA: { name: 'Team A', playerIds: teamAIds, captainId: teamAIds[0] },
      teamB: { name: 'Team B', playerIds: teamBIds, captainId: teamBIds[0] },
    });
  }

  startMatch(socketId: string): { room: Room; engine: MatchEngine } | null {
    const result = this.getPlayerBySocketId(socketId);
    if (!result) return null;
    const { room, player } = result;

    if (player.id !== room.hostId) throw new Error('Only host can start match');
    if (room.players.length < 2) throw new Error('Need at least 2 players for multiplayer');

    if (room.teams.length < 2) {
      this.autoBalanceTeams(socketId);
    }

    const allReady = room.players.every((p) => p.isReady);
    if (!allReady) throw new Error('All players must be ready');

    const settings = room.settings ?? resolveMatchSettings('T20');
    MatchEngine.resetPlayerStats(room.players);

    const match = MatchEngine.createMatch(room.id, room.teams as [Team, Team], settings);
    room.match = match;
    room.status = 'toss';

    const engine = new MatchEngine(match, room.players);
    this.engines.set(room.id, engine);

    return { room, engine };
  }

  getEngine(roomId: string): MatchEngine | null {
    return this.engines.get(roomId) ?? null;
  }

  processToss(socketId: string, choice: TossChoice): {
    room: Room;
    winnerId: string;
    winnerName: string;
  } | null {
    const result = this.getPlayerBySocketId(socketId);
    if (!result) return null;
    const { room, player } = result;

    if (!room.match) throw new Error('Match not started');
    if (room.tossCompleted) throw new Error('Toss already completed');

    const tossResult: TossChoice = Math.random() < 0.5 ? 'heads' : 'tails';
    const callerWins = choice === tossResult;
    
    let winnerId = player.id;
    if (!callerWins) {
      const callerTeam = room.teams.find((t) => t.playerIds.includes(player.id));
      const opponentTeam = room.teams.find((t) => t.id !== callerTeam?.id);
      if (opponentTeam) {
        winnerId = opponentTeam.captainId;
      } else {
        const opponent = room.players.find((p) => p.id !== player.id);
        winnerId = opponent?.id ?? player.id;
      }
    }
    
    const winner = room.players.find((p) => p.id === winnerId)!;

    room.match.tossWinnerId = winnerId;
    room.tossCompleted = true;

    return { room, winnerId, winnerName: winner.name };
  }

  processInningsDecision(socketId: string, choice: InningsChoice): MatchEngine | null {
    const result = this.getPlayerBySocketId(socketId);
    if (!result) return null;
    const { room, player } = result;

    const engine = this.engines.get(room.id);
    if (!engine || !room.match) return null;

    const tossWinnerId = room.match.tossWinnerId;
    if (!tossWinnerId) throw new Error('Toss not completed');
    if (player.id !== tossWinnerId) throw new Error('Only toss winner can decide');

    engine.setTossResult(tossWinnerId, choice);
    room.status = 'in-progress';
    room.match.liveState = engine.buildLiveState('waiting-moves');
    return engine;
  }

  handleDisconnect(socketId: string): { room: Room; player: Player; graceSeconds: number } | null {
    const result = this.getPlayerBySocketId(socketId);
    if (!result) return null;

    const { room, player } = result;
    player.isConnected = false;
    player.socketId = '';

    this.clearDisconnectTimer(player.id);
    const timer = setTimeout(() => {
      this.removeDisconnectedPlayer(room.id, player.id);
    }, RECONNECT_GRACE_MS);
    this.disconnectTimers.set(player.id, timer);

    return { room, player, graceSeconds: RECONNECT_GRACE_MS / 1000 };
  }

  private removeDisconnectedPlayer(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.players = room.players.filter((p) => p.id !== playerId);
    this.playerRoomIndex.delete(playerId);
    this.disconnectTimers.delete(playerId);

    if (room.players.length === 0) {
      this.removeRoom(roomId);
    }
  }

  private clearDisconnectTimer(playerId: string): void {
    const timer = this.disconnectTimers.get(playerId);
    if (timer) {
      clearTimeout(timer);
      this.disconnectTimers.delete(playerId);
    }
  }

  removeRoom(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (room) {
      this.codeIndex.delete(room.code);
      room.players.forEach((p) => {
        this.playerRoomIndex.delete(p.id);
        this.clearDisconnectTimer(p.id);
      });
    }
    this.rooms.delete(roomId);
    this.engines.delete(roomId);
  }

  private generateUniqueCode(): string {
    let code: string;
    do {
      code = generateRoomCode();
    } while (this.codeIndex.has(code));
    return code;
  }
}
