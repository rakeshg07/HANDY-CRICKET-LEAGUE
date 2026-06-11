'use client';

import { MatchLiveState, PlayerMatchState } from '@hcl/shared';

const STATE_STYLES: Record<PlayerMatchState, string> = {
  BATTING: 'bg-stadium-green/30 text-stadium-green border-stadium-green/50',
  BOWLING: 'bg-blue-500/30 text-blue-300 border-blue-500/50',
  WAITING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  SPECTATING: 'bg-white/5 text-gray-400 border-white/10',
  OUT: 'bg-red-500/20 text-red-400 border-red-500/30',
};

interface PlayerRoleBarProps {
  liveState: MatchLiveState | null;
  myPlayerId: string | null;
}

export function PlayerRoleBar({ liveState, myPlayerId }: PlayerRoleBarProps) {
  if (!liveState) return null;

  const myState = liveState.playerStates.find((p) => p.playerId === myPlayerId);

  return (
    <div className="glass p-3 rounded-xl space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span>
          🏏 <strong>{liveState.batsmanName}</strong>
        </span>
        <span className="text-stadium-green font-bold">VS</span>
        <span>
          🎯 <strong>{liveState.bowlerName}</strong>
        </span>
      </div>

      {myState && (
        <div className={`text-center text-xs font-bold py-1.5 rounded-lg border ${STATE_STYLES[myState.state]}`}>
          Your role: {myState.state}
          {myState.state === 'BATTING' && ' — pick your shot!'}
          {myState.state === 'BOWLING' && ' — pick your bowl!'}
          {(myState.state === 'SPECTATING' || myState.state === 'WAITING') && ' — waiting for your turn'}
        </div>
      )}

      <div className="flex flex-wrap gap-1 justify-center">
        {liveState.playerStates.map((ps) => (
          <span
            key={ps.playerId}
            className={`text-[10px] px-2 py-0.5 rounded-full border ${STATE_STYLES[ps.state]} ${
              ps.playerId === myPlayerId ? 'ring-1 ring-white/30' : ''
            }`}
          >
            {ps.playerName}: {ps.state}
          </span>
        ))}
      </div>
    </div>
  );
}
