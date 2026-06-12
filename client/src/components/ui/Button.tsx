'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, disabled, ...props }, ref) => {
    const base =
      'inline-flex items-center justify-center font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants: Record<string, string> = {
      primary:
        'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg hover:shadow-blue-500/30 hover:brightness-110',
      outline:
        'border-2 border-white/20 text-white bg-white/5 hover:bg-white/10 hover:border-white/40',
      ghost: 'text-white/70 hover:text-white hover:bg-white/10',
    };

    const sizes: Record<string, string> = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-base px-5 py-2.5',
      lg: 'text-lg px-7 py-3.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
