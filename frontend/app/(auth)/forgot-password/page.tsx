'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { BookOpen, Key, Mail, Lock, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const res = await api.requestPasswordReset(email);
      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || 'Verification code sent to your email.');
        setStep(2);
      } else {
        setError(data.error || 'Failed to send reset code. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.confirmPasswordReset({
        email,
        code,
        new_password: newPassword,
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Password reset successful! Redirecting you to login...');
        setError(null);
        // Reset states
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(data.error || 'Invalid verification code or email.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0f19] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 glass-panel p-8 rounded-2xl shadow-xl">
        <div className="flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            Reset Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {step === 1 
              ? 'Enter your email to receive a password reset code' 
              : 'Enter the 6-digit code and your new password'
            }
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-900/30 border border-red-500/30 p-4 text-sm text-red-200">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-400" />
            <p>{error}</p>
          </div>
        )}

        {message && (
          <div className="flex items-center gap-2 rounded-xl bg-green-900/30 border border-green-500/30 p-4 text-sm text-green-200">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
            <p>{message}</p>
          </div>
        )}

        {step === 1 ? (
          <form className="mt-8 space-y-6" onSubmit={handleRequestCode}>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-border bg-secondary pl-10 pr-3 py-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-secondary disabled:opacity-55 transition-all shadow-md shadow-primary/20"
              >
                {loading ? 'Sending code...' : 'Send Reset Code'}
              </button>

              <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Verification Code</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Key className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="\d{6}"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="block w-full rounded-xl border border-border bg-secondary pl-10 pr-3 py-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm tracking-widest text-center font-bold"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-xl border border-border bg-secondary pl-10 pr-3 py-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full rounded-xl border border-border bg-secondary pl-10 pr-3 py-3 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-secondary disabled:opacity-55 transition-all shadow-md shadow-primary/20"
              >
                {loading ? 'Resetting password...' : 'Reset Password'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Change Email Address
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
