'use client';

import { ReactNode, useEffect } from 'react';
import { Header } from './Header';
import { Particles } from '@/components/ui/Particles';
import { DeveloperPanel } from '@/components/debug/DeveloperPanel';
import { DebugOverlay } from '@/components/debug/DebugOverlay';
import { useProfileStore } from '@/store/profileStore';
import { useGameStore } from '@/store/gameStore';

interface AppShellProps {
  children: ReactNode;
  showHeader?: boolean;
}

export function AppShell({ children, showHeader = true }: AppShellProps) {
  const hydrate = useProfileStore((s) => s.hydrate);
  const screen = useGameStore((s) => s.screen);
  const hideHeader = ['match', 'toss'].includes(screen);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <Particles />
      {showHeader && !hideHeader && <Header />}
      <main className="relative z-10 min-h-[calc(100vh-3.5rem)]">{children}</main>
      <DeveloperPanel />
      <DebugOverlay />
    </>
  );
}
