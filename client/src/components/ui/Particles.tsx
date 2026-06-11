'use client';

import { useEffect, useState } from 'react';

export function Particles() {
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const items = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 8 + Math.random() * 12,
    }));
    setParticles(items);
  }, []);

  return (
    <div className="particles">
      {particles.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
