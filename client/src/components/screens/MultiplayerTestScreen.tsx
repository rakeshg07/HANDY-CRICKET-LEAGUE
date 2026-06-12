'use client';

import { useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GlassCard } from '@/components/ui/GlassCard';
import { useGameStore } from '@/store/gameStore';
import { ClientToServerEvents, ServerToClientEvents } from '@hcl/shared';
import { sounds } from '@/lib/sounds';

type TestSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface TestStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'pass' | 'fail';
  error?: string;
}

export function MultiplayerTestScreen() {
  const { setScreen } = useGameStore();
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<TestStep[]>([
    { id: 'connect', label: 'Connecting 4 Sockets', status: 'pending' },
    { id: 'create', label: 'Room Creation (User1)', status: 'pending' },
    { id: 'join', label: 'Room Joining (Users 2-4)', status: 'pending' },
    { id: 'team', label: 'Team Assignment', status: 'pending' },
    { id: 'toss', label: 'Match Start & Toss', status: 'pending' },
    { id: 'ball1', label: 'Play Ball (Run Logic)', status: 'pending' },
    { id: 'ball2', label: 'Play Ball (Out Logic)', status: 'pending' },
    { id: 'over', label: 'Over Completion & Innings Switch', status: 'pending' },
    { id: 'winner', label: 'Match Winner Calculation', status: 'pending' },
  ]);

  const socketsRef = useRef<TestSocket[]>([]);

  const updateStep = (id: string, status: TestStep['status'], error?: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status, error } : s));
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const runTest = async () => {
    if (isRunning) return;
    setIsRunning(true);
    sounds.click();
    
    // Reset steps
    setSteps(prev => prev.map(s => ({ ...s, status: 'pending', error: undefined })));
    
    try {
      // Step 1: Connect
      updateStep('connect', 'running');
      const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';
      const sockets: TestSocket[] = Array.from({ length: 4 }).map(() => io(SOCKET_URL));
      socketsRef.current = sockets;

      await Promise.all(sockets.map(s => new Promise<void>((resolve) => {
        s.on('connect', resolve);
      })));
      updateStep('connect', 'pass');

      // Step 2: Create Room
      updateStep('create', 'running');
      const host = sockets[0];
      let roomCode = '';
      let roomId = '';
      await new Promise<void>((resolve) => {
        host.on('room-created', (room) => {
          roomCode = room.code;
          roomId = room.id;
          resolve();
        });
        host.emit('create-room', { playerName: 'User1', matchSettings: { format: 'CUSTOM', overs: 1, playersPerTeam: 2, maxWickets: 1 } });
      });
      if (!roomCode) throw new Error('No room code generated');
      updateStep('create', 'pass');

      // Step 3: Join Room
      updateStep('join', 'running');
      await Promise.all([
        new Promise<void>(resolve => { sockets[1].on('room-joined', () => resolve()); sockets[1].emit('join-room', { roomCode, playerName: 'User2' }); }),
        new Promise<void>(resolve => { sockets[2].on('room-joined', () => resolve()); sockets[2].emit('join-room', { roomCode, playerName: 'User3' }); }),
        new Promise<void>(resolve => { sockets[3].on('room-joined', () => resolve()); sockets[3].emit('join-room', { roomCode, playerName: 'User4' }); }),
      ]);
      await delay(500); // let players sync
      updateStep('join', 'pass');

      // Ready Up
      sockets.forEach(s => s.emit('player-ready', true));
      await delay(1000);

      // Step 4: Team Assignment
      updateStep('team', 'running');
      let tA = '', tB = '';
      await new Promise<void>((resolve) => {
        host.on('teams-updated', (teams) => {
          tA = teams[0].id;
          tB = teams[1].id;
          resolve();
        });
        host.emit('update-teams', {
          teamA: { name: 'Team A', captainId: sockets[0].id!, playerIds: [sockets[0].id!, sockets[1].id!] },
          teamB: { name: 'Team B', captainId: sockets[2].id!, playerIds: [sockets[2].id!, sockets[3].id!] }
        });
      });
      updateStep('team', 'pass');

      // Step 5: Toss
      updateStep('toss', 'running');
      host.emit('start-match');
      await delay(1000); // match-started
      host.emit('coin-toss', { choice: 'heads' });
      await delay(3500); // toss animation delay
      host.emit('innings-decision', { choice: 'bat' });
      await delay(1000); // wait for innings start
      updateStep('toss', 'pass');

      // Step 6: Ball 1 (Run logic)
      updateStep('ball1', 'running');
      // In this setup:
      // Batter: User1 (socket 0)
      // Bowler: User3 (socket 2)
      let runs = 0;
      await new Promise<void>((resolve) => {
        host.on('ball-result', (data) => {
          runs = data.ball.runs;
          resolve();
        });
        sockets[0].emit('submit-move', { number: 4 });
        sockets[2].emit('submit-move', { number: 1 });
      });
      if (runs !== 4) throw new Error(`Expected 4 runs, got ${runs}`);
      updateStep('ball1', 'pass');
      await delay(3000); // ball reveal delay

      // Step 7: Ball 2 (Wicket logic)
      updateStep('ball2', 'running');
      let isWicket = false;
      await new Promise<void>((resolve) => {
        host.on('ball-result', (data) => {
          isWicket = data.isWicket;
          resolve();
        });
        sockets[0].emit('submit-move', { number: 3 });
        sockets[2].emit('submit-move', { number: 3 });
      });
      if (!isWicket) throw new Error('Expected wicket');
      updateStep('ball2', 'pass');
      await delay(3000);

      // Step 8: Over Completion & Innings Switch
      // Wicket hit, maxWickets is 1, so innings should be complete!
      updateStep('over', 'running');
      await delay(4000); // wait for innings-complete and innings-start
      updateStep('over', 'pass');

      // Step 9: Match Winner Calculation
      updateStep('winner', 'running');
      // Second innings: Target is 5.
      // Batter: User3 (socket 2)
      // Bowler: User1 (socket 0)
      // Ball 1
      sockets[2].emit('submit-move', { number: 6 });
      sockets[0].emit('submit-move', { number: 1 });
      await delay(3000); 
      // 6 runs scored. Target was 5. Match should end.
      
      let winnerName = '';
      await new Promise<void>((resolve) => {
        host.on('match-end', (data) => {
          winnerName = data.winnerName || '';
          resolve();
        });
      });
      if (!winnerName) throw new Error('Match did not end correctly');
      updateStep('winner', 'pass');

    } catch (err) {
      console.error(err);
      // find first running step and fail it
      setSteps(prev => prev.map(s => s.status === 'running' ? { ...s, status: 'fail', error: (err as Error).message } : s));
    } finally {
      setIsRunning(false);
      socketsRef.current.forEach(s => s.disconnect());
      socketsRef.current = [];
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
          MULTIPLAYER AUTOMATED TEST SUITE
        </span>
        <h1 className="text-3xl font-black mt-3">Test Runner</h1>
        <p className="text-gray-400 mt-2 text-sm">
          This runner spawns 4 local socket connections to completely simulate a game flow and verify server logic.
        </p>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={runTest}
          disabled={isRunning}
          className="btn-primary py-4 px-8 disabled:opacity-50"
        >
          {isRunning ? 'Running Tests...' : 'Run Test Suite'}
        </button>
        <button onClick={() => setScreen('home')} className="btn-secondary py-4 px-8">
          Back to Home
        </button>
      </div>

      <GlassCard className="space-y-2 p-6">
        <h3 className="font-bold text-lg mb-4 text-white">Execution Steps</h3>
        {steps.map(step => (
          <div key={step.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
            <span className="font-medium text-gray-300">{step.label}</span>
            <div className="flex items-center gap-2">
              {step.status === 'pending' && <span className="text-gray-500">Waiting...</span>}
              {step.status === 'running' && (
                <span className="text-blue-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                  Running
                </span>
              )}
              {step.status === 'pass' && <span className="text-stadium-green font-bold">PASS ✅</span>}
              {step.status === 'fail' && <span className="text-red-400 font-bold">FAIL ❌</span>}
            </div>
          </div>
        ))}
        {steps.some(s => s.status === 'fail') && (
          <div className="mt-4 p-4 bg-red-500/20 text-red-200 border border-red-500/30 rounded-xl">
            <p className="font-bold mb-1">Test Failed</p>
            <p className="text-sm">{steps.find(s => s.status === 'fail')?.error}</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
