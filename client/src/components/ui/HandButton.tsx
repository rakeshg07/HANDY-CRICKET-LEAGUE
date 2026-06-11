'use client';

import { motion } from 'framer-motion';
import { HandNumber } from '@hcl/shared';
import { HAND_EMOJIS } from '@hcl/shared';
import { sounds } from '@/lib/sounds';

interface HandButtonProps {
  number: HandNumber;
  selected?: boolean;
  disabled?: boolean;
  onClick?: (number: HandNumber) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function HandButton({ number, selected, disabled, onClick, size = 'md' }: HandButtonProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-20 h-20 sm:w-24 sm:h-24 text-3xl',
    lg: 'w-28 h-28 text-5xl',
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={() => {
        if (!disabled && onClick) {
          sounds.click();
          onClick(number);
        }
      }}
      disabled={disabled}
      className={`${sizeClasses[size]} rounded-full glass-strong flex flex-col items-center justify-center
        transition-all duration-300 select-none
        ${selected ? 'border-stadium-green bg-stadium-green/20 shadow-neon' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-neon'}`}
    >
      <span className="leading-none">{HAND_EMOJIS[number]}</span>
      <span className="text-xs font-bold text-stadium-green mt-1">{number}</span>
    </motion.button>
  );
}
