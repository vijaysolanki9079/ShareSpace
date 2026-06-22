'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'next-auth/react';
import { ChevronDown, Menu, X } from 'lucide-react';
import LoginDropdown from '@/components/LoginDropdown';

type NavbarProps = {
  variant?: 'light' | 'dark';
  background?: string;
  className?: string;
};

const navPillBase =
  'hidden lg:flex items-center gap-1 rounded-full border px-2 py-1.5 backdrop-blur-md shadow-sm';

function getNavItems(pathname: string | null) {
  const howItWorksHref = pathname === '/' ? '#how-it-works' : '/#how-it-works';

  return [
    { href: '/explore', label: 'Explore NGOs' },
    { href: '/donations', label: 'Donations' },
    { href: '/requests', label: 'Requests' },
    { href: howItWorksHref, label: 'How It Works' },
    { href: '/about', label: 'About' },
  ];
}

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
  const navItems = getNavItems(pathname);

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
      'flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md shadow-sm sm:gap-2';

    return (
      <div className={shell}>
        <LoginDropdown isDarkBg={true} className="px-3 py-1.5 text-xs sm:px-5 sm:py-2 sm:text-sm" />
        <Link
          href="/signup"
          className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700 sm:px-5 sm:py-2 sm:text-sm"
        >
          Register
        </Link>
      </div>
    );
  }

  // For light backgrounds
  const shell =
    isLight
      ? 'flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md shadow-sm sm:gap-2'
      : 'flex items-center gap-1.5 rounded-full border border-slate-900/10 bg-slate-900/[0.04] p-1 backdrop-blur-md shadow-sm sm:gap-2';

  return (
    <div className={shell}>
      <LoginDropdown isLight={isLight} className="px-3 py-1.5 text-xs sm:px-5 sm:py-2 sm:text-sm" />
      <Link
        href="/signup"
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-5 sm:py-2 sm:text-sm ${signupBtn}`}
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
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = getNavItems(pathname);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };

  const dashboardHref = user?.type === 'ngo' ? '/ngo-dashboard' : '/dashboard';

  return (
    <nav className={`${className} ${background}`}>
      <div className="container relative mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-5">
        <Link href="/" className="group flex shrink-0 items-center gap-3">
          <div className="flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
            <Image
              src="/images/-logo-main.png"
              alt="ShareSpace Logo"
              width={40}
              height={40}
              className="mb-1 h-8 w-8 sm:mb-1.5 sm:h-10 sm:w-10"
            />
          </div>
          <span
            className={`text-base font-extrabold tracking-tight drop-shadow-sm transition-opacity group-hover:opacity-90 sm:text-xl ${textColor}`}
          >
            ShareSpace
          </span>
        </Link>

        <NavLinksGroup isLight={isLight} secondaryTextColor={secondaryTextColor} isDarkBg={isDarkBg} />

        <div className="hidden shrink-0 items-center gap-3 lg:flex lg:min-w-0">
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

        <button
          type="button"
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border backdrop-blur-md transition-colors lg:hidden ${
            isDarkBg || isLight
              ? 'border-white/20 bg-white/10 text-white hover:bg-white/15'
              : 'border-slate-900/10 bg-white/80 text-slate-900 hover:bg-white'
          }`}
          onClick={() => setMobileMenuOpen((value) => !value)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {mobileMenuOpen && (
          <div
            className={`absolute left-4 right-4 top-[calc(100%+0.5rem)] z-[100] overflow-hidden rounded-2xl border p-2 shadow-2xl backdrop-blur-xl lg:hidden ${
              isDarkBg || isLight
                ? 'border-white/20 bg-slate-950/90 text-white'
                : 'border-slate-200 bg-white/95 text-slate-950'
            }`}
          >
            <div className="grid gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isDarkBg || isLight ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            <div className={`my-2 h-px ${isDarkBg || isLight ? 'bg-white/10' : 'bg-slate-200'}`} />

            {!isAuthenticated || !user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-center text-sm font-semibold ${
                    isDarkBg || isLight ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="grid gap-2">
                <Link
                  href={dashboardHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-xl bg-emerald-600 px-3 py-2.5 text-center text-sm font-semibold text-white"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold ${
                    isDarkBg || isLight ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
