'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import {
  Home,
  Gift,
  ShoppingBag,
  MessageCircle,
  Calendar,
  Settings,
  LogOut,
  CheckCircle2,
  Users,
  Star,
  Leaf,
  Globe, Search, Plus,
} from 'lucide-react';
import MyDonations from './MyDonations';
import MyRequests from './MyRequests';
import MessagesInbox from './Messages';
import { trpc } from '@/lib/trpc';

import EventsDrives from './EventsDrives';
import SettingsView from './Settings';
import MobileBackToTopButton from '@/components/MobileBackToTopButton';
/** Dark canvas + black glass (blur) panels; emerald accents */
const pageBg =
  'relative min-h-screen overflow-x-hidden bg-gradient-to-br from-zinc-950 via-neutral-950 to-black';
const glassDark =
  'border border-white/10 bg-black/40 shadow-2xl shadow-black/40 backdrop-blur-2xl backdrop-saturate-150';
const easeOut = [0.22, 1, 0.36, 1] as const;
const tPage = { duration: 0.3, ease: easeOut };

type SectionId = 'dashboard' | 'donations' | 'requests' | 'messages' | 'events' | 'settings';

function formatRelativeTime(value: string) {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function Blob({
  delay = 0,
  size = 'w-96',
  top = '0',
  left = '0',
  className = 'from-emerald-400/10',
}: {
  delay?: number;
  size?: string;
  top?: string;
  left?: string;
  className?: string;
}) {
  return (
    <motion.div
      className={`pointer-events-none absolute ${size} rounded-full bg-gradient-to-br ${className} blur-[100px]`}
      style={{ top, left }}
      animate={{ y: [0, 20, 0], x: [0, 12, 0], scale: [1, 1.05, 1] }}
      transition={{ duration: 12, delay, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

function Sidebar({
  active,
  setActive,
}: {
  active: SectionId;
  setActive: (id: SectionId) => void;
}) {
  const navItems: { id: SectionId; label: string; icon: typeof Home }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'donations', label: 'Donations', icon: Gift },
    { id: 'requests', label: 'Requests', icon: ShoppingBag },
    { id: 'messages', label: 'Messages', icon: MessageCircle },

    { id: 'events', label: 'Events', icon: Calendar },
  ];

  return (
    <motion.aside
      initial={{ x: -72, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className="fixed left-0 top-0 z-50 hidden h-screen w-72 overflow-hidden border-r border-white/10 lg:block xl:w-80"
    >
      {/* Base + soft green streak (reference aesthetic) */}
      <div className="pointer-events-none absolute inset-0 bg-[#06100b]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 "
          style={{
            backgroundImage: 'url(/images/sidebar-img2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        {/* Dark overlay to dull the image effect */}
        <div className="absolute inset-0 bg-black/40" />
        
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background:
              'linear-gradient(180deg, rgba(6, 78, 59, 0.2) 0%, rgba(0,0,0,0.3) 50%, rgba(6, 78, 59, 0.4) 100%)',
          }}
        />
      </div>
      {/* Frosted glass: blurs the glow behind for aurora / glassmorphism look */}
      <div className="relative z-10 flex h-full flex-col bg-black/10 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-[0px] sm:p-7">
        <Link href="/" className="mb-9 flex items-center gap-3 transition-opacity hover:opacity-80 group">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 text-white shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/40 transition-shadow" >
          <Leaf className="h-6 w-6" strokeWidth={1.75} aria-hidden />
        </div>
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-white">ShareSpace</h1>
          <p className="text-[11px] font-medium uppercase tracking-widest text-white/60">
            Your dashboard
          </p>
        </div>
        </Link>

        <nav className="flex flex-1 flex-col gap-1.5 mt-4">
        {navItems.map((item, i) => {
          const isActive = active === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, ...tPage }}
              className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-left text-[14px] text-white font-medium tracking-[0.01em] transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-300 ring-1 ring-emerald-500/30'
                  : 'text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`relative flex items-center justify-center h-[28px] w-[28px] rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 transition-all duration-300 shrink-0 ${
                isActive
                  ? 'border border-emerald-500/50 shadow-lg shadow-emerald-500/30'
                  : 'border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/20'
              }`}>
                <item.icon
                  className={`h-[18px] w-[18px] transition-colors duration-300 ${isActive ? 'text-emerald-400' : 'text-zinc-500 group-hover:text-zinc-400'}`}
                  strokeWidth={1.75}
                />
              </div>
              {item.label}
            </motion.button>
          );
        })}
        </nav>

        <div className="mt-auto space-y-1 border-t border-white/20 pt-5 pb-5">
        <button
          type="button"
          onClick={() => setActive('settings')}
          className={`group/settings flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-[14px] font-medium tracking-[0.01em] transition-all duration-300 ${
            active === 'settings'
              ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-300 ring-1 ring-emerald-500/30'
              : 'text-zinc-400 hover:bg-white/10 hover:text-white'
          }`}
        >
          <div className={`relative flex items-center justify-center h-[22px] w-[22px] rounded-lg transition-all duration-300 shrink-0 ${
            active === 'settings'
              ? 'bg-emerald-500/20 border border-emerald-500/40'
              : 'border border-transparent group-hover/settings:border-white/20'
          }`}>
            <Settings className={`h-5 w-5 transition-colors ${active === 'settings' ? 'text-emerald-400' : 'text-zinc-500 group-hover/settings:text-zinc-400'}`} strokeWidth={1.75} />
          </div>
          Settings
        </button>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="group/logout flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-[14px] font-medium tracking-[0.01em] text-red-500/80 transition-all duration-300 hover:bg-red-500/15 hover:text-red-400 hover:shadow-lg hover:shadow-red-500/10"
        >
          <div className="relative flex items-center justify-center h-[22px] w-[22px] rounded-lg border border-transparent group-hover/logout:border-red-500/30 transition-all">
            <LogOut className="h-5 w-5 opacity-75 group-hover/logout:opacity-100 transition-opacity" strokeWidth={1.75} />
          </div>
          Sign out
        </button>
        </div>
      </div>
    </motion.aside>
  );
}

function TopBar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-[5rem] overflow-hidden lg:left-72 lg:h-[6rem] xl:left-80">
      {/* Synth grid + stars background */}
      <div className="pointer-events-none absolute inset-0 bg-black" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.92]"
        style={{
          backgroundImage: 'url(/images/navbar-grid.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
          backgroundRepeat: 'no-repeat',
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/70"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 backdrop-blur-[1px]"
        aria-hidden
      />

      <div className="relative z-10 flex h-full items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold tracking-tight text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.85)] sm:text-lg lg:text-xl">
            Welcome to ShareSpace
          </h2>
          <p className="mt-0.5 hidden truncate text-sm text-emerald-100/70 drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)] sm:block">
            Connect, give locally, and request what you need.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Link
            href="/requests"
            title="Post Request"
            className="group relative flex h-10 items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-600 px-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 hover:bg-emerald-700 active:scale-95 sm:px-4"
          >
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden sm:inline">Post Request</span>
            <span className="pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-[80] whitespace-nowrap rounded-full border border-white/10 bg-black/90 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl backdrop-blur-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 sm:hidden">
              Post Request
            </span>
          </Link>
          
          <Link
            href="/explore"
            className="hidden sm:flex items-center gap-2 rounded-full border border-teal-500/20 bg-teal-900/40 px-4 h-10 text-sm font-medium text-teal-100/90 shadow-sm backdrop-blur-md transition-all hover:border-teal-400/45 hover:bg-teal-500/20 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 sm:mr-1"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
            Explore NGOs
          </Link>

          <Link
            href="/explore"
            title="Explore NGOs"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-teal-500/20 bg-teal-900/40 text-teal-100/90 shadow-sm backdrop-blur-md transition-all hover:border-teal-400/45 hover:bg-teal-500/20 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 sm:hidden"
            aria-label="Explore NGOs"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-60 blur-lg bg-teal-500/40 transition-opacity" />
            <Search className="h-[1.15rem] w-[1.15rem] relative z-[1]" strokeWidth={1.75} />
            <span className="pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-[80] whitespace-nowrap rounded-full border border-white/10 bg-black/90 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl backdrop-blur-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Explore NGOs
            </span>
          </Link>

          <Link
            href="/"
            className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-black/40 px-4 h-10 text-sm font-medium text-emerald-100/90 shadow-sm backdrop-blur-md transition-all hover:border-emerald-400/45 hover:bg-emerald-500/10 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 sm:mr-1"
          >
            <Globe className="h-4 w-4" strokeWidth={1.75} />
            Back Home
          </Link>
          
          <Link
            href="/"
            title="Back Home"
            className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/20 bg-black/40 text-emerald-100/90 shadow-sm backdrop-blur-md transition-all hover:border-emerald-400/45 hover:bg-emerald-500/10 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 sm:hidden"
            aria-label="Back Home"
          >
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-60 blur-lg bg-emerald-500/40 transition-opacity" />
            <Globe className="h-[1.15rem] w-[1.15rem] relative z-[1]" strokeWidth={1.75} />
            <span className="pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-[80] whitespace-nowrap rounded-full border border-white/10 bg-black/90 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl backdrop-blur-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              Back Home
            </span>
          </Link>
          <div className="group relative" title="Profile">
            <div
              className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-emerald-500/25 bg-black/40 shadow-sm backdrop-blur-md"
              aria-label="Profile"
            >
              <img
                src={user?.image || "https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSouth%20Asian%2F4"}
                alt="Profile picture"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="pointer-events-none absolute right-0 top-[calc(100%+0.5rem)] z-[80] whitespace-nowrap rounded-full border border-white/10 bg-black/90 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl backdrop-blur-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              Profile
            </span>
          </div>
        </div>
      </div>

      {/* --- Left Side Glow --- */}
      <motion.div
        className="pointer-events-none absolute bottom-0 left-0 right-1/2 h-[2px]"
        style={{
          background:
            'linear-gradient(90deg, rgba(167, 243, 208, 1) 0%, rgba(52, 211, 153, 0.75) 8%, rgba(52, 211, 153, 0.35) 22%, rgba(16, 185, 129, 0.12) 42%, transparent 68%)',
          boxShadow:
            '0 0 8px rgba(167, 243, 208, 0.95), 0 0 24px rgba(52, 211, 153, 0.85), 0 0 48px rgba(16, 185, 129, 0.45), 0 0 72px rgba(5, 150, 105, 0.22)',
          transformOrigin: 'left center',
        }}
        animate={{ opacity: [0.85, 0.35, 0.65, 0.85] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -bottom-4 left-0 h-14 w-[min(100%,52rem)] max-w-[85%] rounded-full blur-3xl"
        style={{
          background:
            'linear-gradient(90deg, rgba(110, 231, 183, 0.88) 0%, rgba(52, 211, 153, 0.55) 18%, rgba(16, 185, 129, 0.2) 45%, transparent 72%)',
          transformOrigin: 'left center',
        }}
        animate={{
          opacity: [0.8, 0.3, 0.6, 0.8],
          scaleX: [1, 0.85, 0.92, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden
      />

      {/* --- Right Side Glow --- */}
      <motion.div
        className="pointer-events-none absolute bottom-0 right-0 left-1/2 h-[2px]"
        style={{
          background:
            'linear-gradient(270deg, rgba(167, 243, 208, 1) 0%, rgba(52, 211, 153, 0.75) 8%, rgba(52, 211, 153, 0.35) 22%, rgba(16, 185, 129, 0.12) 42%, transparent 68%)',
          boxShadow:
            '0 0 8px rgba(167, 243, 208, 0.95), 0 0 24px rgba(52, 211, 153, 0.85), 0 0 48px rgba(16, 185, 129, 0.45), 0 0 72px rgba(5, 150, 105, 0.22)',
          transformOrigin: 'right center',
        }}
        animate={{ opacity: [0.85, 0.35, 0.65, 0.85] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden
      />
      <motion.div
        className="pointer-events-none absolute -bottom-4 right-0 h-14 w-[min(100%,52rem)] max-w-[85%] rounded-full blur-3xl"
        style={{
          background:
            'linear-gradient(270deg, rgba(110, 231, 183, 0.88) 0%, rgba(52, 211, 153, 0.55) 18%, rgba(16, 185, 129, 0.2) 45%, transparent 72%)',
          transformOrigin: 'right center',
        }}
        animate={{
          opacity: [0.8, 0.3, 0.6, 0.8],
          scaleX: [1, 0.85, 0.92, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden
      />
    </header>
  );
}

function MobileDashboardNav({
  active,
  setActive,
}: {
  active: SectionId;
  setActive: (id: SectionId) => void;
}) {
  const navItems: { id: SectionId; label: string; icon: typeof Home }[] = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'donations', label: 'Donations', icon: Gift },
    { id: 'requests', label: 'Requests', icon: ShoppingBag },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-white/10 bg-black/75 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl lg:hidden">
      <div className="grid grid-cols-6 gap-1">
        {navItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item.id)}
              title={item.label}
              aria-label={item.label}
              className={`group relative flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-semibold transition-colors ${
                isActive
                  ? 'bg-emerald-500/20 text-emerald-200 ring-1 ring-emerald-400/30'
                  : 'text-zinc-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="h-4 w-4" strokeWidth={1.8} />
              <span className="max-w-full truncate">{item.label}</span>
              <span className="pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 z-[80] -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/90 px-3 py-1.5 text-xs font-semibold text-white opacity-0 shadow-xl backdrop-blur-md transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function DashboardHome() {
  const dashboardStats = trpc.item.getDashboardStats.useQuery(undefined, {
    refetchOnWindowFocus: true,
  });
  const data = dashboardStats.data;
  const stats = [
    { label: 'Items donated', value: data?.itemsDonated ?? '--', icon: Gift, bar: 'bg-emerald-500' },
    { label: 'Requests fulfilled', value: data?.requestsFulfilled ?? '--', icon: CheckCircle2, bar: 'bg-zinc-800' },
    { label: 'Connections', value: data?.connections ?? '--', icon: Users, bar: 'bg-emerald-600' },
    { label: 'Messages', value: data?.messages ?? '--', icon: Star, bar: 'bg-zinc-600' },
  ];
  const recentActivity = data?.recentActivity ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={tPage}
      className="space-y-6 mt-8"
    >
      <div
        className={`relative overflow-hidden rounded-2xl border border-white/15 ${glassDark} bg-black/30`}
      >
        {/* Very subtle green: top-right, fading toward the left */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_85%_70%_at_100%_0%,rgba(52,211,153,0.14),transparent_58%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(to_left,rgba(16,185,129,0.11)_0%,rgba(5,150,105,0.045)_28%,transparent_56%)]"
          aria-hidden
        />
        <div className="relative z-10 flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">Overview</p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Impact this month
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-zinc-300/95">
            You are building trust in your community. Keep sharing what you can — small acts add up.
          </p>
          </div>
          <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/25 px-3 py-1.5 text-xs font-medium text-zinc-100 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
            On track with last month
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ...tPage }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-300/10 to-blue-400/10 p-3.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-[24px] transition-all hover:border-blue-400/30 hover:from-slate-300/15 hover:to-blue-400/15 sm:p-6"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-300/10 text-blue-200 shadow-md transition-shadow group-hover:shadow-lg group-hover:shadow-blue-500/20 sm:mb-4 sm:h-10 sm:w-10">
              <s.icon className="h-4 w-4 sm:h-5 sm:w-5" strokeWidth={1.75} />
            </div>
            <p className="line-clamp-2 min-h-[2rem] text-[10px] font-medium uppercase leading-4 tracking-wide text-zinc-300 drop-shadow-md sm:min-h-0 sm:text-xs">{s.label}</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-white drop-shadow-lg sm:text-2xl">{s.value}</p>
            <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10 sm:mt-4">
              <div className={`h-full w-3/4 rounded-full ${s.bar}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-300/10 to-blue-400/10 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-[24px] sm:p-8">
        <h4 className="text-base font-semibold text-white">Recent activity</h4>
        <ul className="mt-4 divide-y divide-white/5">
          {dashboardStats.isLoading && (
            <li className="py-4 text-sm text-zinc-400">Loading your latest activity...</li>
          )}
          {!dashboardStats.isLoading && recentActivity.length === 0 && (
            <li className="py-4 text-sm text-zinc-400">No activity yet. Start by posting a request or offering help.</li>
          )}
          {recentActivity.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-4 py-4 first:pt-0">
              <span className="text-sm text-zinc-300">{row.text}</span>
              <span className="shrink-0 text-xs text-zinc-400">{formatRelativeTime(row.at)}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function SectionFrame({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={tPage}
      className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-300/10 to-blue-400/10 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-[24px] sm:p-6 mt-10"
    >
      {children}
    </motion.div>
  );
}


export default function PremiumDashboard() {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<SectionId>(() => {
    const section = searchParams.get('section') as SectionId | null;
    return section ?? 'dashboard';
  });
  const [initialChatId] = useState<string | null>(() => searchParams.get('chatId'));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [active]);

  return (
    <div className={pageBg}>
      <Blob top="6%" left="4%" className="from-emerald-400/12 to-transparent" />
      <Blob delay={2} top="45%" left="70%" size="w-80" className="from-zinc-300/15 to-transparent" />
      <Blob delay={4} top="70%" left="12%" size="w-72" className="from-emerald-300/10 to-transparent" />

      <Sidebar active={active} setActive={setActive} />
      <TopBar />

      <main className="mx-auto max-w-[1680px] px-4 pb-28 pt-[5rem] sm:px-6 lg:ml-72 lg:px-8 lg:pb-12 lg:pt-[5.75rem] xl:ml-80">
        <AnimatePresence mode="wait">
          {active === 'dashboard' && <DashboardHome key="dashboard" />}
          {active === 'donations' && (
            <SectionFrame key="donations">
              <MyDonations />
            </SectionFrame>
          )}
          {active === 'requests' && (
            <SectionFrame key="requests">
              <MyRequests />
            </SectionFrame>
          )}
          {active === 'messages' && (
            <SectionFrame key="messages">
              <MessagesInbox initialSelectedChat={initialChatId} />
            </SectionFrame>
          )}

          {active === 'events' && (
            <SectionFrame key="events">
              <EventsDrives />
            </SectionFrame>
          )}
          {active === 'settings' && (
            <SectionFrame key="settings">
              <SettingsView />
            </SectionFrame>
          )}
        </AnimatePresence>
      </main>
      <MobileDashboardNav active={active} setActive={setActive} />
      <MobileBackToTopButton bottomClassName="bottom-24" />
    </div>
  );
}
