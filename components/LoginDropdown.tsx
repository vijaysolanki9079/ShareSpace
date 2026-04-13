'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, Shield } from 'lucide-react';

interface LoginDropdownProps {
  isDarkBg?: boolean;
  isLight?: boolean;
  className?: string;
}

export default function LoginDropdown({ isDarkBg, isLight, className = '' }: LoginDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isRegisterNgo = pathname?.startsWith('/register-ngo');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLightBg = isDarkBg || isLight;

  return (
    <div className="relative inline-block" ref={rootRef}>
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`rounded-full px-5 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
          isLightBg
            ? 'text-white/80 hover:text-white hover:bg-white/10'
            : 'text-gray-900 border border-gray-300 hover:bg-gray-50'
        } ${className}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        Log in
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" strokeWidth={2} />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`absolute top-[calc(100%+8px)] left-0 z-50 min-w-[240px] rounded-2xl shadow-2xl border overflow-hidden ${
              isRegisterNgo
                ? 'bg-[#022c22] border-[#064e3b] shadow-xl'
                : isLightBg
                ? 'backdrop-blur-lg bg-gradient-to-br from-white/20 via-white/15 to-white/10 border-white/30 shadow-xl shadow-black/10'
                : 'backdrop-blur-lg bg-gradient-to-br from-white/95 via-white/90 to-white/85 border-white/40 shadow-lg'
            }`}
          >
            {/* Normal User Option */}
            <Link href="/login" onClick={() => setIsOpen(false)}>
              <motion.div
                className={`flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer group ${
                  isLightBg
                    ? 'hover:bg-white/20 text-white'
                    : 'hover:bg-blue-50/80 text-gray-900'
                }`}
                whileHover={{ x: 4 }}
              >
                <div className={`p-2.5 rounded-lg transition-all ${
                  isLightBg ? 'bg-blue-500/20 group-hover:bg-blue-500/30' : 'bg-blue-100/80 group-hover:bg-blue-100'
                }`}>
                  <User className={`w-4 h-4 ${isLightBg ? 'text-blue-300' : 'text-blue-600'}`} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className={`font-semibold text-sm ${isLightBg ? 'text-white' : 'text-gray-900'}`}>Normal User</p>
                  <p className={`text-xs ${isLightBg ? 'text-white/60' : 'text-gray-500'}`}>Donate or request</p>
                </div>
              </motion.div>
            </Link>

            {/* Divider */}
            <div className={`h-px mx-2 ${isLightBg ? 'bg-white/10' : 'bg-gray-200/50'}`} />

            {/* NGO Option */}
            <Link href="/ngo-login" onClick={() => setIsOpen(false)}>
              <motion.div
                className={`flex items-center gap-3 px-4 py-3.5 transition-colors cursor-pointer group ${
                  isLightBg
                    ? 'hover:bg-white/20 text-white'
                    : 'hover:bg-emerald-50/80 text-gray-900'
                }`}
                whileHover={{ x: 4 }}
              >
                <div className={`p-2.5 rounded-lg transition-all ${
                  isLightBg ? 'bg-emerald-500/20 group-hover:bg-emerald-500/30' : 'bg-emerald-100/80 group-hover:bg-emerald-100'
                }`}>
                  <Shield className={`w-4 h-4 ${isLightBg ? 'text-emerald-300' : 'text-emerald-600'}`} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <p className={`font-semibold text-sm flex items-center gap-1.5 ${isLightBg ? 'text-white' : 'text-gray-900'}`}>
                    NGO
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-all ${
                      isLightBg
                        ? 'bg-emerald-500/30 text-emerald-200'
                        : 'bg-emerald-100/90 text-emerald-700'
                    }`}>
                      Secure
                    </span>
                  </p>
                  <p className={`text-xs ${isLightBg ? 'text-white/60' : 'text-gray-500'}`}>2FA verified access</p>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
