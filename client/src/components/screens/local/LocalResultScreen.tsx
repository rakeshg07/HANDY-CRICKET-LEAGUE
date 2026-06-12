'use client';

import { useLocalGameStore } from '@/store/localGameStore';
import { useGameStore } from '@/store/gameStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

export function LocalResultScreen() {
  const { matchEnd, match, userPlayerId, aiProfile, resetLocalGame } = useLocalGameStore();
  const setGameScreen = useGameStore((s) => s.setScreen);

  if (!matchEnd || !match) return null;

  // Identify which team score belongs to the user
  const userTeamId = match.teams[0].id; // Team 0 is always "You"
  const userScore = matchEnd.teamAScore.teamId === userTeamId ? matchEnd.teamAScore : matchEnd.teamBScore;
  const aiScore = matchEnd.teamAScore.teamId === userTeamId ? matchEnd.teamBScore : matchEnd.teamAScore;
  const didWin = matchEnd.winnerId === userTeamId;
  const isDraw = matchEnd.isDraw;

  const handlePlayAgain = () => {
    resetLocalGame();
    setGameScreen('local-config');
  };

  const handleBackToHome = () => {
    resetLocalGame();
    setGameScreen('home');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pt-10 px-4 pb-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="text-center space-y-4"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: 3, duration: 0.6 }}
          className="text-7xl mb-4"
        >
          {isDraw ? '🤝' : didWin ? '🏆' : '💀'}
        </motion.div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tight">
          {isDraw ? 'Match Tied!' : didWin ? 'You Won!' : 'You Lost!'}
        </h1>
        <p className="text-xl text-blue-200 font-medium">
          {isDraw
            ? 'A nail-biting finish!'
            : didWin
              ? `You defeated ${aiProfile?.avatar} ${aiProfile?.name}!`
              : `${aiProfile?.avatar} ${aiProfile?.name} outsmarted you.`}
        </p>
      </motion.div>

      <GlassCard className="p-6">
        <h2 className="text-lg font-bold text-white/80 mb-6 text-center border-b border-white/10 pb-3 uppercase tracking-wider">
          Scorecard
        </h2>

        <div className="space-y-4">
          {/* Your Score */}
          <div className={`p-5 rounded-xl border transition-all ${
            didWin ? 'bg-green-500/15 border-green-500/40' : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-white/60 mb-1">You</div>
                <div className="text-3xl font-black text-white">
                  {userScore.runs}<span className="text-white/40">/{userScore.wickets}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/60 mb-1">Overs</div>
                <div className="text-xl font-medium text-white/80">
                  {userScore.overs}.{userScore.balls}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/60 mb-1">RR</div>
                <div className="text-lg font-medium text-white/70">
                  {userScore.runRate?.toFixed(2) ?? '0.00'}
                </div>
              </div>
            </div>
          </div>

          {/* AI Score */}
          <div className={`p-5 rounded-xl border transition-all ${
            !didWin && !isDraw ? 'bg-red-500/15 border-red-500/40' : 'bg-white/5 border-white/10'
          }`}>
            <div className="flex justify-between items-center">
              <div>
                <div className="text-sm text-white/60 mb-1">{aiProfile?.avatar} {aiProfile?.name}</div>
                <div className="text-3xl font-black text-white">
                  {aiScore.runs}<span className="text-white/40">/{aiScore.wickets}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/60 mb-1">Overs</div>
                <div className="text-xl font-medium text-white/80">
                  {aiScore.overs}.{aiScore.balls}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-white/60 mb-1">RR</div>
                <div className="text-lg font-medium text-white/70">
                  {aiScore.runRate?.toFixed(2) ?? '0.00'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="flex gap-4">
        <Button onClick={handlePlayAgain} className="flex-1" variant="outline" size="lg">
          ♻️ Play Again
        </Button>
        <Button onClick={handleBackToHome} className="flex-1" size="lg">
          🏠 Home
        </Button>
      </div>
    </div>
  );
}
