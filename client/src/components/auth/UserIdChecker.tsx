'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface UserIdCheckerProps {
  userId: string;
  onValidChange: (isValid: boolean) => void;
}

export function UserIdChecker({ userId, onValidChange }: UserIdCheckerProps) {
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!userId) {
      setStatus('idle');
      setMessage('');
      onValidChange(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(userId)) {
      setStatus('invalid');
      setMessage('3-20 chars, letters, numbers, underscores only');
      onValidChange(false);
      return;
    }

    setStatus('checking');
    
    const timeoutId = setTimeout(async () => {
      try {
        const data = await api.get(`/auth/check-userid/${userId}`);
        if (data.available) {
          setStatus('available');
          setMessage('Available');
          onValidChange(true);
        } else {
          setStatus('taken');
          setMessage('Already Taken');
          onValidChange(false);
        }
      } catch (error) {
        setStatus('idle');
        setMessage('');
        onValidChange(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [userId, onValidChange]);

  if (status === 'idle') return null;

  return (
    <div className="absolute right-3 top-3 text-xs font-bold">
      {status === 'checking' && <span className="text-gray-400">Checking...</span>}
      {status === 'invalid' && <span className="text-red-500">❌ {message}</span>}
      {status === 'taken' && <span className="text-red-500">❌ {message}</span>}
      {status === 'available' && <span className="text-stadium-green">✅ {message}</span>}
    </div>
  );
}
