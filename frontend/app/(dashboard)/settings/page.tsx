'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Settings, Bell, Lock, Clock } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [reminderOn, setReminderOn] = useState(user?.reminder_on ?? true);
  const [reminderHour, setReminderHour] = useState(user?.reminder_hour ?? 11);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Format hour as readable string (e.g. "11:00 PM")
  const formatHour = (h: number) => {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:00 ${suffix}`;
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: `${formatHour(i)} (Bangladesh Time)`,
  }));

  const handleToggleReminder = async (checked: boolean) => {
    try {
      const res = await api.updateSettings(checked);
      if (res.ok) {
        setReminderOn(checked);
        if (user) {
          updateUser({ ...user, reminder_on: checked });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReminderHourChange = async (hour: number) => {
    setReminderHour(hour);
    try {
      const res = await api.updateProfile({
        name: user?.name || '',
        reminder_on: reminderOn,
        reminder_hour: hour,
      });
      if (res.ok) {
        const data = await res.json();
        updateUser(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = await api.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
      } else {
        setError(data.old_password?.[0] || data.new_password?.[0] || data.error || 'Failed to update password.');
      }
    } catch (err) {
      console.error(err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Settings
        </h1>
        <p className="mt-1 text-gray-400">Configure notification preferences and account credentials.</p>
      </div>

      <div className="max-w-xl space-y-6">
        {/* Email Reminders Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-border/40 pb-3">
            <Bell className="h-5 w-5 text-primary" />
            Notifications
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Daily Reminder Emails</h4>
              <p className="text-xs text-gray-400 mt-1">
                {reminderOn
                  ? `You'll receive a reminder at ${formatHour(reminderHour)} (Bangladesh Time) if your daily cycle is incomplete.`
                  : 'Email reminders are currently disabled.'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={reminderOn}
                onChange={(e) => handleToggleReminder(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {reminderOn && (
            <div className="space-y-1.5 animate-fadeIn">
              <label className="text-sm font-medium text-gray-300 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-gray-400" />
                Preferred Reminder Time
              </label>
              <select
                value={reminderHour}
                onChange={(e) => handleReminderHourChange(Number(e.target.value))}
                className="block w-full rounded-xl border border-border bg-secondary px-3 py-3 text-white focus:border-primary focus:outline-none sm:text-sm cursor-pointer"
              >
                {hourOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Change Password Card */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-border/40 pb-3">
            <Lock className="h-5 w-5 text-primary" />
            Change Password
          </h3>

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

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="block w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-white focus:border-primary focus:outline-none sm:text-sm"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-white focus:border-primary focus:outline-none sm:text-sm"
                placeholder="Min 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary hover:bg-accent px-6 py-2.5 font-semibold text-white transition-colors disabled:opacity-50"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
