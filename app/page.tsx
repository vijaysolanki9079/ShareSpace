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
            <HowItWorks />
            <Campaigns />
            <RecentDonations />
            <CTA />
        </motion.div>
    );
};

export default Home;
