'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export default function MobileBackToTopButton({
  bottomClassName = 'bottom-5',
}: {
  bottomClassName?: string;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;

      if (scrollable <= 0) {
        setIsVisible(false);
        return;
      }

      const distanceFromBottom = scrollable - window.scrollY;
      const progress = window.scrollY / scrollable;
      setIsVisible(progress > 0.72 || distanceFromBottom < 560);
    };

    updateVisibility();
    const refreshTimer = window.setTimeout(updateVisibility, 600);
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);

    return () => {
      window.clearTimeout(refreshTimer);
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
          className={`fixed right-4 z-[70] inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/30 bg-emerald-500 text-white shadow-[0_18px_45px_rgba(16,185,129,0.45)] backdrop-blur-md transition-transform active:scale-95 md:hidden ${bottomClassName}`}
        >
          <span className="absolute -top-11 right-0 whitespace-nowrap rounded-full border border-emerald-200/40 bg-slate-950/90 px-3 py-1.5 text-xs font-bold text-emerald-100 shadow-xl backdrop-blur-md">
            Go to top
            <span className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-emerald-200/30 bg-slate-950/90" />
          </span>
          <span className="absolute inset-0 rounded-full bg-white/20 blur-sm" />
          <ArrowUp className="relative h-6 w-6" strokeWidth={2.4} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
