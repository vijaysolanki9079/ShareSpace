'use client';

import React from 'react';
import Link from 'next/link';
import { useImageSequence } from '@/hooks/useImageSequence';

const Hero = () => {
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
      <div className="relative z-10 max-w-3xl mx-auto px-6 text-center pt-24 pb-12">
        {/* Eyebrow */}
        <div className="uppercase tracking-[0.2em] text-xs font-semibold mb-6 opacity-80 drop-shadow-md">
          Experience
        </div>

        {/* Main Headline */}
        <h1
          className="text-7xl md:text-8xl font-bold leading-tight mb-8 tracking-[0.15em]"
          style={{
            textShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            letterSpacing: '0.1em',
            fontWeight: 700
          }}
        >
          COMMUNITY<br />GIVING
        </h1>

        {/* Description */}
        <p
          className="text-base md:text-lg leading-relaxed opacity-90 mb-10 max-w-xl mx-auto font-normal"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)', fontWeight: 400 }}
        >
          Turn everyday items into powerful acts of kindness. ShareNest connects your donations with nearby individuals and verified NGOs—always free, always impact-first.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center items-center">
          <Link
            href="/donate"
            className="px-10 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-900/40 min-w-[220px]"
            style={{ fontWeight: 600 }}
          >
            Start Donating
          </Link>
          <Link
            href="/signup"
            className="px-10 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20 min-w-[220px]"
            style={{ fontWeight: 600 }}
          >
            Create Free Account
          </Link>
        </div>

        <div className="mt-8">
          <Link
            href="/register-ngo"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900/80 border border-emerald-500/50 text-emerald-400 font-semibold text-sm rounded-full hover:bg-gray-900 hover:border-emerald-400 transition-all"
            style={{ fontWeight: 600 }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            Register as NGO
          </Link>
        </div>

        {/* Scroll Indicator */}
        <div className="flex flex-col items-center text-xs opacity-60 mt-16 group">
          <span className="mb-3 font-medium uppercase tracking-widest group-hover:opacity-100 transition-opacity">Scroll to see how it works</span>
          <div className="w-px h-12 bg-white/40 group-hover:bg-white transition-colors"></div>
        </div>
      </div>

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
