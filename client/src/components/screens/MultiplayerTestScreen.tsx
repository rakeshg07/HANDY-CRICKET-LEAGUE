'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { CreateRoomModal } from '@/components/modals/CreateRoomModal';
import { JoinRoomModal } from '@/components/modals/JoinRoomModal';
import { useGameStore } from '@/store/gameStore';
import { sounds } from '@/lib/sounds';

const TEST_PLAYERS = ['User1', 'User2', 'User3', 'User4'];

export function MultiplayerTestScreen() {
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinName, setJoinName] = useState('User2');
  const { room, setScreen } = useGameStore();

  const openTab = () => {
    sounds.click();
    window.open(window.location.origin, '_blank');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <span className="text-xs px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full">
          MULTIPLAYER TEST MODE
        </span>
        <h1 className="text-3xl font-black mt-3">Test With Real Players</h1>
        <p className="text-gray-400 mt-2 text-sm">
          Each browser tab = one player on their own device. No single user can control both batting and bowling.
        </p>
      </div>

      <GlassCard strong>
        <h2 className="font-bold text-stadium-green mb-4">How to Test (4 Tabs)</h2>
        <ol className="space-y-3 text-sm text-gray-300 list-decimal list-inside">
          <li>
            <strong>Tab 1:</strong> Create Room as <code className="text-stadium-green">User1</code> (host)
          </li>
          <li>Copy the room code and open 3 more tabs</li>
          <li>
            <strong>Tabs 2–4:</strong> Join with <code className="text-stadium-green">User2</code>,{' '}
            <code className="text-stadium-green">User3</code>, <code className="text-stadium-green">User4</code>
          </li>
          <li>All players ready up → Host assigns teams → Start match</li>
          <li>
            Only the <strong>current batter</strong> and <strong>current bowler</strong> see hand buttons
          </li>
          <li>Everyone else sees &quot;Waiting for your turn&quot;</li>
        </ol>
      </GlassCard>

      <div className="grid sm:grid-cols-2 gap-3">
        <button
          onClick={() => { sounds.click(); setCreateOpen(true); }}
          className="btn-primary py-4"
        >
          Tab 1: Create Room (User1)
        </button>
        <button onClick={openTab} className="btn-secondary py-4">
          Open New Tab
        </button>
      </div>

      <GlassCard>
        <h3 className="font-bold mb-3">Quick Join (Tabs 2–4)</h3>
        <div className="space-y-3">
          <select
            className="input-field"
            value={joinName}
            onChange={(e) => setJoinName(e.target.value)}
          >
            {TEST_PLAYERS.slice(1).map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          <button
            onClick={() => { sounds.click(); setJoinOpen(true); }}
            className="btn-secondary w-full"
          >
            Join as {joinName}
          </button>
        </div>
      </GlassCard>

      {room && (
        <GlassCard className="border-stadium-green/30 text-center">
          <p className="text-sm text-gray-400">Active Room</p>
          <p className="text-3xl font-mono font-black text-stadium-green tracking-widest">{room.code}</p>
          <p className="text-sm text-gray-500 mt-2">{room.players.length} players connected</p>
          <button onClick={() => setScreen('lobby')} className="btn-primary mt-4 w-full">
            Go to Lobby
          </button>
        </GlassCard>
      )}

      <GlassCard>
        <h3 className="font-bold text-stadium-green mb-2">What to Verify</h3>
        <ul className="text-sm text-gray-400 space-y-1 list-disc list-inside">
          <li>Room joining with unique names per tab</li>
          <li>Team creation (User1+User2 vs User3+User4)</li>
          <li>Only batter sees batting controls</li>
          <li>Only bowler sees bowling controls</li>
          <li>Hidden moves until both submit</li>
          <li>OUT when numbers match</li>
          <li>Runs = batter number when different</li>
          <li>Batsman rotation on OUT</li>
          <li>Bowler rotation each over</li>
          <li>Innings switch and match completion</li>
        </ul>
      </GlassCard>

      <CreateRoomModal open={createOpen} onClose={() => setCreateOpen(false)} defaultPlayerName="User1" />
      <JoinRoomModal open={joinOpen} onClose={() => setJoinOpen(false)} defaultPlayerName={joinName} />
    </div>
  );
}
