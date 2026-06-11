'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useGameStore } from '@/store/gameStore';
import { formatOvers } from '@hcl/shared';

export function DeveloperPanel() {
  const developerMode = useSettingsStore((s) => s.developerMode);
  const [collapsed, setCollapsed] = useState(false);
  const {
    screen,
    isConnected,
    room,
    scoreboard,
    liveState,
    myRole,
    playerId,
    movesReceived,
  } = useGameStore();

  if (!developerMode) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-yellow-500/30 max-h-64 overflow-y-auto">
      <div className="flex items-center justify-between px-4 py-2 bg-yellow-500/10">
        <span className="text-xs font-bold text-yellow-400 uppercase">Developer Panel</span>
        <button onClick={() => setCollapsed(!collapsed)} className="text-xs text-gray-400">
          {collapsed ? 'Expand' : 'Collapse'}
        </button>
      </div>

      {!collapsed && (
        <div className="p-4 grid md:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <p className="text-yellow-400 mb-1">Connection</p>
            <p>Screen: {screen}</p>
            <p>Socket: {isConnected ? 'connected' : 'disconnected'}</p>
            <p>Player: {playerId?.slice(0, 8)}...</p>
            <p>Room: {room?.code ?? 'none'}</p>
            <p>My Role: {myRole ?? 'n/a'}</p>
          </div>

          <div>
            <p className="text-yellow-400 mb-1">Live Match</p>
            {scoreboard ? (
              <>
                <p>Score: {scoreboard.battingTeam.runs}/{scoreboard.battingTeam.wickets}</p>
                <p>Overs: {formatOvers(scoreboard.battingTeam.overs, scoreboard.battingTeam.balls)}</p>
                <p>Batter: {liveState?.batsmanName}</p>
                <p>Bowler: {liveState?.bowlerName}</p>
                <p>Moves: {movesReceived}/2</p>
                <p>Phase: {liveState?.ballPhase}</p>
              </>
            ) : (
              <p className="text-gray-500">No active match</p>
            )}
          </div>

          <div>
            <p className="text-yellow-400 mb-1">Player States</p>
            {liveState?.playerStates.map((ps) => (
              <p key={ps.playerId} className={ps.playerId === playerId ? 'text-stadium-green' : ''}>
                {ps.playerName}: {ps.state}
              </p>
            ))}
            <button
              onClick={() => useGameStore.getState().reset()}
              className="mt-2 px-2 py-1 bg-red-500/20 rounded text-red-400"
            >
              Reset Local State
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
