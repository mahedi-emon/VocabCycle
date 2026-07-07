'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, BarChart3, User, Settings, GraduationCap, X } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'History', href: '/history', icon: History },
    { name: 'Statistics', href: '/stats', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-[#060913]/90 backdrop-blur-xl pt-16 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4 text-gray-400 hover:text-white md:hidden">
          <button onClick={onClose}>
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-6">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl py-3 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-lg shadow-primary/25 border-l-4 border-indigo-300 pl-3'
                    : 'text-[#94a3b8] hover:bg-white/5 hover:text-white pl-4'
                }`}
              >
                <item.icon
                  className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-[#94a3b8] group-hover:text-white'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};
