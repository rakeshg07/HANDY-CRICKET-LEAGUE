'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore } from '@/store/authStore';
import { sounds } from '@/lib/sounds';
import { AVATAR_OPTIONS, COUNTRY_OPTIONS } from '@/lib/profileStorage';

interface EditProfileModalProps {
  open: boolean;
  onClose: () => void;
}

type TabType = 'general' | 'security';

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // General Form
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [userId, setUserId] = useState(user?.userId || '');
  const [country, setCountry] = useState(user?.country || 'India');
  const [avatar, setAvatar] = useState(user?.avatar || '🏏');

  // Security Form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.click();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!fullName.trim()) {
      setError('Name cannot be empty');
      setIsSubmitting(false);
      return;
    }

    if (!userId.trim()) {
      setError('Username cannot be empty');
      setIsSubmitting(false);
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(userId)) {
      setError('Username must be 3-20 alphanumeric characters or underscores');
      setIsSubmitting(false);
      return;
    }

    try {
      await updateUser({
        fullName,
        userId,
        country,
        avatar,
      });
      setSuccess('Profile updated successfully!');
    } catch (err: any) {
      setError(err?.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSecuritySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.click();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    if (!oldPassword) {
      setError('Current password is required');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsSubmitting(false);
      return;
    }

    try {
      await updateUser({
        oldPassword,
        newPassword,
      });
      setSuccess('Password updated successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || 'Failed to update password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Edit Profile">
      <div className="flex border-b border-white/10 mb-4">
        <button
          onClick={() => { sounds.click(); setActiveTab('general'); setError(null); setSuccess(null); }}
          className={`flex-1 py-2 text-center font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'general'
              ? 'border-stadium-green text-stadium-green'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          General
        </button>
        <button
          onClick={() => { sounds.click(); setActiveTab('security'); setError(null); setSuccess(null); }}
          className={`flex-1 py-2 text-center font-bold text-sm border-b-2 transition-colors ${
            activeTab === 'security'
              ? 'border-stadium-green text-stadium-green'
              : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Security & Password
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-stadium-green/20 border border-stadium-green/30 rounded-xl text-stadium-green text-sm">
          {success}
        </div>
      )}

      {activeTab === 'general' ? (
        <form onSubmit={handleGeneralSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Avatar</label>
            <div className="grid grid-cols-5 gap-2 mt-2">
              {AVATAR_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => { sounds.click(); setAvatar(opt); }}
                  className={`w-12 h-12 flex items-center justify-center text-2xl rounded-xl transition-all ${
                    avatar === opt
                      ? 'bg-stadium-green/20 border-2 border-stadium-green scale-110 shadow-lg shadow-stadium-green/10'
                      : 'bg-white/5 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="input-field mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-stadium-green"
              placeholder="e.g. Rakesh G"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="input-field mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-stadium-green"
              placeholder="e.g. rakeshg_07"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Country</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input-field mt-1 w-full bg-black/45 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-stadium-green"
            >
              {COUNTRY_OPTIONS.map((c) => (
                <option key={c} value={c} className="bg-stadium-dark">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-stadium-green to-emerald-500 text-white font-bold rounded-xl transition-all hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Save Profile Details'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSecuritySubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Password</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input-field mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-stadium-green"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-stadium-green"
              placeholder="Min 6 characters"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-stadium-green"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-gradient-to-r from-stadium-green to-emerald-500 text-white font-bold rounded-xl transition-all hover:brightness-110 disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      )}
    </Modal>
  );
}
