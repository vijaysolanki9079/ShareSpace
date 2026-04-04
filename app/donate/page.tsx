'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Camera, Shirt, Armchair, Gamepad2, Monitor, Book,
    Package, CheckCircle2, Heart, ArrowRight, MapPin
} from 'lucide-react';

const Donate = () => {
    const [selectedCategory, setSelectedCategory] = useState('Clothes');
    const [selectedCondition, setSelectedCondition] = useState('Like New');

    const categories = [
        { name: 'Clothes', icon: <Shirt size={20} /> },
        { name: 'Furniture', icon: <Armchair size={20} /> },
        { name: 'Toys', icon: <Gamepad2 size={20} /> },
        { name: 'Electronics', icon: <Monitor size={20} /> },
        { name: 'Books', icon: <Book size={20} /> },
        { name: 'Other', icon: <Package size={20} /> },
    ];

    const conditions = ['New', 'Like New', 'Good', 'Fair'];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="min-h-screen bg-white font-sans text-gray-900"
        >
            <div className="flex min-h-screen flex-col lg:flex-row">
                {/* Left Side: Visual & Info */}
                <div className="w-full lg:w-[40%] bg-emerald-900 relative overflow-hidden flex flex-col justify-center p-8 lg:p-16 text-white">
                    <div className="absolute inset-0 opacity-20">
                        <img
                            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1600&auto=format&fit=crop"
                            alt="Donation Impact"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-900/90 to-emerald-800/80"></div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
                                <Heart size={14} className="fill-emerald-400" />
                                Make an Impact
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-white shadow-sm">
                                Share the Joy of Giving
                            </h1>
                            <p className="text-emerald-100 text-lg mb-10 leading-relaxed max-w-md opacity-90">
                                Your unused items could be exactly what someone else is searching for. Our verified NGO network ensures your donations reach the right hands.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { title: "Quick Listing", desc: "Snap a photo and list in under 60 seconds." },
                                    { title: "Direct Connect", desc: "Get matched with local NGOs and individuals." },
                                    { title: "Track Impact", desc: "See the difference your donation makes." }
                                ].map((step, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-emerald-500/20 transition-colors">
                                            <CheckCircle2 className="text-emerald-400" size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white mb-0.5">{step.title}</h4>
                                            <p className="text-emerald-200/60 text-sm leading-snug">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="w-full lg:w-[60%] bg-gray-50 flex flex-col justify-start p-6 lg:p-10 pt-16 lg:pt-24">
                    <div className="max-w-2xl mx-auto w-full">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="bg-white rounded-3xl p-6 lg:p-8 shadow-xl shadow-gray-200/50 border border-gray-100"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-50 pb-3">Item Details</h2>

                            <div className="space-y-5">
                                {/* Photos Section */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Item Photo</label>
                                    <div className="border-2 border-dashed border-gray-100 rounded-2xl p-6 text-center cursor-pointer bg-gray-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition-all group">
                                        <Camera className="mx-auto text-gray-300 group-hover:text-emerald-500 mb-2 transition-colors" size={28} />
                                        <p className="text-xs font-bold text-emerald-600">Click to upload <span className="text-gray-400 font-medium">or drag photos</span></p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Winter Jacket, LG"
                                            className="w-full h-11 px-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Zip Code</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="10001"
                                                className="w-full h-11 pl-10 pr-4 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium"
                                            />
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                                        </div>
                                    </div>
                                </div>

                                {/* Category Search Grid */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Category</label>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat.name}
                                                onClick={() => setSelectedCategory(cat.name)}
                                                className={`
                                                    flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all border
                                                    ${selectedCategory === cat.name
                                                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-50'
                                                        : 'bg-white text-gray-400 border-gray-50 hover:border-emerald-100 hover:text-emerald-600'
                                                    }
                                                `}
                                            >
                                                <div className="shrink-0 scale-90">{cat.icon}</div>
                                                <span className="text-[9px] font-bold uppercase tracking-tight">{cat.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Condition</label>
                                    <div className="flex bg-gray-100/50 p-1 rounded-xl gap-1">
                                        {conditions.map((c) => (
                                            <button
                                                key={c}
                                                onClick={() => setSelectedCondition(c)}
                                                className={`
                                                    flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all
                                                    ${selectedCondition === c
                                                        ? 'bg-white text-emerald-600 shadow-sm'
                                                        : 'text-gray-400 hover:text-gray-600'
                                                    }
                                                `}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                    <textarea
                                        rows={2}
                                        placeholder="Quick notes on item condition..."
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-sm font-medium resize-none"
                                    ></textarea>
                                </div>

                                <div className="pt-2 flex items-center justify-between gap-4">
                                    <button className="text-gray-400 font-bold text-[10px] hover:text-gray-500 transition-colors uppercase tracking-widest">
                                        Reset
                                    </button>
                                    <button className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 group text-sm">
                                        Donate Now
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

        </motion.div>
    );
};

export default Donate;
