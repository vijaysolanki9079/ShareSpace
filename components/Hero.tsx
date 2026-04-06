'use client';

import React, { useState, useEffect } from 'react';
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

const Hero = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleDonateClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast.error('Please sign in to donate items!');
      router.push('/login');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % CAROUSEL_TEXTS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const canvasRef = useImageSequence({
    frameCount: 80,
    imagePrefix: '/assets/transitions/Create_a_smooth_202602151314_feos1_',
    imageSuffix: '.jpg',
    fps: 24, // Reverted to 24fps
    loop: false, // Run only once
  });

  return (
    <section className="relative bg-slate-500 min-h-[850px] flex items-center justify-center text-white overflow-hidden">

      {/* Animation Canvas Container */}
      <div className="absolute inset-0 z-0">
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
        className="relative z-10 max-w-3xl mx-auto px-6 text-center pt-24 pb-12"
      >
        {/* Eyebrow */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="uppercase tracking-[0.2em] text-xs font-semibold mb-6 drop-shadow-md"
        >
          Experience
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-6xl md:text-7xl font-bold leading-tight mb-6 tracking-[0.15em]"
          style={{
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.1em',
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
          className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 md:p-6 mb-8 max-w-xl mx-auto text-center shadow-2xl overflow-hidden flex flex-col items-center"
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
          className="flex flex-wrap gap-4 justify-center items-center"
        >
          <Link
            href="/donate"
            onClick={handleDonateClick}
            className="group relative px-8 py-3.5 font-semibold rounded-xl overflow-hidden min-w-[200px] transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-emerald-900/40"
            style={{ fontWeight: 600 }}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-emerald-600 transition-colors group-hover:bg-emerald-700"></div>
            
            {/* Animated Shapes */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/30 rounded-full blur-xl group-hover:scale-[3] transition-transform duration-700 ease-out z-0"></div>
            <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-teal-300/20 rounded-full blur-lg group-hover:scale-[2] transition-transform duration-500 ease-out z-0"></div>
            
            {/* Shine Sweep Effect */}
            <div className="absolute top-[-50%] left-[20%] w-[150%] h-[200%] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:translate-x-[100%] skew-x-[-30deg] transition-transform duration-1000 ease-in-out z-0"></div>

            {/* Content Let's keep it above shapes */}
            <span className="relative z-10 text-white flex items-center justify-center gap-2">
              Start Donating
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          
          <Link
            href="/signup"
            className="px-8 py-3.5 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 min-w-[200px] text-center"
            style={{ fontWeight: 600 }}
          >
            Create Free Account
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
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900/80 border border-emerald-500/50 text-emerald-400 font-semibold text-sm rounded-full hover:bg-gray-900 hover:border-emerald-400 transition-all"
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
