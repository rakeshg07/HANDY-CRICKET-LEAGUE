'use client';

import { useAuthStore } from '@/store/authStore';
import { GlassCard } from '@/components/ui/GlassCard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null; // ProtectedRoute handles redirect

  const winRate = user.matchesPlayed > 0 
    ? Math.round((user.wins / user.matchesPlayed) * 100) 
    : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen p-4 py-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-black text-stadium-green-glow">Player Profile</h1>
          <Link href="/" className="btn-secondary text-sm">Back to Game</Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Identity Card */}
          <GlassCard className="col-span-1" strong>
            <div className="flex flex-col items-center text-center">
              <div className="w-32 h-32 rounded-full bg-gray-800 mb-4 border-4 border-stadium-green overflow-hidden">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.userId} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">👤</div>
                )}
              </div>
              <h2 className="text-2xl font-bold">{user.fullName}</h2>
              <p className="text-stadium-green font-mono mb-2">@{user.userId}</p>
              <div className="flex items-center space-x-2 text-sm text-gray-400 mb-6">
                <span>📍 {user.country}</span>
                <span>•</span>
                <span>Rank {user.rank}</span>
              </div>

              <div className="w-full pt-4 border-t border-stadium-border/50">
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition-colors w-full text-left px-2 py-2 rounded hover:bg-red-500/10 flex items-center justify-between">
                  <span>Logout</span>
                  <span>🚪</span>
                </button>
              </div>
            </div>
          </GlassCard>

          {/* Stats Cards */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <GlassCard className="text-center p-4">
                <div className="text-sm text-gray-400 mb-1">Matches</div>
                <div className="text-3xl font-black text-white">{user.matchesPlayed}</div>
              </GlassCard>
              <GlassCard className="text-center p-4">
                <div className="text-sm text-gray-400 mb-1">Wins</div>
                <div className="text-3xl font-black text-stadium-green">{user.wins}</div>
              </GlassCard>
              <GlassCard className="text-center p-4">
                <div className="text-sm text-gray-400 mb-1">Losses</div>
                <div className="text-3xl font-black text-red-400">{user.losses}</div>
              </GlassCard>
              <GlassCard className="text-center p-4">
                <div className="text-sm text-gray-400 mb-1">Win Rate</div>
                <div className="text-3xl font-black text-yellow-400">{winRate}%</div>
              </GlassCard>
            </div>

            <GlassCard>
              <h3 className="text-xl font-bold mb-4 border-b border-stadium-border/30 pb-2">Batting Records</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-400">Total Runs</div>
                  <div className="text-2xl font-bold">{user.totalRuns}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-400">Highest Score</div>
                  <div className="text-2xl font-bold">{user.highestScore}</div>
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-xl font-bold mb-4 border-b border-stadium-border/30 pb-2">Account Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
