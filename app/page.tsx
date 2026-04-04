'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import HowItWorks from '@/components/HowItWorks';
import Campaigns from '@/components/Campaigns';
import RecentDonations from '@/components/RecentDonations';
import CTA from '@/components/CTA';

const Home = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen font-sans"
        >
            <Hero />
            <Stats />

            {/* Dynamic Background Wrapper for Mid-Section */}
            <div className="relative overflow-hidden bg-slate-50">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-emerald-50/30 to-white"></div>

                    {/* Floating Orbs/Blobs */}
                    <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-[100px] animate-pulse-soft"></div>
                    <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-sky-200/20 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-20 left-[10%] w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-[80px] animate-pulse-soft" style={{ animationDelay: '4s' }}></div>

                    {/* Moving Curves (SVG) */}
                    <svg className="absolute top-0 left-0 w-full h-full opacity-30" preserveAspectRatio="none">
                        <path d="M0,100 C300,200 600,0 900,100 C1200,200 1500,0 1800,100 L1800,0 L0,0 Z" fill="url(#grad1)" className="animate-float" />
                        <defs>
                            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.1 }} />
                                <stop offset="100%" style={{ stopColor: '#3b82f6', stopOpacity: 0.1 }} />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                {/* Content with Transparent Backgrounds */}
                <div className="relative z-10">
                    <div className="bg-transparent"><HowItWorks /></div>
                    <div className="bg-transparent"><Campaigns /></div>
                    <div className="bg-transparent"><RecentDonations /></div>
                </div>
            </div>

            <CTA />
        </motion.div>
    );
};

export default Home;
