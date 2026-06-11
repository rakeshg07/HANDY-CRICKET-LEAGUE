'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { GlassCard } from '@/components/ui/GlassCard';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { UserIdChecker } from '@/components/auth/UserIdChecker';
import { CountrySelect } from '@/components/auth/CountrySelect';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    userId: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    avatar: '',
  });
  const [isUserIdValid, setIsUserIdValid] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isUserIdValid) {
      setError('Please choose a valid and available User ID');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the Terms and Conditions');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/signup', formData);
      router.push('/login');
    } catch (err) {
      setError((err as Error).message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <GlassCard className="w-full max-w-lg" strong>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-stadium-green-glow mb-2">Create Account</h1>
          <p className="text-gray-400">Join the Handy Cricket League</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="input-field"
              placeholder="Virat Kohli"
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-400 mb-1">User ID</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className={`input-field pr-24 ${formData.userId && (isUserIdValid ? 'border-stadium-green/50' : 'border-red-500/50')}`}
              placeholder="virat18"
              required
            />
            <UserIdChecker userId={formData.userId} onValidChange={setIsUserIdValid} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
              <PasswordStrength password={formData.password} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Country</label>
            <CountrySelect
              value={formData.country}
              onChange={(c) => setFormData({ ...formData, country: c })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Avatar URL (Optional)</label>
            <input
              type="url"
              name="avatar"
              value={formData.avatar}
              onChange={handleChange}
              className="input-field"
              placeholder="https://example.com/avatar.png"
            />
          </div>

          <div className="flex items-center mt-6">
            <input
              id="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="w-4 h-4 text-stadium-green bg-gray-700 border-gray-600 rounded focus:ring-stadium-green focus:ring-2"
            />
            <label htmlFor="terms" className="ml-2 text-sm text-gray-400">
              I agree to the <a href="#" className="text-stadium-green hover:underline">Terms of Service</a> and <a href="#" className="text-stadium-green hover:underline">Privacy Policy</a>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex justify-center items-center h-12 mt-6"
          >
            {loading ? <div className="w-5 h-5 border-2 border-stadium-darker border-t-transparent rounded-full animate-spin"></div> : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-stadium-green hover:underline font-bold">
            Login here
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}
