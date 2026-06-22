'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useImageSequence } from '@/hooks/useImageSequence';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-hot-toast';

const CAROUSEL_TEXTS = [
  '"Turn everyday items into powerful acts of kindness. ShareSpace connects your donations with nearby individuals and verified NGOs—always free, always impact-first."',
  '"Give your pre-loved belongings a second life. Join a growing community dedicated to sustainability, reducing waste, and empowering local neighborhoods."',
  '"Every donation makes a difference. Whether it\'s clothing, electronics, or furniture, your contribution directly supports those who need it most."'
];

const HERO_SCROLL_LOCK_MS = 2200;

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const heroRef = useRef<HTMLElement | null>(null);

  const handleDonateClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error('Please sign in to donate items!');
      router.push('/login');
    }
  };

  const handleRequestClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error('Please sign in to request items!');
      router.push('/login');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_TEXTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Smooth-first-scroll guard: intercept the first user scroll/touch/keydown
  // and programmatically perform a smooth scroll to the hero bottom.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Respect users who prefer reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // Only guard when starting at the top of the page
    if (window.scrollY > 5) return;

    let handled = false;
    let scrollLocked = true;
    const unlockAt = window.performance.now() + HERO_SCROLL_LOCK_MS;
    const listenerOptions: AddEventListenerOptions = { passive: false };
    const root = document.documentElement;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    const removeListeners = () => {
      window.removeEventListener('wheel', onWheel, listenerOptions);
      window.removeEventListener('touchmove', onTouchMove, listenerOptions);
      window.removeEventListener('keydown', onKeyDown);
    };

    const unlockScroll = () => {
      if (!scrollLocked) return;
      scrollLocked = false;
      root.style.overflow = previousRootOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };

    root.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    const unlockTimer = window.setTimeout(unlockScroll, HERO_SCROLL_LOCK_MS);

    const doSmoothScroll = () => {
      if (handled) return;
      handled = true;
      unlockScroll();

      const heroEl = heroRef.current;
      const target = heroEl ? heroEl.offsetHeight : window.innerHeight;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const final = Math.min(target, maxScroll);

      // Perform smooth scroll; remove listeners after a short delay to let the browser animate
      window.scrollTo({ top: final, behavior: 'smooth' });
      setTimeout(removeListeners, 900);
    };

    const onWheel = (e: WheelEvent) => {
      if (handled) return;
      if (window.scrollY > 5) return; // don't intercept mid-page
      if (scrollLocked || window.performance.now() < unlockAt) {
        e.preventDefault();
        return;
      }
      // Don't intercept if the user is interacting with a form control
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
      const targ = e.target as HTMLElement | null;
      if (targ && targ.closest && targ.closest('input,textarea,select,button,a,[role="button"]')) return;

      e.preventDefault();
      doSmoothScroll();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (handled) return;
      if (window.scrollY > 5) return;
      if (scrollLocked || window.performance.now() < unlockAt) {
        e.preventDefault();
        return;
      }
      // Respect form interaction on touch devices
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;
      const targ = e.target as HTMLElement | null;
      if (targ && targ.closest && targ.closest('input,textarea,select,button,a,[role="button"]')) return;

      e.preventDefault();
      doSmoothScroll();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (handled) return;
      if (window.scrollY > 5) return;
      // Don't intercept when typing into inputs
      const active = document.activeElement as HTMLElement | null;
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable)) return;

      // Keys that commonly scroll down (include common space key values)
      if (
        e.key === 'PageDown' ||
        e.key === 'ArrowDown' ||
        e.key === ' ' ||
        e.key === 'Spacebar' ||
        e.code === 'Space'
      ) {
        e.preventDefault();
        if (scrollLocked || window.performance.now() < unlockAt) return;
        doSmoothScroll();
      }
    };

    // Attach non-passive listeners so we can preventDefault()
    window.addEventListener('wheel', onWheel, listenerOptions);
    window.addEventListener('touchmove', onTouchMove, listenerOptions);
    window.addEventListener('keydown', onKeyDown);

    // Cleanup
    return () => {
      handled = true;
      window.clearTimeout(unlockTimer);
      unlockScroll();
      removeListeners();
    };
  }, []);

  const canvasRef = useImageSequence({
    frameCount: 80,
    imagePrefix: '/assets/transitions/Create_a_smooth_202602151314_feos1_',
    imageSuffix: '.jpg',
    fps: 24, // Reverted to 24fps
    loop: false, // Run only once
    eagerFrameCount: 18,
  });

  return (
    <section ref={heroRef} className="relative flex min-h-[760px] items-center justify-center overflow-hidden bg-slate-500 text-white sm:min-h-[850px]">

      {/* Animation Canvas Container */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/assets/transitions/Create_a_smooth_202602151314_feos1_000.jpg')",
        }}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Cinematic Gradient Overlay for Readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.6) 100%)',
            mixBlendMode: 'multiply'
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.5) 100%)'
          }}
        />
      </div>

      {/* Content */}
      <motion.div 
        suppressHydrationWarning
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-10 pt-24 text-center sm:px-6 sm:pb-12"
      >
        {/* Eyebrow */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] drop-shadow-md sm:mb-6 sm:tracking-[0.2em]"
        >
          Experience
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-5 text-4xl font-bold leading-tight tracking-[0.06em] sm:text-5xl sm:tracking-[0.1em] md:mb-6 md:text-7xl"
          style={{
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            fontWeight: 700
          }}
        >
          COMMUNITY<br />GIVING
        </motion.h1>

        {/* Description Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative mx-auto mb-7 flex max-w-xl flex-col items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 text-center shadow-2xl backdrop-blur-sm md:mb-8 md:p-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          
          <motion.div
            className="relative z-10 text-sm md:text-base leading-relaxed mb-6 text-white font-normal min-h-[4.5rem] flex items-center justify-center"
            style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, y: -10, filter: "blur(5px)" }}
                variants={{
                  hidden: { opacity: 1 },
                  visible: {
                    opacity: 1,
                    transition: { staggerChildren: 0.04 },
                  },
                }}
              >
                {CAROUSEL_TEXTS[currentIndex].split(" ").map((word, i) => (
                  <motion.span
                    key={i}
                    variants={{
                      hidden: { opacity: 0, filter: "blur(10px)", y: 10 },
                      visible: { opacity: 0.95, filter: "blur(0px)", y: 0 }
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="inline-block mr-1.5"
                  >
                    {word}
                  </motion.span>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
            className="relative z-10 flex gap-2 items-center justify-center mt-auto"
          >
            {CAROUSEL_TEXTS.map((_, i) => (
              <motion.div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors duration-500 ${
                  i === currentIndex ? 'bg-emerald-400' : 'bg-white/30'
                }`}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4"
        >
          <Link
            href="/donations"
            onClick={handleDonateClick}
            className="group relative w-full max-w-[18rem] overflow-hidden rounded-xl px-5 py-3 text-sm font-semibold shadow-xl shadow-emerald-900/40 transition-transform hover:scale-105 active:scale-95 sm:w-auto sm:min-w-[200px] sm:px-8 sm:py-3.5 sm:text-base"
            style={{ fontWeight: 600 }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-emerald-600 transition-colors group-hover:bg-emerald-700"></div>
            
            {/* Animated Shapes */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/30 rounded-full blur-xl group-hover:scale-[3] transition-transform duration-700 ease-out z-0"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-teal-300/20 rounded-full blur-lg group-hover:scale-[2] transition-transform duration-500 ease-out z-0"></div>
            
            {/* Shine Sweep Effect */}
            <div className="absolute top-[-50%] left-[20%] w-[150%] h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[100%] skew-x-[-30deg] transition-transform duration-1000 ease-in-out z-0"></div>

            {/* Content */}
            <span className="relative z-10 text-white flex items-center justify-center gap-2">
              Donate Items
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          
          <Link
            href="/requests"
            onClick={handleRequestClick}
            className="group relative w-full max-w-[18rem] overflow-hidden rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold shadow-xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95 sm:w-auto sm:min-w-[200px] sm:px-8 sm:py-3.5 sm:text-base"
            style={{ fontWeight: 600 }}
          >
            <span className="relative z-10 text-white flex items-center justify-center gap-2">
              Request an Item
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
              </svg>
            </span>
          </Link>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-6"
        >
          <Link
            href="/register-ngo"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-gray-900/80 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all hover:border-emerald-400 hover:bg-gray-900 sm:px-6 sm:py-2.5 sm:text-sm"
            style={{ fontWeight: 600 }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Register as NGO
          </Link>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.a 
          href="#how-it-works"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex flex-col items-center text-xs mt-8 group cursor-pointer"
        >
          <span className="mb-3 font-medium uppercase tracking-widest group-hover:opacity-100 transition-opacity">Scroll to see how it works</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-12 bg-white/40 group-hover:bg-white transition-colors"
          ></motion.div>
        </motion.a>
      </motion.div>

      {/* Curved Bottom Edge */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
        <svg
          viewBox="0 0 1440 80"
          preserveAspectRatio="none"
          className="w-full h-12 block"
          fill="white"
        >
          <path d="M0,80 L0,0 Q720,80 1440,0 L1440,80 Z" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
