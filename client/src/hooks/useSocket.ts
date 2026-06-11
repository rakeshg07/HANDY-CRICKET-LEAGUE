'use client';

import { useEffect, useCallback } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useGameStore } from '@/store/gameStore';
import { savePlayerSession, loadPlayerSession } from '@/lib/session';
import { sounds } from '@/lib/sounds';
import { HandNumber } from '@hcl/shared';

export function useSocketInit() {
  useEffect(() => {
    const socket = connectSocket();
    const store = useGameStore.getState();

    const persistSession = (playerId: string, roomCode: string, playerName: string) => {
      savePlayerSession({ playerId, roomCode, playerName });
    };

    socket.on('connect', () => {
      store.setConnected(true);
      const session = loadPlayerSession();
      if (session) {
        socket.emit('reconnect', {
          roomCode: session.roomCode,
          playerId: session.playerId,
        });
      }
    });

    socket.on('disconnect', () => store.setConnected(false));

    socket.on('room-created', (room) => {
      const me = room.players.find((p) => p.isHost);
      if (me) {
        store.setPlayerId(me.id);
        persistSession(me.id, room.code, me.name);
      }
      store.setRoom(room);
    });

    socket.on('room-joined', (room) => {
      const me = room.players.find((p) => p.socketId === socket.id);
      if (me) {
        store.setPlayerId(me.id);
        persistSession(me.id, room.code, me.name);
      }
      store.setRoom(room);
    });

    socket.on('player-joined', (player) => store.addPlayer(player));
    socket.on('player-left', (playerId) => store.removePlayer(playerId));

    socket.on('player-disconnected', () => {
      // room list updated via match-state or player-reconnected
    });

    socket.on('player-reconnected', ({ room }) => {
      store.setRoom(room);
    });

    socket.on('player-ready', (playerId, isReady) => {
      store.updatePlayerReady(playerId, isReady);
    });

    socket.on('teams-updated', (teams) => store.setTeams(teams));

    socket.on('match-started', (match) => store.setMatch(match));

    socket.on('toss-result', (data) => {
      sounds.toss();
      store.setTossWinner(data.winnerId, data.winnerName);
    });

    socket.on('innings-start', (data) => {
      store.setInnings(data.innings, data.scoreboard, data.liveState);
    });

    socket.on('ball-waiting', (liveState) => {
      store.setLiveState(liveState);
    });

    socket.on('move-accepted', () => {
      store.setMoveSubmitted(true);
    });

    socket.on('move-pending', (data) => {
      store.setMovesReceived(data.movesReceived);
    });

    socket.on('ball-result', (data) => {
      sounds.reveal();
      setTimeout(() => {
        if (data.isWicket) sounds.out();
        else sounds.runs(data.ball.runs);
        store.setBallResult(data);
      }, 100);
    });

    socket.on('player-out', () => sounds.wicket());
    socket.on('innings-complete', () => sounds.toss());

    socket.on('match-end', (data) => {
      sounds.victory();
      store.setMatchEnd(data);
    });

    socket.on('match-complete', (data) => {
      store.setMatchEnd(data);
    });

    socket.on('match-state', ({ room, liveState }) => {
      store.setRoom(room);
      if (liveState) store.setLiveState(liveState);
      if (room.match && room.status === 'in-progress') store.setScreen('match');
      if (room.status === 'toss' && room.match) store.setScreen('toss');
      if (room.status === 'waiting' || room.status === 'team-formation') store.setScreen('lobby');
    });

    socket.on('room-state', (room) => store.setRoom(room));
    socket.on('error', (message) => store.setError(message));

    return () => {
      socket.removeAllListeners();
      disconnectSocket();
    };
  }, []);
}

export function useSocket() {
  const store = useGameStore();

  const createRoom = useCallback(
    (playerName: string, maxPlayers?: number) => {
      const socket = connectSocket();
      store.setPlayerName(playerName);
      socket.emit('create-room', {
        playerName,
        maxPlayers,
        matchSettings: store.matchSettings,
      });
    },
    [store]
  );

  const joinRoom = useCallback(
    (roomCode: string, playerName: string) => {
      const socket = connectSocket();
      store.setPlayerName(playerName);
      socket.emit('join-room', { roomCode, playerName });
    },
    [store]
  );

  const leaveRoom = useCallback(() => {
    getSocket().emit('leave-room');
  }, []);

  const toggleReady = useCallback((isReady: boolean) => {
    connectSocket().emit('player-ready', isReady);
  }, []);

  const updateTeams = useCallback(
    (
      teamA: { name: string; playerIds: string[]; captainId: string },
      teamB: { name: string; playerIds: string[]; captainId: string }
    ) => {
      connectSocket().emit('assign-team', { teamA, teamB });
    },
    []
  );

  const startMatch = useCallback(() => {
    connectSocket().emit('start-match');
  }, []);

  const coinToss = useCallback((choice: 'heads' | 'tails') => {
    connectSocket().emit('coin-toss', { choice });
  }, []);

  const inningsDecision = useCallback((choice: 'bat' | 'bowl') => {
    connectSocket().emit('innings-decision', { choice });
  }, []);

  const submitMove = useCallback(
    (number: HandNumber) => {
      sounds.select();
      connectSocket().emit('submit-move', { number });
    },
    []
  );

  return {
    createRoom,
    joinRoom,
    leaveRoom,
    toggleReady,
    updateTeams,
    startMatch,
    coinToss,
    inningsDecision,
    submitMove,
  };
}
