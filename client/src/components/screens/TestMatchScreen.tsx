'use client';

import { useEffect } from 'react';
import { HAND_NUMBERS } from '@hcl/shared';
import { GlassCard } from '@/components/ui/GlassCard';
import { HandButton } from '@/components/ui/HandButton';
import { BallReveal } from '@/components/game/BallReveal';
import { Scoreboard } from '@/components/game/Scoreboard';
import { BallHistory } from '@/components/game/BallHistory';
import { Confetti } from '@/components/ui/Confetti';
import { useOfflineMatchStore } from '@/store/offlineMatchStore';
import { useProfileStore } from '@/store/profileStore';
import { useGameStore } from '@/store/gameStore';
import { buildOfflineScoreboard } from '@/lib/offlineEngine';
import { sounds } from '@/lib/sounds';
import { formatOvers } from '@hcl/shared';

export function TestMatchScreen() {
  const {
    match,
    lastResult,
    showReveal,
    pendingBowler,
    pendingBatsman,
    initMatch,
    setBowlerChoice,
    setBatsmanChoice,
    submitChoices,
    simulateRandom,
    switchInnings,
    restartMatch,
    dismissReveal,
  } = useOfflineMatchStore();

  const recordMatch = useProfileStore((s) => s.recordMatch);
  const setScreen = useGameStore((s) => s.setScreen);

  useEffect(() => {
    if (!match) initMatch('T10', 2, 10, 'Test Match');
  }, [match, initMatch]);

  useEffect(() => {
    if (showReveal && lastResult) {
      const t = setTimeout(dismissReveal, 2500);
      return () => clearTimeout(t);
    }
  }, [showReveal, lastResult, dismissReveal]);

  if (!match) return null;

  const scoreboard = buildOfflineScoreboard(match);
  const canSubmit = pendingBowler !== null && pendingBatsman !== null;
  const isResult = match.phase === 'result' && match.result;

  const handleResultContinue = () => {
    if (!match.result) return;
    const myRuns = match.innings.find((i) => i.battingTeamId === match.teamA.id)?.runs ?? 0;
    const won = match.result.winnerId === match.teamA.id;
    recordMatch(
      won ? 'win' : match.result.isDraw ? 'draw' : 'loss',
      myRuns,
      match.teamB.name,
      `${match.result.teamAScore.runs}/${match.result.teamAScore.wickets}`
    );
    restartMatch();
  };

  if (isResult && match.result) {
    const margin = Math.abs(match.result.teamAScore.runs - match.result.teamBScore.runs);
    return (
      <div className="min-h-screen p-4 relative">
        {!match.result.isDraw && <Confetti />}
        <div className="max-w-lg mx-auto space-y-6 pt-8">
          <GlassCard strong className="text-center">
            <div className="text-6xl mb-4">{match.result.isDraw ? '🤝' : '🏆'}</div>
            <h1 className="text-3xl font-black text-stadium-green">
              {match.result.isDraw ? 'DRAW' : `${match.result.winnerName} Wins!`}
            </h1>
            {!match.result.isDraw && (
              <p className="text-gray-400 mt-2">by {margin} runs</p>
            )}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="glass p-4 rounded-xl">
                <p className="text-sm text-gray-400">{match.result.teamAScore.teamName}</p>
                <p className="text-2xl font-black">
                  {match.result.teamAScore.runs}/{match.result.teamAScore.wickets}
                </p>
                <p className="text-xs text-gray-500">
                  {formatOvers(match.result.teamAScore.overs, match.result.teamAScore.balls)} ov
                </p>
              </div>
              <div className="glass p-4 rounded-xl">
                <p className="text-sm text-gray-400">{match.result.teamBScore.teamName}</p>
                <p className="text-2xl font-black">
                  {match.result.teamBScore.runs}/{match.result.teamBScore.wickets}
                </p>
                <p className="text-xs text-gray-500">
                  {formatOvers(match.result.teamBScore.overs, match.result.teamBScore.balls)} ov
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleResultContinue} className="btn-primary flex-1">
                Play Again
              </button>
              <button onClick={() => setScreen('home')} className="btn-secondary flex-1">
                Back to Home
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4 pb-24">
      <div className="text-center">
        <span className="text-xs px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
          OFFLINE TEST MODE
        </span>
        <h1 className="text-2xl font-black mt-2">{match.settings.matchName}</h1>
        <p className="text-gray-500 text-sm">
          Innings {match.currentInnings} • {match.settings.overs === 9999 ? 'Unlimited' : match.settings.overs} overs
        </p>
      </div>

      {match.phase === 'break' && (
        <GlassCard className="text-center border-yellow-500/30">
          <p className="text-yellow-400 font-bold">Innings Break!</p>
          <p className="text-sm text-gray-400 mt-1">Target: {match.innings[0].runs + 1} runs</p>
          <button onClick={switchInnings} className="btn-primary mt-4">
            Start 2nd Innings
          </button>
        </GlassCard>
      )}

      {match.phase === 'innings' && (
        <>
          <Scoreboard scoreboard={scoreboard} />
          {showReveal && lastResult && <BallReveal result={lastResult} />}

          <GlassCard>
            <p className="text-center text-sm text-gray-400 mb-4">
              Select both bowling and batting numbers, then simulate
            </p>

            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase mb-2 text-center">Bowler Choice</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 justify-items-center">
                {HAND_NUMBERS.map((n) => (
                  <HandButton
                    key={`b-${n}`}
                    number={n}
                    selected={pendingBowler === n}
                    onClick={(num) => { sounds.select(); setBowlerChoice(num); }}
                  />
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs text-gray-500 uppercase mb-2 text-center">Batsman Choice</p>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 justify-items-center">
                {HAND_NUMBERS.map((n) => (
                  <HandButton
                    key={`s-${n}`}
                    number={n}
                    selected={pendingBatsman === n}
                    onClick={(num) => { sounds.select(); setBatsmanChoice(num); }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitChoices}
                disabled={!canSubmit}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                Simulate Ball
              </button>
              <button onClick={simulateRandom} className="btn-secondary flex-1">
                Random Ball
              </button>
            </div>
          </GlassCard>

          <BallHistory balls={match.balls} />
        </>
      )}
    </div>
  );
}
