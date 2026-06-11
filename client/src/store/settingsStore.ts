'use client';

import { create } from 'zustand';

interface SettingsState {
  developerMode: boolean;
  soundEnabled: boolean;
  setDeveloperMode: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  toggleDeveloperMode: () => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  developerMode: false,
  soundEnabled: true,
  setDeveloperMode: (enabled) => set({ developerMode: enabled }),
  setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
  toggleDeveloperMode: () => set({ developerMode: !get().developerMode }),
}));
