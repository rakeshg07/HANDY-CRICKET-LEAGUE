import { Server, Socket } from 'socket.io';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  BALL_REVEAL_DELAY_MS,
  TOSS_ANIMATION_MS,
} from '@hcl/shared';
import { RoomManager } from '../game/RoomManager';

type IOServer = Server<ClientToServerEvents, ServerToClientEvents>;
type IOSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerSocketHandlers(io: IOServer, roomManager: RoomManager): void {
  io.on('connection', (socket: IOSocket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('create-room', (payload) => {
      try {
        const room = roomManager.createRoom(socket.id, payload);
        socket.join(room.id);
        socket.emit('room-created', room);
      } catch (err) {
        socket.emit('error', (err as Error).message);
      }
    });

    socket.on('join-room', (payload) => {
      try {
        const room = roomManager.joinRoom(socket.id, payload.roomCode, payload.playerName);
        socket.join(room.id);
        const me = room.players.find((p) => p.socketId === socket.id)!;
        socket.emit('room-joined', room);
        socket.to(room.id).emit('player-joined', me);
      } catch (err) {
        socket.emit('error', (err as Error).message);
      }
    });

    socket.on('leave-room', () => {
      try {
        const result = roomManager.leaveRoom(socket.id);
        if (result) {
          socket.leave(result.room.id);
          io.to(result.room.id).emit('player-left', result.player.id);
        }
      } catch (err) {
        socket.emit('error', (err as Error).message);
      }
    });

    socket.on('reconnect', (payload) => {
      const result = roomManager.reconnect(socket.id, payload.roomCode, payload.playerId);
      if (result) {
        socket.join(result.room.id);
        socket.emit('player-reconnected', { playerId: payload.playerId, room: result.room });
        socket.to(result.room.id).emit('player-reconnected', { playerId: payload.playerId, room: result.room });
        if (result.liveState) {
          socket.emit('ball-waiting', result.liveState);
        }
        socket.emit('match-state', { room: result.room, liveState: result.liveState });
      } else {
        socket.emit('error', 'Could not reconnect to room');
      }
    });

    socket.on('player-ready', (isReady) => {
      const result = roomManager.setPlayerReady(socket.id, isReady);
      if (result) {
        io.to(result.room.id).emit('player-ready', result.player.id, isReady);
      }
    });

    socket.on('update-teams', (payload) => {
      try {
        const room = roomManager.updateTeams(socket.id, payload);
        if (room) io.to(room.id).emit('teams-updated', room.teams);
      } catch (err) {
        socket.emit('error', (err as Error).message);
      }
    });

    socket.on('assign-team', (payload) => {
      try {
        const room = roomManager.updateTeams(socket.id, payload);
        if (room) io.to(room.id).emit('teams-updated', room.teams);
      } catch (err) {
        socket.emit('error', (err as Error).message);
      }
    });

    socket.on('start-match', () => {
      try {
        const result = roomManager.startMatch(socket.id);
        if (result) {
          io.to(result.room.id).emit('match-started', result.room.match!);
        }
      } catch (err) {
        socket.emit('error', (err as Error).message);
      }
    });

    socket.on('coin-toss', (payload) => {
      try {
        const result = roomManager.processToss(socket.id, payload.choice);
        if (!result) return;
        const { room, winnerId, winnerName } = result;
        setTimeout(() => {
          io.to(room.id).emit('toss-result', { winnerId, winnerName, choice: payload.choice });
        }, TOSS_ANIMATION_MS);
      } catch (err) {
        socket.emit('error', (err as Error).message);
      }
    });

    socket.on('innings-decision', (payload) => {
      try {
        const result = roomManager.getPlayerBySocketId(socket.id);
        if (!result) return;

        const { room } = result;
        const engine = roomManager.processInningsDecision(socket.id, payload.choice);
        if (!engine) return;

        const match = engine.getMatch();
        const innings = match.innings[match.innings.length - 1];
        const scoreboard = engine.buildScoreboard(innings);
        const liveState = engine.buildLiveState('waiting-moves');

        io.to(room.id).emit('innings-decision', {
          teamId: result.player.teamId ?? '',
          choice: payload.choice,
        });

        io.to(room.id).emit('innings-start', { innings, scoreboard, liveState });
        io.to(room.id).emit('ball-waiting', liveState);
      } catch (err) {
        socket.emit('error', (err as Error).message);
      }
    });

    socket.on('submit-move', (payload) => {
      try {
        const result = roomManager.getPlayerBySocketId(socket.id);
        if (!result) return;

        const { room, player } = result;
        const engine = roomManager.getEngine(room.id);
        if (!engine || room.status !== 'in-progress') return;

        const innings = room.match?.innings[room.match.currentInnings - 1];
        if (!innings) return;

        const isBatsman = innings.currentBatsmanId === player.id;
        const isBowler = innings.currentBowlerId === player.id;

        if (!isBatsman && !isBowler) {
          socket.emit('error', 'You are not the active batter or bowler');
          return;
        }

        const submitResult = engine.submitMove(player.id, payload.number);

        if ('waiting' in submitResult) {
          socket.emit('move-accepted', { role: submitResult.role });
          io.to(room.id).emit('move-pending', {
            movesReceived: engine.getMovesReceived(),
            totalRequired: 2,
          });
          return;
        }

        const ballEvent = submitResult;
        room.match = engine.getMatch();

        setTimeout(() => {
          io.to(room.id).emit('ball-result', ballEvent);

          if (ballEvent.isWicket) {
            const outPlayer = room.players.find((p) => p.id === ballEvent.ball.batsmanId);
            io.to(room.id).emit('player-out', {
              playerId: ballEvent.ball.batsmanId,
              playerName: outPlayer?.name ?? 'Player',
              nextBatsmanId: ballEvent.nextBatsmanId,
              liveState: ballEvent.liveState,
            });
            if (ballEvent.nextBatsmanId) {
              const next = room.players.find((p) => p.id === ballEvent.nextBatsmanId);
              io.to(room.id).emit('next-batter', {
                playerId: ballEvent.nextBatsmanId,
                playerName: next?.name ?? 'Batter',
                liveState: ballEvent.liveState,
              });
            }
          }

          if (ballEvent.nextBowlerId) {
            const next = room.players.find((p) => p.id === ballEvent.nextBowlerId);
            io.to(room.id).emit('next-bowler', {
              playerId: ballEvent.nextBowlerId!,
              playerName: next?.name ?? 'Bowler',
              liveState: ballEvent.liveState,
            });
            io.to(room.id).emit('over-complete', {
              overNumber: ballEvent.ball.overNumber + 1,
              liveState: ballEvent.liveState,
            });
          }

          const match = engine.getMatch();
          const currentInnings = match.innings[match.currentInnings - 1];

          if (currentInnings.isComplete) {
            if (match.currentInnings === 1) {
              io.to(room.id).emit('innings-complete', {
                innings: currentInnings,
                scoreboard: ballEvent.scoreboard,
              });

              setTimeout(() => {
                const secondInnings = engine.startSecondInnings();
                match.currentInnings = 2;
                match.phase = 'innings';
                const scoreboard = engine.buildScoreboard(secondInnings);
                const liveState = engine.buildLiveState('waiting-moves');
                io.to(room.id).emit('innings-start', { innings: secondInnings, scoreboard, liveState });
                io.to(room.id).emit('ball-waiting', liveState);
              }, 3000);
            } else {
              const matchEnd = engine.calculateMatchResult();
              room.status = 'completed';
              io.to(room.id).emit('innings-complete', {
                innings: currentInnings,
                scoreboard: ballEvent.scoreboard,
              });
              io.to(room.id).emit('match-complete', matchEnd);
              io.to(room.id).emit('match-end', matchEnd);
            }
          } else {
            engine.beginBallPhase();
            const liveState = engine.buildLiveState('waiting-moves');
            io.to(room.id).emit('ball-waiting', liveState);
          }
        }, BALL_REVEAL_DELAY_MS);
      } catch (err) {
        socket.emit('error', (err as Error).message);
      }
    });

    socket.on('disconnect', () => {
      const result = roomManager.handleDisconnect(socket.id);
      if (result) {
        io.to(result.room.id).emit('player-disconnected', {
          playerId: result.player.id,
          playerName: result.player.name,
          graceSeconds: result.graceSeconds,
        });
      }
      console.log(`Player disconnected: ${socket.id}`);
    });
  });
}
