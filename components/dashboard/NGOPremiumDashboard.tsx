'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { signOut } from 'next-auth/react';
import {
  Bell,
  Calendar,
  CheckCircle2,
  Globe,
  Gift,
  Home,
  KeyRound,
  Leaf,
  Loader2,
  LogOut,
  MapPin,
  MessageCircle,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Star,
  Users,
} from 'lucide-react';
import MyDonations from './MyDonations';
import MyRequests from './MyRequests';
import MessagesInbox from './Messages';
import NearbyNGOs from './NearbyNGOs';
import EventsDrives from './EventsDrives';
import SettingsView from './Settings';

const pageBg =
  'relative min-h-screen overflow-x-hidden bg-gradient-to-br from-zinc-950 via-neutral-950 to-black';
const glassDark =
  'border border-white/10 bg-black/40 shadow-2xl shadow-black/40 backdrop-blur-2xl backdrop-saturate-150';
const easeOut = [0.22, 1, 0.36, 1] as const;
const tPage = { duration: 0.3, ease: easeOut };

type SectionId =
  | 'dashboard'
  | 'donations'
  | 'requests'
  | 'messages'
  | 'ngos'
  | 'events'
  | 'settings';

type NGODashboardPayload = {
  ngo: {
    id: string;
    email: string;
    organizationName: string;
    image: string | null;
    missionArea: string;
    verificationStatus: string;
    isVerified: boolean;
    mfaSetupComplete: boolean;
    mfaMethod: string | null;
    isFirstLogin: boolean;
    lastLoginAt: string | null;
    complianceBadges: string[];
  };
  metrics: {
    itemsReceived: number;
    requestsFulfilled: number;
    peopleSupported: number;
    reliabilityScore: number;
    eventsHosted: number;
  };
  recentActivity: {
    title: string;
    date: string;
    success: boolean;
  }[];
};

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
  badges,
  securityReady,
}: {
  active: SectionId;
  setActive: (id: SectionId) => void;
  badges: string[];
  securityReady: boolean;
}) {
  const navItems: { id: SectionId; label: string; icon: typeof Home }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'donations', label: 'Donations', icon: Gift },
    { id: 'requests', label: 'Requests', icon: ShoppingBag },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'ngos', label: 'NGOs', icon: MapPin },
    { id: 'events', label: 'Events', icon: Calendar },
  ];

  return (
    <motion.aside
      initial={{ x: -72, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: easeOut }}
      className="fixed left-0 top-0 z-50 h-screen w-72 overflow-hidden border-r border-white/10 sm:w-80"
    >
      <div className="pointer-events-none absolute inset-0 bg-[#06100b]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/images/sidebar-img2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-black/45" />
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background:
              'linear-gradient(180deg, rgba(6, 78, 59, 0.2) 0%, rgba(0,0,0,0.3) 50%, rgba(6, 78, 59, 0.4) 100%)',
          }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col bg-black/10 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] sm:p-7">
        <Link href="/" className="group mb-7 flex items-center gap-3 transition-opacity hover:opacity-80">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/20 text-white shadow-lg shadow-emerald-500/30 transition-shadow group-hover:shadow-emerald-500/40">
            <Leaf className="h-6 w-6" strokeWidth={1.75} aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white">ShareSpace</h1>
            <p className="text-[11px] font-medium uppercase tracking-widest text-white/60">
              NGO command center
            </p>
          </div>
        </Link>

        <div className="mb-6 rounded-2xl border border-emerald-500/20 bg-emerald-950/20 p-4 backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Trust profile
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {badges.length > 0 ? (
              badges.map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200"
                >
                  {badge}
                </span>
              ))
            ) : (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-300">
                Under review
              </span>
            )}
            {securityReady && (
              <span className="inline-flex items-center gap-1 rounded-full border border-sky-400/30 bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-200">
                <KeyRound className="h-3 w-3" />
                MFA linked
              </span>
            )}
          </div>
        </div>

        <nav className="mt-2 flex flex-1 flex-col gap-1.5">
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
                className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-left text-[14px] font-medium tracking-[0.01em] transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'text-zinc-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div
                  className={`relative flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 transition-all duration-300 ${
                    isActive
                      ? 'border border-emerald-500/50 shadow-lg shadow-emerald-500/30'
                      : 'border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-md hover:shadow-emerald-500/20'
                  }`}
                >
                  <item.icon
                    className={`h-[18px] w-[18px] transition-colors duration-300 ${
                      isActive ? 'text-emerald-400' : 'text-zinc-500'
                    }`}
                    strokeWidth={1.75}
                  />
                </div>
                {item.label}
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-1 border-t border-white/20 pb-5 pt-5">
          <button
            type="button"
            onClick={() => setActive('settings')}
            className={`group/settings flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-[14px] font-medium tracking-[0.01em] transition-all duration-300 ${
              active === 'settings'
                ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-500/5 text-emerald-300 ring-1 ring-emerald-500/30'
                : 'text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div
              className={`relative flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-lg transition-all duration-300 ${
                active === 'settings'
                  ? 'border border-emerald-500/40 bg-emerald-500/20'
                  : 'border border-transparent group-hover/settings:border-white/20'
              }`}
            >
              <Settings
                className={`h-5 w-5 transition-colors ${
                  active === 'settings' ? 'text-emerald-400' : 'text-zinc-500 group-hover/settings:text-zinc-400'
                }`}
                strokeWidth={1.75}
              />
            </div>
            Settings
          </button>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="group/logout flex w-full items-center gap-3.5 rounded-xl px-4 py-3.5 text-[14px] font-medium tracking-[0.01em] text-red-500/80 transition-all duration-300 hover:bg-red-500/15 hover:text-red-400 hover:shadow-lg hover:shadow-red-500/10"
          >
            <div className="relative flex h-[22px] w-[22px] items-center justify-center rounded-lg border border-transparent transition-all group-hover/logout:border-red-500/30">
              <LogOut className="h-5 w-5 opacity-75 transition-opacity group-hover/logout:opacity-100" strokeWidth={1.75} />
            </div>
            Sign out
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

function TopBar({
  payload,
  setActive,
}: {
  payload: NGODashboardPayload | null;
  setActive: (id: SectionId) => void;
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const badgeText = payload?.ngo.complianceBadges.length
    ? payload.ngo.complianceBadges.join(' • ')
    : 'Verification in progress';

  return (
    <header className="fixed left-72 right-0 top-0 z-40 h-[6rem] overflow-hidden sm:left-80">
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
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/70" aria-hidden />
      <div className="pointer-events-none absolute inset-0 backdrop-blur-[1px]" aria-hidden />

      <div className="relative z-10 flex h-full items-center justify-between gap-4 px-4 sm:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-white drop-shadow-[0_1px_12px_rgba(0,0,0,0.85)] sm:text-xl">
              Welcome to ShareSpace
            </h2>
            <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
              {badgeText}
            </span>
            {payload?.ngo.mfaSetupComplete && (
              <span className="inline-flex rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-200">
                {payload.ngo.mfaMethod === 'webauthn' ? 'Security key linked' : 'Authenticator linked'}
              </span>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-emerald-100/70 drop-shadow-[0_1px_8px_rgba(0,0,0,0.8)]">
            Manage verified donations, community requests, and trusted outreach from one place.
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/explore"
            className="hidden h-10 items-center gap-2 rounded-full border border-teal-500/20 bg-teal-900/40 px-4 text-sm font-medium text-teal-100/90 shadow-sm backdrop-blur-md transition-all hover:border-teal-400/45 hover:bg-teal-500/20 hover:text-white hover:shadow-lg hover:shadow-teal-500/20 sm:flex sm:mr-1"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
            Explore NGOs
          </Link>
          <Link
            href="/"
            className="hidden h-10 items-center gap-2 rounded-full border border-emerald-500/20 bg-black/40 px-4 text-sm font-medium text-emerald-100/90 shadow-sm backdrop-blur-md transition-all hover:border-emerald-400/45 hover:bg-emerald-500/10 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20 sm:flex sm:mr-1"
          >
            <Globe className="h-4 w-4" strokeWidth={1.75} />
            Back Home
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/20 bg-black/40 text-emerald-100/90 shadow-sm backdrop-blur-md transition-all hover:border-emerald-400/45 hover:bg-emerald-500/10 hover:text-white"
              aria-label="Notifications"
            >
              <Bell className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.75} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] ring-2 ring-black/60" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 mt-2 w-80 rounded-2xl border border-emerald-500/20 bg-black/90 p-4 shadow-2xl backdrop-blur-xl"
                >
                  <h3 className="mb-3 text-sm font-semibold text-white">Notifications</h3>
                  <div className="space-y-2">
                    <div className="rounded-xl bg-white/5 p-3 text-sm text-zinc-300">
                      New donation review requests are waiting in your queue.
                    </div>
                    <div className="rounded-xl bg-white/5 p-3 text-sm text-zinc-300">
                      Keep your compliance docs current to maintain trust visibility.
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-emerald-500/25 bg-black/40 shadow-sm backdrop-blur-md transition-all hover:border-emerald-400/50 hover:shadow-[0_0_16px_rgba(52,211,153,0.25)]"
              aria-label="Profile"
            >
              <img
                src={
                  payload?.ngo.image ||
                  'https://storage.googleapis.com/banani-avatars/avatar%2Ffemale%2F25-35%2FSouth%20Asian%2F4'
                }
                alt="Profile picture"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-12 mt-2 w-64 overflow-hidden rounded-2xl border border-emerald-500/20 bg-black/90 shadow-2xl backdrop-blur-xl"
                >
                  <div className="border-b border-white/10 p-4">
                    <p className="truncate text-sm font-medium text-white">
                      {payload?.ngo.organizationName || 'NGO account'}
                    </p>
                    <p className="truncate text-xs text-zinc-400">
                      {payload?.ngo.email || 'ngo@example.com'}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      type="button"
                      onClick={() => setActive('settings')}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Settings className="h-4 w-4" />
                      Organization settings
                    </button>
                    <button
                      type="button"
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

function DashboardHome({ payload }: { payload: NGODashboardPayload | null }) {
  const stats = [
    { label: 'Items received', value: payload?.metrics.itemsReceived ?? '--', icon: Gift, bar: 'bg-emerald-500' },
    { label: 'Requests fulfilled', value: payload?.metrics.requestsFulfilled ?? '--', icon: CheckCircle2, bar: 'bg-zinc-800' },
    { label: 'People supported', value: payload?.metrics.peopleSupported ?? '--', icon: Users, bar: 'bg-emerald-600' },
    { label: 'Reliability score', value: payload?.metrics.reliabilityScore ?? '--', icon: Star, bar: 'bg-zinc-600' },
  ];

  const recentActivity = payload?.recentActivity.length
    ? payload.recentActivity.map((item) => ({
        t: item.title.replace(/\b\w/g, (char) => char.toUpperCase()),
        d: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
      }))
    : [
        { t: 'Trust profile ready for outreach', d: 'Today' },
        { t: 'Add your first event drive to boost visibility', d: 'Soon' },
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={tPage}
      className="mt-10 space-y-8"
    >
      <div className={`relative overflow-hidden rounded-2xl border border-white/15 ${glassDark} bg-black/30`}>
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(ellipse_85%_70%_at_100%_0%,rgba(52,211,153,0.14),transparent_58%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[linear-gradient(to_left,rgba(16,185,129,0.11)_0%,rgba(5,150,105,0.045)_28%,transparent_56%)]"
          aria-hidden
        />
        <div className="relative z-10 p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400/90">NGO overview</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Trusted impact, visible in one place
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-300/95 sm:text-base">
            Track inbound donations, fulfilled requests, and community support while keeping your verification and security posture visible.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-950/25 px-4 py-2 text-sm font-medium text-zinc-100 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]" />
              {payload?.ngo.isVerified ? 'Verified partner profile' : 'Verification in progress'}
            </span>
            {payload?.ngo.mfaSetupComplete && (
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-950/25 px-4 py-2 text-sm font-medium text-sky-100 backdrop-blur-sm">
                <KeyRound className="h-4 w-4" />
                MFA secured
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, ...tPage }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-300/10 to-blue-400/10 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-[24px] transition-all hover:border-blue-400/30 hover:from-slate-300/15 hover:to-blue-400/15"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-300/30 bg-blue-300/10 text-blue-200 shadow-md transition-shadow group-hover:shadow-lg group-hover:shadow-blue-500/20">
              <s.icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-300 drop-shadow-md">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-white drop-shadow-lg">{s.value}</p>
            <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
              <div className={`h-full w-3/4 rounded-full ${s.bar}`} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-300/10 to-blue-400/10 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-[24px] sm:p-8">
          <h4 className="text-base font-semibold text-white">Recent activity</h4>
          <ul className="mt-4 divide-y divide-white/5">
            {recentActivity.map((row) => (
              <li key={`${row.t}-${row.d}`} className="flex items-center justify-between gap-4 py-4 first:pt-0">
                <span className="text-sm text-zinc-300">{row.t}</span>
                <span className="shrink-0 text-xs text-zinc-400">{row.d}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] backdrop-blur-[24px]">
          <h4 className="text-base font-semibold text-white">Trust snapshot</h4>
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Mission area</p>
              <p className="mt-2 text-sm text-white">{payload?.ngo.missionArea || 'Community support'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Security method</p>
              <p className="mt-2 text-sm text-white">
                {payload?.ngo.mfaMethod === 'webauthn'
                  ? 'Security key'
                  : payload?.ngo.mfaMethod === 'authenticator'
                    ? 'Authenticator app'
                    : 'Not linked yet'}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Events hosted</p>
              <p className="mt-2 text-sm text-white">{payload?.metrics.eventsHosted ?? 0}</p>
            </div>
          </div>
        </div>
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
      className="mt-10 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-300/10 to-blue-400/10 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-[24px] sm:p-6"
    >
      {children}
    </motion.div>
  );
}

function MFABootstrapModal({
  open,
  ngoId,
  email,
  organizationName,
  onComplete,
  onDismiss,
}: {
  open: boolean;
  ngoId?: string;
  email?: string;
  organizationName?: string;
  onComplete: () => void;
  onDismiss: () => void;
}) {
  const [secret, setSecret] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    if (!open || !ngoId || !email || !organizationName || qrCodeUrl) {
      return;
    }

    let ignore = false;
    const loadSecret = async () => {
      setIsLoading(true);
      setError('');

      try {
        const res = await fetch('/api/auth/mfa/generate-secret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ngoId,
            method: 'authenticator',
            email,
            organizationName,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to generate QR code');
        }
        if (!ignore) {
          setSecret(data.secret);
          setQrCodeUrl(data.qrCodeUrl ?? null);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Failed to start MFA setup');
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadSecret();
    return () => {
      ignore = true;
    };
  }, [open, ngoId, email, organizationName, qrCodeUrl]);

  const handleVerify = async () => {
    if (!ngoId || !secret || code.length !== 6) {
      setError('Enter the 6-digit code from Google or Microsoft Authenticator.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/mfa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ngoId,
          code,
          secret,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setBackupCodes(data.backupCodes ?? []);
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="fixed left-1/2 top-1/2 z-[80] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 shadow-2xl"
          >
            <div className="border-b border-white/10 bg-gradient-to-r from-emerald-600/20 to-teal-600/10 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10">
                  <ShieldCheck className="h-6 w-6 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Secure your NGO login</h3>
                  <p className="text-sm text-zinc-300">
                    First approved login detected. Scan this QR code with Google or Microsoft Authenticator.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-6 p-6 lg:grid-cols-[1fr_1.1fr]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Step 1</p>
                <p className="mt-2 text-sm text-white">Open your authenticator app and scan the QR code.</p>
                <div className="mt-5 flex min-h-[260px] items-center justify-center rounded-2xl bg-white p-4">
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                  ) : qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="MFA QR code" className="h-56 w-56 rounded-xl object-contain" />
                  ) : (
                    <div className="space-y-3 text-left text-sm text-zinc-600">
                      <p className="font-medium text-zinc-800">Manual setup</p>
                      <p>Add this key to Google Authenticator, Microsoft Authenticator, 1Password, or Authy.</p>
                      {secret ? (
                        <code className="block break-all rounded-xl border border-zinc-200 bg-zinc-100 px-3 py-3 text-xs text-zinc-900">
                          {secret}
                        </code>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Step 2</p>
                  <p className="mt-2 text-sm text-white">
                    Enter the 6-digit code from your authenticator app to finish setup.
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
                    className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-center text-2xl tracking-[0.35em] text-white outline-none transition-all focus:border-emerald-500/40 focus:ring-2 focus:ring-emerald-500/30"
                    placeholder="000000"
                  />
                  {secret && (
                    <p className="mt-4 break-all rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-zinc-400">
                      Manual key: {secret}
                    </p>
                  )}
                  {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
                  <div className="mt-5 flex gap-3">
                    <button
                      type="button"
                      onClick={onDismiss}
                      className="flex-1 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      Remind me later
                    </button>
                    <button
                      type="button"
                      onClick={handleVerify}
                      disabled={isLoading}
                      className="flex-1 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-black transition-colors hover:bg-emerald-500 disabled:opacity-60"
                    >
                      Finish setup
                    </button>
                  </div>
                </div>

                {backupCodes.length > 0 && (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
                    <p className="text-sm font-semibold text-amber-100">Backup codes generated</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-amber-50">
                      {backupCodes.slice(0, 6).map((item) => (
                        <code key={item} className="rounded-lg bg-black/20 px-2 py-1">
                          {item}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default function NGOPremiumDashboard() {
  const [active, setActive] = useState<SectionId>('dashboard');
  const [payload, setPayload] = useState<NGODashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMFAModal, setShowMFAModal] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadDashboard = async () => {
      try {
        const res = await fetch('/api/ngo/dashboard', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Failed to load dashboard');
        }
        if (!ignore) {
          setPayload(data);
          setShowMFAModal(
            data.ngo.verificationStatus === 'approved' &&
              data.ngo.isFirstLogin &&
              !data.ngo.mfaSetupComplete
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };

    void loadDashboard();
    return () => {
      ignore = true;
    };
  }, []);

  const complianceBadges = useMemo(() => {
    const baseBadges = payload?.ngo.isVerified ? ['Verified NGO'] : [];
    return [...baseBadges, ...(payload?.ngo.complianceBadges ?? [])];
  }, [payload]);

  const refreshDashboard = async () => {
    const res = await fetch('/api/ngo/dashboard', { cache: 'no-store' });
    const data = await res.json();
    if (res.ok) {
      setPayload(data);
      setShowMFAModal(false);
    }
  };

  return (
    <div className={pageBg}>
      <Blob top="6%" left="4%" className="from-emerald-400/12 to-transparent" />
      <Blob delay={2} top="45%" left="70%" size="w-80" className="from-zinc-300/15 to-transparent" />
      <Blob delay={4} top="70%" left="12%" size="w-72" className="from-emerald-300/10 to-transparent" />

      <Sidebar
        active={active}
        setActive={setActive}
        badges={complianceBadges}
        securityReady={Boolean(payload?.ngo.mfaSetupComplete)}
      />
      <TopBar payload={payload} setActive={setActive} />

      <main className="ml-72 max-w-[1680px] px-4 pb-12 pt-[5.75rem] sm:ml-80 sm:px-8">
        {isLoading ? (
          <div className="mt-10 flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {active === 'dashboard' && <DashboardHome key="dashboard" payload={payload} />}
            {active === 'donations' && (
              <SectionFrame key="donations">
                <MyDonations mode="ngo" />
              </SectionFrame>
            )}
            {active === 'requests' && (
              <SectionFrame key="requests">
                <MyRequests mode="ngo" />
              </SectionFrame>
            )}
            {active === 'messages' && (
              <SectionFrame key="messages">
                <MessagesInbox mode="ngo" />
              </SectionFrame>
            )}
            {active === 'ngos' && (
              <SectionFrame key="ngos">
                <NearbyNGOs mode="ngo" />
              </SectionFrame>
            )}
            {active === 'events' && (
              <SectionFrame key="events">
                <EventsDrives mode="ngo" />
              </SectionFrame>
            )}
            {active === 'settings' && (
              <SectionFrame key="settings">
                <SettingsView mode="ngo" />
              </SectionFrame>
            )}
          </AnimatePresence>
        )}
      </main>

      <MFABootstrapModal
        open={showMFAModal}
        ngoId={payload?.ngo.id}
        email={payload?.ngo.email}
        organizationName={payload?.ngo.organizationName}
        onDismiss={() => setShowMFAModal(false)}
        onComplete={() => {
          void refreshDashboard();
        }}
      />
    </div>
  );
}
