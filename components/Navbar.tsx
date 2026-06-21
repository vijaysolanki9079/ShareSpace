'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'next-auth/react';
import { ChevronDown } from 'lucide-react';
import LoginDropdown from '@/components/LoginDropdown';

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
  const navItems = [
    { href: '/explore', label: 'Explore NGOs' },
    { href: '/donations', label: 'Donations' },
    { href: '/requests', label: 'Requests' },
    { href: howItWorksHref, label: 'How It Works' },
    { href: '/about', label: 'About' },
  ];

  const isActive = (item: { href: string; activePath?: string }) => {
    const activePath = item.activePath ?? item.href;
    if (activePath === '/') return pathname === '/';
    return pathname === activePath || pathname.startsWith(`${activePath}/`);
  };

  const getLinkClass = (active: boolean, darkMode: boolean) => {
    const base =
      'relative rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300';
    const inactive = darkMode
      ? 'text-white/78 hover:text-white'
      : secondaryTextColor;
    const activeClass = darkMode
      ? 'text-white drop-shadow-[0_0_14px_rgba(16,185,129,0.65)]'
      : 'text-gray-950';

    return `${base} ${active ? activeClass : inactive}`;
  };

  const ActiveGlow = ({ active, darkMode }: { active: boolean; darkMode: boolean }) => (
    <>
      {active && (
        <>
          <span
            className={`absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full ${
              darkMode ? 'bg-emerald-300' : 'bg-emerald-500'
            } shadow-[0_0_14px_rgba(16,185,129,0.85)]`}
          />
          <span
            className={`absolute inset-x-2 bottom-0 h-6 rounded-full blur-md ${
              darkMode ? 'bg-emerald-300/20' : 'bg-emerald-400/20'
            }`}
          />
        </>
      )}
    </>
  );

  // For dark backgrounds (Explore NGOs, How it Works)
  if (isDarkBg) {
    const pill = `${navPillBase} border-white/20 bg-white/10`;
    
    return (
      <div className={pill}>
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <Link key={item.label} href={item.href} className={getLinkClass(active, true)}>
              <span className="relative z-10">{item.label}</span>
              <ActiveGlow active={active} darkMode />
            </Link>
          );
        })}
      </div>
    );
  }

  // For light backgrounds
  const pill =
    isLight
      ? `${navPillBase} border-white/20 bg-white/10`
      : `${navPillBase} border-slate-900/10 bg-slate-900/[0.04]`;

  return (
    <div className={pill}>
      {navItems.map((item) => {
        const active = isActive(item);
        return (
          <Link key={item.label} href={item.href} className={getLinkClass(active, isLight)}>
            <span className="relative z-10">{item.label}</span>
            <ActiveGlow active={active} darkMode={isLight} />
          </Link>
        );
      })}
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
          <span className={isDarkBg || isLight ? 'font-medium text-white/80' : 'font-medium text-gray-600'}>Welcome, </span>
          <span className="inline-block max-w-[9rem] truncate align-bottom font-semibold">{firstName}</span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 opacity-90 transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.75} />
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
  signupBtn,
  isDarkBg,
}: {
  isLight: boolean;
  signupBtn: string;
  isDarkBg?: boolean;
}) {
  // For dark backgrounds
  if (isDarkBg) {
    const shell =
      'flex items-center gap-2 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md shadow-sm';

    return (
      <div className={shell}>
        <LoginDropdown isDarkBg={true} />
        <Link
          href="/signup"
          className="rounded-full px-5 py-2 text-sm font-medium transition-colors text-white bg-emerald-600 hover:bg-emerald-700"
        >
          Register
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
      <LoginDropdown isLight={isLight} />
      <Link
        href="/signup"
        className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${signupBtn}`}
      >
        Register
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
          <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/images/-logo-main.png"
              alt="ShareSpace Logo"
              width={40}
              height={40}
              className="w-10 h-10 mb-1.5"
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
            <GuestAuthPills isLight={isLight} signupBtn={signupBtn} isDarkBg={isDarkBg} />
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
