'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User as UserIcon, BookOpen, Menu } from 'lucide-react';
import Link from 'next/link';

interface NavbarProps {
  onMenuClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-[#0b0f19]/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="text-[#9ca3af] hover:text-[#f3f4f6] md:hidden focus:outline-none"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-white">
            Vocab<span className="text-primary">Cycle</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center gap-3">
            <Link href="/profile" className="flex items-center gap-2 hover:opacity-80">
              {user.profile_pic ? (
                <img
                  src={user.profile_pic}
                  alt={user.name}
                  className="h-8 w-8 rounded-full border border-primary/40 object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border border-border text-primary font-bold">
                  {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
              )}
              <span className="hidden text-sm font-medium text-gray-300 md:inline-block">
                {user.name || user.email}
              </span>
            </Link>
            <button
              onClick={logout}
              title="Logout"
              className="rounded-lg p-2 text-[#9ca3af] hover:bg-[#1f2937] hover:text-red-400 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
