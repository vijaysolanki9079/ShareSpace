'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const CTA = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-800 py-20 text-white sm:py-24">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 text-3xl font-bold sm:text-4xl md:text-5xl"
          >
            Ready to Make a <span className="text-emerald-400">Difference?</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-emerald-100 mb-10 leading-relaxed"
          >
            Declutter your home and help your community. Join ShareSpace today and be part of the change.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
          >
            <Link
              href="/signup"
            className="w-full rounded-full border border-emerald-500 bg-emerald-500 px-5 py-3 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-emerald-400 hover:shadow-emerald-500/30 sm:w-auto sm:px-8 sm:py-3.5 sm:text-base"
            >
              Create Free Account
            </Link>
            <Link
              href="/register-ngo"
              className="w-full rounded-full border-2 border-white/30 bg-transparent px-5 py-3 text-sm font-medium text-white transition-colors duration-300 hover:-translate-y-1 hover:bg-white/10 sm:w-auto sm:px-8 sm:py-3.5 sm:text-base"
            >
              Register as NGO
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      {/* Decorative Circles */}
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full border border-emerald-400/20 z-0 pointer-events-none"
      />
      <motion.div 
        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full border border-emerald-400/10 z-0 pointer-events-none"
      />
    </section>
  );
};

export default CTA;
