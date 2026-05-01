'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, ArrowRight, Compass } from 'lucide-react';

interface IndiaOnlyModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function IndiaOnlyModal({ isOpen, onClose }: IndiaOnlyModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
                    {/* Backdrop with sophisticated blur */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-emerald-950/40 backdrop-blur-md"
                    />

                    {/* The Premium Card */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.25)] overflow-hidden border border-emerald-50"
                    >
                        {/* Decorative Top Pattern */}
                        <div className="h-32 bg-emerald-900 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 to-transparent" />
                            <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl" />
                            
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 flex items-center justify-center shadow-2xl">
                                     <span className="text-4xl">🇮🇳</span>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-10 pt-12 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full mb-6 border border-emerald-100">
                                <Compass className="text-emerald-600" size={14} />
                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-[0.2em]">Geographic Focus</span>
                            </div>

                            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">
                                Domestic Mission Only
                            </h2>
                            
                            <p className="text-gray-500 leading-relaxed max-w-sm mx-auto mb-10 font-medium">
                                ShareSpace is currently dedicated to empowering communities within <span className="text-emerald-700 font-bold">India</span>. We are focusing our resources to create the maximum local impact before expanding globally.
                            </p>

                            <div className="space-y-4">
                                <button 
                                    onClick={onClose}
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group"
                                >
                                    <span>Continue Exploring India</span>
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                                
                                <button 
                                    onClick={onClose}
                                    className="w-full text-gray-400 hover:text-gray-600 text-sm font-bold py-2 transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>

                        {/* Close Icon */}
                        <button 
                            onClick={onClose}
                            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-2"
                        >
                            <X size={20} />
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
