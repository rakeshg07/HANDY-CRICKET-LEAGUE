'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { HAND_EMOJIS, HAND_NUMBERS } from '@hcl/shared';

function RuleExample({
  bowler,
  batsman,
  result,
  isOut,
  delay = 0,
}: {
  bowler: number;
  batsman: number;
  result: string;
  isOut: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="flex items-center justify-center gap-4 p-4 glass rounded-xl"
    >
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-1">Bowler</p>
        <div className="text-3xl">{HAND_EMOJIS[bowler as keyof typeof HAND_EMOJIS]}</div>
        <p className="font-bold">{bowler}</p>
      </div>
      <span className="text-stadium-green font-black">VS</span>
      <div className="text-center">
        <p className="text-xs text-gray-500 mb-1">Batsman</p>
        <div className="text-3xl">{HAND_EMOJIS[batsman as keyof typeof HAND_EMOJIS]}</div>
        <p className="font-bold">{batsman}</p>
      </div>
      <div className={`font-black text-lg ${isOut ? 'text-red-400' : 'text-stadium-green'}`}>
        {result}
      </div>
    </motion.div>
  );
}

function RuleSection({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <GlassCard className="mb-4">
        <h2 className="text-xl font-bold text-stadium-green mb-3">{title}</h2>
        {children}
      </GlassCard>
    </motion.div>
  );
}

export function RulesScreen() {
  return (
    <div className="max-w-2xl mx-auto p-4 pb-12">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-3xl font-black text-center mb-2"
      >
        How to Play
      </motion.h1>
      <p className="text-center text-gray-400 mb-8">Master the art of hand cricket</p>

      <RuleSection title="🖐️ Hand Signals" delay={0}>
        <p className="text-gray-300 mb-4 text-sm">
          Instead of numbers, use hand emojis. Both players choose simultaneously — no peeking!
        </p>
        <div className="grid grid-cols-7 gap-2">
          {HAND_NUMBERS.map((n) => (
            <div key={n} className="text-center p-2 glass rounded-lg">
              <div className="text-2xl">{HAND_EMOJIS[n]}</div>
              <div className="text-xs font-bold text-stadium-green">{n}</div>
            </div>
          ))}
        </div>
      </RuleSection>

      <RuleSection title="🏏 Batting" delay={0.1}>
        <p className="text-gray-300 text-sm mb-4">
          Pick a hand signal. If your number differs from the bowler&apos;s, you score runs equal to your number.
        </p>
        <RuleExample bowler={2} batsman={5} result="5 RUNS" isOut={false} />
      </RuleSection>

      <RuleSection title="🎯 Bowling" delay={0.2}>
        <p className="text-gray-300 text-sm mb-4">
          Pick a hand signal. If it matches the batsman&apos;s number exactly — they&apos;re OUT!
        </p>
        <RuleExample bowler={4} batsman={4} result="OUT!" isOut={true} />
      </RuleSection>

      <RuleSection title="📊 Scoring" delay={0.3}>
        <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
          <li>Runs = Batsman&apos;s chosen number (when numbers differ)</li>
          <li>6 balls = 1 over</li>
          <li>Run Rate = Runs per 6 balls</li>
          <li>Strike Rate = (Runs / Balls) × 100</li>
        </ul>
      </RuleSection>

      <RuleSection title="👥 Teams" delay={0.4}>
        <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
          <li>Equal team sizes required (2v2, 4v4, 6v6, etc.)</li>
          <li>Each team has batting and bowling order</li>
          <li>One batsman vs one bowler at a time</li>
          <li>Bowler rotates every over</li>
        </ul>
      </RuleSection>

      <RuleSection title="🏆 Match Formats" delay={0.5}>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {[
            { name: 'T10', desc: '10 overs' },
            { name: 'T20', desc: '20 overs' },
            { name: 'TEST', desc: '90 overs' },
            { name: 'CUSTOM', desc: 'Your rules' },
          ].map((f) => (
            <div key={f.name} className="glass p-3 rounded-lg text-center">
              <p className="font-bold text-stadium-green">{f.name}</p>
              <p className="text-gray-500 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>
      </RuleSection>

      <RuleSection title="🥇 Winning" delay={0.6}>
        <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
          <li>Team batting second chases the target (first innings score + 1)</li>
          <li>Exceed target = instant win</li>
          <li>All overs complete = higher score wins</li>
          <li>Equal scores = DRAW (Super Over coming soon)</li>
        </ul>
      </RuleSection>
    </div>
  );
}
