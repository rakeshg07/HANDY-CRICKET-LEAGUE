'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { sounds } from '@/lib/sounds';

interface FriendUser {
  fullName: string;
  userId: string;
  country: string;
  avatar: string;
  rank: number;
  isOnline: boolean;
}

type TabType = 'friends' | 'requests' | 'search';

export function FriendsScreen() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [requests, setRequests] = useState<FriendUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<FriendUser | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const fetchFriends = useCallback(async () => {
    try {
      const data = await api.get('/users/friends');
      setFriends(data.friends || []);
    } catch {
      console.warn('Failed to fetch friends');
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      const data = await api.get('/users/friends/pending');
      setRequests(data.requests || []);
    } catch {
      console.warn('Failed to fetch requests');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchRequests();
    }
  }, [user, fetchFriends, fetchRequests]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    sounds.click();
    setSearchResult(null);
    setSearchError(null);
    setIsLoading(true);
    try {
      const data = await api.get(`/users/search?userId=${searchQuery.trim()}`);
      setSearchResult(data.user);
    } catch (err: any) {
      setSearchError(err.message || 'User not found');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (targetUserId: string) => {
    sounds.click();
    try {
      await api.post('/users/friends/request', { targetUserId });
      setActionMsg('Friend request sent!');
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      setActionMsg(err.message || 'Failed to send request');
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleAccept = async (targetUserId: string) => {
    sounds.click();
    try {
      await api.post('/users/friends/accept', { targetUserId });
      setActionMsg('Friend request accepted!');
      fetchFriends();
      fetchRequests();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      setActionMsg(err.message || 'Failed to accept');
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleDecline = async (targetUserId: string) => {
    sounds.click();
    try {
      await api.post('/users/friends/decline', { targetUserId });
      setActionMsg('Request declined');
      fetchRequests();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      setActionMsg(err.message || 'Failed to decline');
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const handleRemove = async (targetUserId: string) => {
    sounds.click();
    try {
      await api.post('/users/friends/remove', { targetUserId });
      setActionMsg('Friend removed');
      fetchFriends();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      setActionMsg(err.message || 'Failed to remove');
      setTimeout(() => setActionMsg(null), 3000);
    }
  };

  const getTierLabel = (rank: number) => {
    if (rank >= 1800) return { label: 'Legend', color: 'text-amber-400' };
    if (rank >= 1500) return { label: 'Master', color: 'text-cyan-400' };
    if (rank >= 1200) return { label: 'Pro', color: 'text-emerald-400' };
    if (rank >= 1050) return { label: 'Challenger', color: 'text-blue-400' };
    return { label: 'Rookie', color: 'text-gray-400' };
  };

  const tabs: { label: string; value: TabType; icon: string; count?: number }[] = [
    { label: 'Friends', value: 'friends', icon: '👥', count: friends.length },
    { label: 'Requests', value: 'requests', icon: '📩', count: requests.length },
    { label: 'Search', value: 'search', icon: '🔍' },
  ];

  if (!user) {
    return <div className="p-8 text-center text-gray-400">Please log in to manage friends.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-black bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Friends
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your cricket network</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
          <span className="text-stadium-green font-black text-lg">{friends.length}</span>
          <span className="text-[10px] text-gray-500 uppercase font-bold">Friends</span>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => { sounds.click(); setTab(t.value); }}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
              tab === t.value
                ? 'bg-stadium-green/15 border-stadium-green/40 text-stadium-green shadow-neon-sm'
                : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                tab === t.value ? 'bg-stadium-green/30 text-stadium-green' : 'bg-white/10 text-gray-500'
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Action Message */}
      <AnimatePresence>
        {actionMsg && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="p-3 bg-stadium-green/15 border border-stadium-green/30 rounded-xl text-stadium-green text-sm font-semibold text-center"
          >
            {actionMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <AnimatePresence mode="wait">
        {/* Friends Tab */}
        {tab === 'friends' && (
          <motion.div key="friends" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {friends.length === 0 ? (
              <GlassCard className="text-center py-10 border border-white/5">
                <div className="text-4xl mb-3">👥</div>
                <p className="text-gray-500 text-sm font-semibold">No friends yet</p>
                <p className="text-gray-600 text-xs mt-1">Search for players to add them as friends!</p>
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {friends.map((friend, i) => {
                  const tier = getTierLabel(friend.rank);
                  return (
                    <motion.div
                      key={friend.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] hover:border-white/15 transition-all group"
                    >
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-stadium-green/30 to-emerald-500/20 flex items-center justify-center text-2xl border border-white/10 flex-shrink-0">
                        {friend.avatar || '🏏'}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white truncate">{friend.fullName}</span>
                          <span className={`text-[9px] font-black uppercase ${tier.color}`}>{tier.label}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 font-mono">@{friend.userId}</span>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="text-[10px] text-gray-500">{friend.country}</span>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]' : 'bg-gray-600'}`} />
                        <span className="text-[10px] text-gray-500 font-bold">{friend.rank} ELO</span>
                        <button
                          onClick={() => handleRemove(friend.userId)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-xs"
                          title="Remove friend"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Requests Tab */}
        {tab === 'requests' && (
          <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {requests.length === 0 ? (
              <GlassCard className="text-center py-10 border border-white/5">
                <div className="text-4xl mb-3">📩</div>
                <p className="text-gray-500 text-sm font-semibold">No pending requests</p>
                <p className="text-gray-600 text-xs mt-1">When someone sends you a friend request, it will appear here.</p>
              </GlassCard>
            ) : (
              <div className="space-y-2">
                {requests.map((req, i) => {
                  const tier = getTierLabel(req.rank);
                  return (
                    <motion.div
                      key={req.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all"
                    >
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 flex items-center justify-center text-2xl border border-white/10 flex-shrink-0">
                        {req.avatar || '🏏'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white truncate">{req.fullName}</span>
                          <span className={`text-[9px] font-black uppercase ${tier.color}`}>{tier.label}</span>
                        </div>
                        <span className="text-xs text-gray-500 font-mono">@{req.userId}</span>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => handleAccept(req.userId)}
                          className="px-3 py-1.5 rounded-lg bg-stadium-green/15 border border-stadium-green/30 text-stadium-green text-xs font-bold hover:bg-stadium-green/25 transition-all"
                        >
                          ✓ Accept
                        </button>
                        <button
                          onClick={() => handleDecline(req.userId)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Search Tab */}
        {tab === 'search' && (
          <motion.div key="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter player username..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-stadium-green transition-colors placeholder-gray-500"
              />
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-stadium-green to-emerald-500 text-white font-bold rounded-xl text-sm hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isLoading ? '...' : '🔍'}
              </button>
            </div>

            {searchError && (
              <div className="p-3 bg-red-500/15 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                {searchError}
              </div>
            )}

            {searchResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-stadium-green/20"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-stadium-green/30 to-emerald-500/20 flex items-center justify-center text-3xl border border-white/10 flex-shrink-0">
                  {searchResult.avatar || '🏏'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{searchResult.fullName}</span>
                    <span className={`text-[9px] font-black uppercase ${getTierLabel(searchResult.rank).color}`}>
                      {getTierLabel(searchResult.rank).label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500 font-mono">@{searchResult.userId}</span>
                    <span className="text-[10px] text-gray-500">{searchResult.country}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleSendRequest(searchResult.userId)}
                  disabled={searchResult.userId === user?.userId || friends.some(f => f.userId === searchResult.userId)}
                  className="px-4 py-2 bg-stadium-green/15 border border-stadium-green/30 text-stadium-green font-bold rounded-xl text-xs hover:bg-stadium-green/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {searchResult.userId === user?.userId
                    ? 'You'
                    : friends.some(f => f.userId === searchResult.userId)
                    ? 'Already Friends'
                    : '➕ Add Friend'}
                </button>
              </motion.div>
            )}

            {!searchResult && !searchError && (
              <GlassCard className="text-center py-10 border border-white/5">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500 text-sm font-semibold">Search for players</p>
                <p className="text-gray-600 text-xs mt-1">Enter a username to find and add friends</p>
              </GlassCard>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
