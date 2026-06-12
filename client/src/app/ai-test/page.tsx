'use client';

import { useEffect, useState } from 'react';
import {
  MatchEngine,
  generateId,
  resolveMatchSettings,
  Player,
  MatchEndEvent,
} from '@hcl/shared';
import { AIAgent, AIDifficulty } from '@/lib/ai/AIAgent';

interface TestResult {
  id: number;
  winnerId: string | undefined;
  winnerName: string | undefined;
  teamAScore: string;
  teamBScore: string;
  target: number;
  isDraw: boolean;
  passed: boolean;
  error?: string;
}

export default function AITestPage() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(0);
  const TOTAL = 100;

  function runSingleMatch(id: number): TestResult {
    try {
      const p1Id = generateId();
      const p2Id = generateId();

      const p1: Player = {
        id: p1Id, socketId: 's1', name: 'AIPlayer1',
        isHost: true, isReady: true, isConnected: true,
        stats: { runs: 0, ballsFaced: 0, wickets: 0, ballsBowled: 0, runsConceded: 0, strikeRate: 0, economy: 0 },
      };
      const p2: Player = {
        id: p2Id, socketId: 's2', name: 'AIPlayer2',
        isHost: false, isReady: true, isConnected: true,
        stats: { runs: 0, ballsFaced: 0, wickets: 0, ballsBowled: 0, runsConceded: 0, strikeRate: 0, economy: 0 },
      };

      // Random format and difficulty
      const difficulties: AIDifficulty[] = ['EASY', 'MEDIUM', 'HARD', 'LEGEND'];
      const diff1 = difficulties[id % difficulties.length];
      const diff2 = difficulties[(id + 1) % difficulties.length];

      const ai1 = new AIAgent(diff1);
      const ai2 = new AIAgent(diff2);

      const settings = resolveMatchSettings('CUSTOM', { overs: 2, maxWickets: 1, playersPerTeam: 1, matchName: `Test-${id}` });
      settings.maxWickets = 1;

      const teams = MatchEngine.createTeams(
        { name: 'Team A', playerIds: [p1Id], captainId: p1Id },
        { name: 'Team B', playerIds: [p2Id], captainId: p2Id },
      );

      const match = MatchEngine.createMatch('test-room', teams, settings);
      const engine = new MatchEngine(match, [p1, p2]);

      // Toss
      const tossWinner = Math.random() > 0.5 ? p1Id : p2Id;
      const tossChoice = Math.random() > 0.5 ? 'bat' : 'bowl';
      engine.setTossResult(tossWinner, tossChoice as 'bat' | 'bowl');

      // Play first innings
      let safetyCounter = 0;
      const MAX_BALLS = 500; // safety limit

      while (safetyCounter < MAX_BALLS) {
        safetyCounter++;
        const m = engine.getMatch();
        const inn = m.innings[m.currentInnings - 1];
        if (!inn || inn.isComplete) break;

        const batsmanId = inn.currentBatsmanId;
        const bowlerId = inn.currentBowlerId;
        const ls = m.liveState!;

        const batsmanAgent = batsmanId === p1Id ? ai1 : ai2;
        const bowlerAgent = bowlerId === p1Id ? ai1 : ai2;

        const batMove = batsmanAgent.getMove('batsman', inn, ls);
        const bowlMove = bowlerAgent.getMove('bowler', inn, ls);

        engine.submitMove(batsmanId, batMove);
        const res = engine.submitMove(bowlerId, bowlMove);

        if (res && 'ball' in res) {
          // Record user moves for pattern analysis
          if (batsmanId === p1Id) ai2.recordUserMove(batMove);
          else ai1.recordUserMove(batMove);
          if (bowlerId === p1Id) ai2.recordUserMove(bowlMove);
          else ai1.recordUserMove(bowlMove);

          engine.beginBallPhase();
        }
      }

      // Start second innings
      engine.startSecondInnings();

      safetyCounter = 0;
      while (safetyCounter < MAX_BALLS) {
        safetyCounter++;
        const m = engine.getMatch();
        const inn = m.innings[m.currentInnings - 1];
        if (!inn || inn.isComplete) break;

        const batsmanId = inn.currentBatsmanId;
        const bowlerId = inn.currentBowlerId;
        const ls = m.liveState!;

        const batsmanAgent = batsmanId === p1Id ? ai1 : ai2;
        const bowlerAgent = bowlerId === p1Id ? ai1 : ai2;

        const batMove = batsmanAgent.getMove('batsman', inn, ls);
        const bowlMove = bowlerAgent.getMove('bowler', inn, ls);

        engine.submitMove(batsmanId, batMove);
        const res = engine.submitMove(bowlerId, bowlMove);

        if (res && 'ball' in res) {
          if (batsmanId === p1Id) ai2.recordUserMove(batMove);
          else ai1.recordUserMove(batMove);
          if (bowlerId === p1Id) ai2.recordUserMove(bowlMove);
          else ai1.recordUserMove(bowlMove);

          engine.beginBallPhase();
        }
      }

      // Calculate result
      const endEvent: MatchEndEvent = engine.calculateMatchResult();
      const finalMatch = engine.getMatch();

      const inn1 = finalMatch.innings[0];
      const inn2 = finalMatch.innings[1];

      // Validate
      const target = inn1.runs + 1;
      const passed =
        endEvent.result !== undefined &&
        inn1 !== undefined &&
        inn2 !== undefined &&
        target > 0 &&
        (endEvent.isDraw || endEvent.winnerId !== undefined);

      return {
        id,
        winnerId: endEvent.winnerId,
        winnerName: endEvent.winnerName,
        teamAScore: `${endEvent.teamAScore.runs}/${endEvent.teamAScore.wickets} (${endEvent.teamAScore.overs}.${endEvent.teamAScore.balls})`,
        teamBScore: `${endEvent.teamBScore.runs}/${endEvent.teamBScore.wickets} (${endEvent.teamBScore.overs}.${endEvent.teamBScore.balls})`,
        target,
        isDraw: endEvent.isDraw,
        passed,
      };
    } catch (err: any) {
      return {
        id,
        winnerId: undefined,
        winnerName: undefined,
        teamAScore: 'ERR',
        teamBScore: 'ERR',
        target: 0,
        isDraw: false,
        passed: false,
        error: err?.message || String(err),
      };
    }
  }

  const runTests = async () => {
    setRunning(true);
    setResults([]);
    setCompleted(0);

    const allResults: TestResult[] = [];
    for (let i = 0; i < TOTAL; i++) {
      const result = runSingleMatch(i + 1);
      allResults.push(result);
      setResults([...allResults]);
      setCompleted(i + 1);
      // Yield to UI
      await new Promise((r) => setTimeout(r, 0));
    }

    setRunning(false);
  };

  const passCount = results.filter((r) => r.passed).length;
  const failCount = results.filter((r) => !r.passed).length;

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">AI Match Simulator</h1>
            <p className="text-gray-400 mt-1">
              Runs {TOTAL} automated AI vs AI matches to validate the engine
            </p>
          </div>
          <button
            onClick={runTests}
            disabled={running}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 rounded-xl font-bold transition-colors"
          >
            {running ? `Running... ${completed}/${TOTAL}` : 'Run 100 Tests'}
          </button>
        </div>

        {results.length > 0 && (
          <div className="flex gap-4">
            <div className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/40 font-bold text-green-400">
              ✅ PASS: {passCount}
            </div>
            <div className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 font-bold text-red-400">
              ❌ FAIL: {failCount}
            </div>
          </div>
        )}

        {running && (
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
              style={{ width: `${(completed / TOTAL) * 100}%` }}
            />
          </div>
        )}

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {results.map((r) => (
            <div
              key={r.id}
              className={`flex items-center gap-4 p-3 rounded-lg border text-sm ${
                r.passed
                  ? 'bg-green-500/5 border-green-500/20'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <span className="font-mono w-10 text-gray-500">#{r.id}</span>
              <span className={`font-bold w-12 ${r.passed ? 'text-green-400' : 'text-red-400'}`}>
                {r.passed ? 'PASS' : 'FAIL'}
              </span>
              <span className="text-gray-300 flex-1">
                A: {r.teamAScore} | B: {r.teamBScore} | Target: {r.target}
              </span>
              <span className="text-gray-400">
                {r.isDraw ? 'DRAW' : `Winner: ${r.winnerName}`}
              </span>
              {r.error && <span className="text-red-400 text-xs truncate max-w-xs">{r.error}</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
