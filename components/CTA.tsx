'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const CTA = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-emerald-900 to-emerald-800 text-white overflow-hidden">
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
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Ready to Make a Difference?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-lg text-emerald-100 mb-10 leading-relaxed"
          >
            Declutter your home and help your community. Join ShareNest today and be part of the change.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-emerald-500 text-white font-medium text-base rounded-lg hover:bg-emerald-400 transition-colors shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-300"
            >
              Create Free Account
            </Link>
            <Link
              href="/register-ngo"
              className="px-8 py-3.5 bg-transparent border border-white/30 text-white font-medium text-base rounded-lg hover:bg-white/10 transition-colors hover:-translate-y-1 transform duration-300"
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
        className="absolute top-[-20%] left-[-10%] w-[300px] h-[300px] rounded-full border border-emerald-400/20 z-0"
      />
      <motion.div 
        animate={{ rotate: -360, scale: [1, 1.2, 1] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-30%] right-[-10%] w-[500px] h-[500px] rounded-full border border-emerald-400/10 z-0"
      />
    </section>
  );
};

export default CTA;
