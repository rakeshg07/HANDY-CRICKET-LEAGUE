'use client';

import { useState } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { useGameStore } from '@/store/gameStore';
import { useOfflineMatchStore } from '@/store/offlineMatchStore';

export function DebugOverlay() {
  const developerMode = useSettingsStore((s) => s.developerMode);
  const [expanded, setExpanded] = useState(false);
  const gameState = useGameStore();
  const offlineMatch = useOfflineMatchStore((s) => s.match);

  if (!developerMode) return null;

  const state = {
    screen: gameState.screen,
    connected: gameState.isConnected,
    room: gameState.room,
    match: gameState.match,
    scoreboard: gameState.scoreboard,
    offlineMatch,
    ballHistory: gameState.ballHistory.length,
  };

  return (
    <div className="fixed top-16 right-4 z-40 w-72">
      <button
        onClick={() => setExpanded(!expanded)}
        className="glass px-3 py-1 text-xs text-yellow-400 rounded-lg w-full text-left"
      >
        {expanded ? '▼' : '▶'} Live State JSON
      </button>
      {expanded && (
        <pre className="glass mt-1 p-2 text-[10px] text-gray-400 overflow-auto max-h-64 rounded-lg">
          {JSON.stringify(state, null, 2)}
        </pre>
      )}
    </div>
  );
}
