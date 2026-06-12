'use client';

import { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useLocalGameStore } from '@/store/localGameStore';
import { useGameStore } from '@/store/gameStore';
import { MatchFormat, MatchSettings } from '@hcl/shared';
import { AIDifficulty, AI_PROFILES } from '@/lib/ai/AIAgent';

export function LocalConfigScreen() {
  const [format, setFormat] = useState<MatchFormat>('T10');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('EASY');
  const [overs, setOvers] = useState(1);
  const [teamSize, setTeamSize] = useState(1);
  const startMatch = useLocalGameStore((s) => s.startMatch);
  const setGameScreen = useGameStore((s) => s.setScreen);

  const handleStart = () => {
    startMatch(format, { overs, maxWickets: teamSize, playersPerTeam: teamSize, matchName: 'Quick Play' }, difficulty);
    setGameScreen('local-toss');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-10 px-4">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={() => setGameScreen('home')}>
          ← Back
        </Button>
        <h1 className="text-3xl font-black text-white uppercase tracking-tight">Quick Play Mode</h1>
      </div>

      <GlassCard className="p-6 space-y-8">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white/90">Select Difficulty</h2>
          <div className="grid grid-cols-2 gap-4">
            {AI_PROFILES.map((p) => (
              <button
                key={p.difficulty}
                onClick={() => setDifficulty(p.difficulty)}
                className={`p-4 rounded-xl text-left transition-all ${
                  difficulty === p.difficulty
                    ? 'bg-blue-600/30 border-2 border-blue-400'
                    : 'bg-white/5 border-2 border-transparent hover:bg-white/10'
                }`}
              >
                <div className="text-2xl mb-2">{p.avatar}</div>
                <div className="font-bold text-white">{p.name}</div>
                <div className="text-xs text-blue-300 font-mono mt-1">{p.difficulty}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white/90">Match Settings</h2>
          <div className="flex flex-wrap gap-3">
            {['CUSTOM', 'T10', 'T20', 'TEST'].map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f as MatchFormat)}
                className={`px-4 py-2 rounded-full font-bold transition-all ${
                  format === f
                    ? 'bg-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {f === 'CUSTOM' ? 'Custom Format' : f}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/70">Players Per Team</label>
              <input
                type="number"
                min="1"
                max="11"
                value={teamSize}
                onChange={(e) => setTeamSize(Number(e.target.value))}
                className="w-full bg-black/30 border border-white/20 rounded-lg px-3 py-2 text-white"
              />
            </div>
            
            {format === 'CUSTOM' && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Overs (1-50): {overs}</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={overs}
                  onChange={(e) => setOvers(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        <Button onClick={handleStart} size="lg" className="w-full text-lg shadow-[0_0_30px_rgba(59,130,246,0.3)]">
          Play Ball
        </Button>
      </GlassCard>
    </div>
  );
}
