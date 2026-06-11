'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { useGameStore } from '@/store/gameStore';
import { useSocket } from '@/hooks/useSocket';
import { Player } from '@hcl/shared';
import { sounds } from '@/lib/sounds';

export function TeamScreen() {
  const { room, playerId } = useGameStore();
  const { updateTeams } = useSocket();

  const [teamAName, setTeamAName] = useState('Team Alpha');
  const [teamBName, setTeamBName] = useState('Team Beta');
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>([]);
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState(2);

  const isHost = room?.players.find((p) => p.id === playerId)?.isHost ?? false;

  useEffect(() => {
    if (!room) return;
    const half = Math.floor(room.players.length / 2);
    setTeamSize(half || 1);
    setTeamAPlayers(room.players.slice(0, half).map((p) => p.id));
    setTeamBPlayers(room.players.slice(half, half * 2).map((p) => p.id));
  }, [room]);

  if (!room) return null;

  const unassigned = room.players.filter(
    (p) => !teamAPlayers.includes(p.id) && !teamBPlayers.includes(p.id)
  );

  const moveToTeam = (playerId: string, team: 'A' | 'B') => {
    setTeamAPlayers((prev) => prev.filter((id) => id !== playerId));
    setTeamBPlayers((prev) => prev.filter((id) => id !== playerId));
    if (team === 'A') {
      setTeamAPlayers((prev) => [...prev, playerId]);
    } else {
      setTeamBPlayers((prev) => [...prev, playerId]);
    }
  };

  const autoBalance = () => {
    if (!room) return;
    const half = Math.floor(room.players.length / 2);
    setTeamAPlayers(room.players.slice(0, half).map((p) => p.id));
    setTeamBPlayers(room.players.slice(half, half * 2).map((p) => p.id));
    sounds.click();
  };

  const handleSave = () => {
    if (teamAPlayers.length !== teamBPlayers.length) return;
    if (teamAPlayers.length === 0) return;

    sounds.click();
    updateTeams(
      { name: teamAName, playerIds: teamAPlayers, captainId: teamAPlayers[0] },
      { name: teamBName, playerIds: teamBPlayers, captainId: teamBPlayers[0] }
    );
    useGameStore.getState().setScreen('lobby');
  };

  const PlayerChip = ({ player, team }: { player: Player; team?: 'A' | 'B' }) => (
    <div className="flex items-center justify-between p-2 glass rounded-lg text-sm">
      <span>{player.name}</span>
      {isHost && !team && (
        <div className="flex gap-1">
          <button
            onClick={() => moveToTeam(player.id, 'A')}
            className="px-2 py-0.5 text-xs bg-stadium-green/20 text-stadium-green rounded"
          >
            A
          </button>
          <button
            onClick={() => moveToTeam(player.id, 'B')}
            className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded"
          >
            B
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-4 relative z-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-black text-center">Team Formation</h1>

        <div className="grid md:grid-cols-2 gap-4">
          <GlassCard>
            <input
              className="input-field mb-3 text-center font-bold"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              disabled={!isHost}
            />
            <p className="text-xs text-stadium-green mb-2">{teamAPlayers.length} players</p>
            {teamAPlayers.map((id) => {
              const p = room.players.find((pl) => pl.id === id);
              return p ? <PlayerChip key={id} player={p} team="A" /> : null;
            })}
          </GlassCard>

          <GlassCard>
            <input
              className="input-field mb-3 text-center font-bold"
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              disabled={!isHost}
            />
            <p className="text-xs text-blue-400 mb-2">{teamBPlayers.length} players</p>
            {teamBPlayers.map((id) => {
              const p = room.players.find((pl) => pl.id === id);
              return p ? <PlayerChip key={id} player={p} team="B" /> : null;
            })}
          </GlassCard>
        </div>

        {unassigned.length > 0 && (
          <GlassCard>
            <p className="text-sm text-gray-400 mb-2">Unassigned</p>
            {unassigned.map((p) => (
              <PlayerChip key={p.id} player={p} />
            ))}
          </GlassCard>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => useGameStore.getState().setScreen('lobby')}
            className="btn-ghost flex-1 min-w-[120px]"
          >
            Back to Lobby
          </button>
          {isHost && (
            <>
              <button onClick={autoBalance} className="btn-secondary flex-1 min-w-[120px]">
                Auto-Balance
              </button>
              <button
                onClick={handleSave}
                disabled={teamAPlayers.length !== teamBPlayers.length || teamAPlayers.length === 0}
                className="btn-primary flex-1 min-w-[120px] disabled:opacity-50"
              >
                Save Teams
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
