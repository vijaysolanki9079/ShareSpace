'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'next-auth/react';
import { ChevronDown } from 'lucide-react';

type NavbarProps = {
  variant?: 'light' | 'dark';
  background?: string;
  className?: string;
};

const navPillBase =
  'hidden md:flex items-center gap-1 rounded-full border px-2 py-1.5 backdrop-blur-md shadow-sm';

function NavLinksGroup({
  isLight,
  secondaryTextColor,
  isDarkBg,
}: {
  isLight: boolean;
  secondaryTextColor: string;
  isDarkBg?: boolean;
}) {
  const pathname = usePathname();
  const howItWorksHref = pathname === '/' ? '#how-it-works' : '/#how-it-works';

  // For dark backgrounds (Explore NGOs, How it Works)
  if (isDarkBg) {
    const pill = `${navPillBase} border-white/20 bg-white/10`;
    const linkClass = `rounded-full px-4 py-2 text-sm font-medium transition-colors text-white/80 hover:text-white`;
    
    return (
      <div className={pill}>
        <Link href="/explore" className={linkClass}>
          Explore NGOs
        </Link>
        <Link href="/donations" className={linkClass}>
          Donations
        </Link>
        <Link href={howItWorksHref} className={linkClass}>
          How it Works
        </Link>
        <Link href="/about" className={linkClass}>
          About
        </Link>
      </div>
    );
  }

  // For light backgrounds
  const pill =
    isLight
      ? `${navPillBase} border-white/20 bg-white/10`
      : `${navPillBase} border-slate-900/10 bg-slate-900/[0.04]`;

  const linkClass = `rounded-full px-4 py-2 text-sm font-medium transition-colors ${secondaryTextColor}`;

  return (
    <div className={pill}>
      <Link href="/explore" className={linkClass}>
        Explore NGOs
      </Link>
      <Link href="/donations" className={linkClass}>
        Donations
      </Link>
      <Link href={howItWorksHref} className={linkClass}>
        How it Works
      </Link>
      <Link href="/about" className={linkClass}>
        About
      </Link>
    </div>
  );
}

function firstNameFromDisplayName(name: string) {
  const t = name.trim();
  if (!t) return "there";
  return t.split(/\s+/)[0] ?? t;
}

function UserAuthMenu({
  isLight,
  textColor,
  user,
  dashboardHref,
  onLogout,
  isDarkBg,
}: {
  isLight: boolean;
  textColor: string;
  user: { name: string; type: string };
  dashboardHref: string;
  onLogout: () => void;
  isDarkBg?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const firstName = firstNameFromDisplayName(user.name);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const glass =
    isDarkBg || isLight
      ? 'border border-white/20 bg-white/10 shadow-sm backdrop-blur-md'
      : 'border border-slate-900/10 bg-slate-900/[0.04] shadow-sm backdrop-blur-md';

  const triggerShell = `inline-flex max-w-[16rem] items-center gap-1.5 rounded-full py-2 pl-3.5 pr-2.5 ${glass}`;

  const menuShell = `absolute left-0 top-[calc(100%+6px)] z-[100] w-[max(100%,max-content)] max-w-[min(16rem,calc(100vw-2rem))] overflow-hidden rounded-2xl py-1 ${glass} ring-1 ring-black/5`;

  const itemLight = 'text-white hover:bg-white/15';
  const itemDark = 'text-slate-800 hover:bg-slate-900/[0.06]';

  const itemClass = isDarkBg || isLight ? itemLight : itemDark;

  return (
    <div className="relative inline-block align-middle" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${triggerShell} ${textColor} text-left text-sm`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="whitespace-nowrap">
          <span className={isDarkBg || isLight ? 'font-medium text-white/80' : 'font-medium text-gray-600'}>Hi, </span>
          <span className="inline-block max-w-[9rem] truncate align-bottom font-semibold">{firstName}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 opacity-90 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className={menuShell} role="menu">
          <Link
            href={dashboardHref}
            role="menuitem"
            className={`block px-3.5 py-2.5 text-sm font-medium ${itemClass}`}
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>
          <button
            type="button"
            role="menuitem"
            className={`w-full px-3.5 py-2.5 text-left text-sm font-medium ${isDarkBg || isLight ? `${itemLight} text-white/95` : `${itemDark} text-slate-700`}`}
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

function GuestAuthPills({
  isLight,
  loginBtn,
  signupBtn,
  isDarkBg,
}: {
  isLight: boolean;
  loginBtn: string;
  signupBtn: string;
  isDarkBg?: boolean;
}) {
  // For dark backgrounds
  if (isDarkBg) {
    const shell =
      'flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md shadow-sm';

    return (
      <div className={shell}>
        <Link
          href="/login"
          className="rounded-full px-5 py-2 text-sm font-medium transition-colors text-white/80 hover:text-white hover:bg-white/10"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-full px-5 py-2 text-sm font-medium transition-colors text-white bg-emerald-600 hover:bg-emerald-700"
        >
          Sign up
        </Link>
      </div>
    );
  }

  // For light backgrounds
  const shell =
    isLight
      ? 'flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md shadow-sm'
      : 'flex items-center gap-2 rounded-full border border-slate-900/10 bg-slate-900/[0.04] p-1 backdrop-blur-md shadow-sm';

  return (
    <div className={shell}>
      <Link
        href="/login"
        className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${loginBtn}`}
      >
        Log in
      </Link>
      <Link
        href="/signup"
        className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${signupBtn}`}
      >
        Sign up
      </Link>
    </div>
  );
}

const Navbar = ({
  variant = 'light',
  background = 'bg-transparent',
  className = 'absolute top-0 left-0 right-0 z-50',
}: NavbarProps) => {
  const isLight = variant === 'light';
  const isDarkBg = background.includes('slate-900') || background.includes('slate-950') || background.includes('[#022c22]');
  
  const textColor = isDarkBg || isLight ? 'text-white' : 'text-gray-900';
  const secondaryTextColor = isDarkBg || isLight ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900';
  const logoBg = isDarkBg || isLight ? 'bg-white/10 border-white/20' : 'bg-gray-100 border-gray-200';
  const loginBtn = isDarkBg || isLight ? 'text-white/80 border-white/40 hover:text-white hover:bg-white/10' : 'text-gray-900 border-gray-300 hover:bg-gray-50';
  const signupBtn = isDarkBg || isLight ? 'text-white bg-emerald-600 hover:bg-emerald-700' : 'text-white bg-emerald-600 hover:bg-emerald-700';

  const { user, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const dashboardHref = user?.type === 'ngo' ? '/ngo-dashboard' : '/dashboard';

  return (
    <nav className={`${className} ${background}`}>
      <div className="container mx-auto flex items-center justify-between px-6 py-5">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <div className="flex items-center justify-center bg-white/10 rounded-full transition-transform duration-300 group-hover:scale-110 border border-gray-200 shadow-md">
            <Image
              src="/images/logo-main.png"
              alt="ShareSpace Logo"
              width={48}
              height={48}
              className="w-12 h-12 object-cover rounded-full"
            />
          </div>
          <span
            className={`text-xl font-extrabold tracking-tight drop-shadow-sm transition-opacity group-hover:opacity-90 ${textColor}`}
          >
            ShareSpace
          </span>
        </Link>

        <NavLinksGroup isLight={isLight} secondaryTextColor={secondaryTextColor} isDarkBg={isDarkBg} />

        <div className="flex shrink-0 items-center gap-3 md:min-w-0">
          {!isAuthenticated || !user ? (
            <GuestAuthPills isLight={isLight} loginBtn={loginBtn} signupBtn={signupBtn} isDarkBg={isDarkBg} />
          ) : (
            <UserAuthMenu
              isLight={isLight}
              textColor={textColor}
              user={user}
              dashboardHref={dashboardHref}
              onLogout={handleLogout}
              isDarkBg={isDarkBg}
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;