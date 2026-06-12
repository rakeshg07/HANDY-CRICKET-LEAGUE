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
    <div className="flex flex-col justify-center items-center gap-8 h-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center w-full mt-4 lg:mt-0"
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="text-8xl mb-6 drop-shadow-2xl"
        >
          🏏
        </motion.div>
        <h1 className="text-5xl sm:text-7xl font-black bg-gradient-to-br from-stadium-green via-emerald-400 to-teal-200 bg-clip-text text-transparent drop-shadow-lg mb-2">
          HCL
        </h1>
        <p className="text-xl font-medium text-emerald-100/70 tracking-widest uppercase">
          Handy Cricket League
        </p>
      </motion.div>

      <GlassCard className="w-full max-w-md text-center bg-white/5 backdrop-blur-xl border border-white/10">
        {profile.name ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center text-4xl shadow-inner border border-white/20">
              {profile.avatar}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{profile.name}</h3>
              <div className="flex items-center justify-center gap-2 mt-1 text-sm text-stadium-green font-medium">
                <span className="w-2 h-2 rounded-full bg-stadium-green animate-pulse" />
                Online & Ready
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4">
            <h3 className="text-xl text-gray-400">Welcome Guest</h3>
            <p className="text-sm mt-2 text-gray-500 mb-4">Set up your profile to save stats.</p>
            <button
              onClick={() => { sounds.click(); setScreen('profile'); }}
              className="px-6 py-2 bg-stadium-green/20 text-stadium-green rounded-full font-bold hover:bg-stadium-green/30 transition-colors"
            >
              Setup Profile
            </button>
          </div>
        )}
      </GlassCard>

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-md p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm flex justify-between items-center shadow-lg">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="hover:text-white transition-colors">✕</button>
        </motion.div>
      )}

      <button
        onClick={() => { sounds.click(); setScreen('local-config'); }}
        className="w-full max-w-md py-5 rounded-2xl font-black text-2xl bg-gradient-to-r from-stadium-green to-emerald-500 text-white shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:shadow-[0_0_60px_rgba(34,197,94,0.6)] hover:scale-[1.02] active:scale-95 transition-all"
      >
        ⚡ QUICK PLAY
      </button>
    </div>
  );
}
