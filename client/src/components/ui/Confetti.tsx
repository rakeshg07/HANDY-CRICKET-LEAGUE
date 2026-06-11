'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const COLORS = ['#22c55e', '#4ade80', '#fbbf24', '#f472b6', '#60a5fa', '#a78bfa'];

export function Confetti() {
  const [pieces, setPieces] = useState<{ id: number; x: number; color: string; delay: number }[]>([]);

  useEffect(() => {
    setPieces(
      Array.from({ length: 60 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        delay: Math.random() * 0.5,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: 0 }}
          animate={{ y: '110vh', rotate: 720, opacity: 0 }}
          transition={{ duration: 3 + Math.random() * 2, delay: p.delay, ease: 'easeIn' }}
          className="absolute w-3 h-3 rounded-sm"
          style={{ backgroundColor: p.color, left: 0 }}
        />
      ))}
    </div>
  );
}
