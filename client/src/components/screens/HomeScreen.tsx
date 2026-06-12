'use client';

import { motion } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { useGameStore } from '@/store/gameStore';
import { useProfileStore } from '@/store/profileStore';
import { sounds } from '@/lib/sounds';

export function HomeScreen() {
  const { error, setError, setScreen } = useGameStore();
  const profile = useProfileStore((s) => s.profile);

  return (
    <div className="flex flex-col justify-center items-center gap-4 sm:gap-5 h-full py-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center w-full mt-2 lg:mt-0"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-5xl sm:text-6xl mb-3 drop-shadow-2xl"
        >
          🏏
        </motion.div>
        <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-br from-stadium-green via-emerald-400 to-teal-200 bg-clip-text text-transparent drop-shadow-lg mb-1">
          HCL
        </h1>
        <p className="text-sm sm:text-base font-medium text-emerald-100/70 tracking-widest uppercase">
          Handy Cricket League
        </p>
      </motion.div>

      <GlassCard className="w-full max-w-xs sm:max-w-sm text-center bg-white/5 backdrop-blur-xl border border-white/10 p-4">
        {profile.name ? (
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center text-2xl shadow-inner border border-white/20">
              {profile.avatar}
            </div>
            <div>
              <h3 className="text-lg font-bold">{profile.name}</h3>
              <div className="flex items-center justify-center gap-1.5 mt-0.5 text-xs text-stadium-green font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-stadium-green animate-pulse" />
                Online & Ready
              </div>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <h3 className="text-base text-gray-400">Welcome Guest</h3>
            <p className="text-xs mt-1 text-gray-500 mb-3">Set up your profile to save stats.</p>
            <button
              onClick={() => { sounds.click(); setScreen('profile'); }}
              className="px-4 py-1.5 bg-stadium-green/20 text-stadium-green rounded-full text-xs font-bold hover:bg-stadium-green/30 transition-colors"
            >
              Setup Profile
            </button>
          </div>
        )}
      </GlassCard>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-xs sm:max-w-sm p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-xs flex justify-between items-center shadow-lg">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:text-white transition-colors">✕</button>
        </motion.div>
      )}

      <button
        onClick={() => { sounds.click(); setScreen('local-config'); }}
        className="w-full max-w-xs sm:max-w-sm py-3.5 rounded-xl font-black text-lg sm:text-xl bg-gradient-to-r from-stadium-green to-emerald-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)] hover:scale-[1.02] active:scale-95 transition-all"
      >
        ⚡ QUICK PLAY
      </button>
    </div>
  );
}
