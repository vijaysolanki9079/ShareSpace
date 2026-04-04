'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useImageSequence } from '@/hooks/useImageSequence';

const HeroWithAnimation = () => {
    // 80 images in /public/assets/transitions (000 to 079)
    const canvasRef = useImageSequence({
        frameCount: 80,
        imagePrefix: '/assets/transitions/Create_a_smooth_202602151314_feos1_',
        imageSuffix: '.jpg',
        fps: 24,
        loop: true
    });

    return (
        <section className="relative bg-slate-900 min-h-[850px] flex items-center justify-center text-white overflow-hidden">
            {/* Checkered Pattern Background */}
            <div
                className="absolute inset-0 opacity-10 pointer-events-none z-10"
                style={{
                    backgroundImage: `
                        linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000),
                        linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)
                    `,
                    backgroundSize: '60px 60px',
                    backgroundPosition: '0 0, 30px 30px'
                }}
            />

            {/* Animation Canvas Container */}
            <div className="absolute inset-0 z-0">
                <canvas 
                    ref={canvasRef}
                    className="w-full h-full object-cover mix-blend-screen opacity-60"
                />
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content Layer - Always on top (z-20) */}
            <div className="relative z-20 max-w-3xl mx-auto px-6 text-center pt-20">
                {/* Eyebrow */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                    transition={{ duration: 0.8 }}
                    className="uppercase tracking-[0.2em] text-xs font-semibold mb-6"
                >
                    Experience
                </motion.div>

                {/* Main Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="text-7xl md:text-8xl font-extrabold leading-tight mb-6 tracking-[0.25em]"
                    style={{
                        textShadow: '2px 2px 0px rgba(0, 0, 0, 0.1)',
                        letterSpacing: '0.15em',
                    }}
                >
                    COMMUNITY<br />GIVING
                </motion.h1>

                {/* Description */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.9 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-base md:text-lg leading-relaxed mb-10 max-w-xl mx-auto"
                >
                    Turn everyday items into powerful acts of kindness. ShareNest connects your donations with nearby individuals and verified NGOs—always free, always impact-first.
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="flex flex-wrap gap-4 justify-center mb-16"
                >
                    <button className="px-8 py-3 bg-white text-black font-medium rounded-lg hover:bg-white/90 transition-all shadow-lg hover:shadow-xl hover:scale-105">
                        Start Donating
                    </button>
                    <button className="px-8 py-3 bg-transparent border border-white/60 text-white font-medium rounded-lg hover:bg-white/10 transition-all hover:scale-105">
                        Explore Nearby NGOs
                    </button>
                </motion.div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.7 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="flex flex-col items-center text-xs mt-20"
                >
                    <span className="mb-3">Scroll to see how ShareNest works</span>
                    <motion.div 
                        animate={{ height: ['40px', '20px', '40px'], opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-px bg-white"
                    />
                </motion.div>
            </div>

            {/* Curved Bottom Edge */}
            <div
                className="absolute bottom-0 left-0 right-0 h-12 bg-slate-50 z-20"
                style={{
                    borderTopLeftRadius: '50% 40px',
                    borderTopRightRadius: '50% 40px',
                    transform: 'translateY(50%)'
                }}
            />
        </section>
    );
};

export default HeroWithAnimation;
