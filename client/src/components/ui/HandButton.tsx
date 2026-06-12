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
    sm: 'w-12 h-12 text-xl',
    md: 'w-14 h-14 sm:w-18 sm:h-18 text-2xl',
    lg: 'w-20 h-20 text-4xl',
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
