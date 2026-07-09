'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { User as UserIcon, Mail, ShieldCheck, CheckCircle, Bell, Clock } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [reminderOn, setReminderOn] = useState(user?.reminder_on ?? true);
  const [reminderHour, setReminderHour] = useState(user?.reminder_hour ?? 11);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await api.updateProfile({ 
        name,
        reminder_on: reminderOn,
        reminder_hour: Number(reminderHour)
      });
      const data = await res.json();

      if (res.ok) {
        updateUser(data);
        setSuccess('Profile updated successfully!');
      } else {
        setError(data.error || 'Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  // Generate 24 hours options list
  const hourOptions = Array.from({ length: 24 }, (_, i) => {
    const suffix = i >= 12 ? 'PM' : 'AM';
    const displayHour = i % 12 === 0 ? 12 : i % 12;
    return {
      value: i,
      label: `${displayHour}:00 ${suffix}`,
    };
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <UserIcon className="h-8 w-8 text-primary" />
          Edit Profile
        </h1>
        <p className="mt-1 text-gray-400">Manage your profile details and preferences.</p>
      </div>

      <div className="max-w-xl">
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          {success && (
            <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/30 p-4 text-sm text-emerald-200">
              {success}
            </div>
          )}
          {error && (
            <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-4 text-sm text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user.email}
                  className="block w-full rounded-xl border border-border bg-secondary/50 pl-10 pr-3 py-3 text-gray-400 cursor-not-allowed sm:text-sm"
                />
              </div>
              <span className="text-[10px] text-gray-500 font-medium block mt-1">
                Your email is your unique login identifier and cannot be modified.
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-xl border border-border bg-secondary pl-10 pr-3 py-3 text-white focus:border-primary focus:outline-none sm:text-sm"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            {/* Notification settings */}
            <div className="border-t border-border pt-5 space-y-4">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="h-4.5 w-4.5 text-primary" />
                Study Reminders
              </h3>
              
              <div className="flex items-center justify-between rounded-xl bg-secondary/40 p-4 border border-border">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium text-white cursor-pointer" htmlFor="reminder-toggle">
                    Daily Email Reminder
                  </label>
                  <p className="text-xs text-gray-400">Receive an email if you haven't reviewed today.</p>
                </div>
                <input
                  id="reminder-toggle"
                  type="checkbox"
                  checked={reminderOn}
                  onChange={(e) => setReminderOn(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary bg-secondary cursor-pointer"
                />
              </div>

              {reminderOn && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-gray-400" />
                    Preferred Time
                  </label>
                  <select
                    value={reminderHour}
                    onChange={(e) => setReminderHour(Number(e.target.value))}
                    className="block w-full rounded-xl border border-border bg-secondary px-3 py-3 text-white focus:border-primary focus:outline-none sm:text-sm cursor-pointer"
                  >
                    {hourOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label} (Bangladesh Time)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary hover:bg-accent px-6 py-3 font-semibold text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
