'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Users } from 'lucide-react';

const About = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-gray-50 flex flex-col font-sans"
        >

            {/* Hero Section with Background */}
            <div className="relative bg-gray-900 min-h-[100svh] border-b border-transparent flex flex-col justify-end">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop"
                        alt="Background"
                        className="w-full h-full object-cover opacity-60 blur-[2px] scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/90"></div>
                </div>

                <div className="relative z-10 w-full mb-16 sm:mb-24">
                    {/* Hero Content */}
                    <section className="px-6 text-center text-white">
                        <div className="container mx-auto max-w-4xl">
                            <motion.span 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="inline-block bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-emerald-400 mb-6 shadow-xl"
                            >
                                Our Mission
                            </motion.span>
                            
                            <motion.h1 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 text-white leading-[1.1] drop-shadow-2xl"
                            >
                                Building a World Where Giving is Second Nature
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-lg md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed drop-shadow-md font-medium"
                            >
                                ShareNest isn&apos;t just a platform; it&apos;s a movement to reduce waste and strengthen community bonds by ensuring usable items find a second home.
                            </motion.p>
                            
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 1 }}
                                className="mt-16 flex justify-center"
                            >
                                <div className="w-[30px] h-[50px] border-2 border-white/30 rounded-full flex justify-center p-1">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce mt-1"></div>
                                </div>
                            </motion.div>
                        </div>
                    </section>
                </div>
            </div>

            {/* Main Content with Animated Background */}
            <div className="relative overflow-hidden bg-slate-50">
                {/* Background Elements */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-emerald-50/30 to-white"></div>

                    {/* Floating Blobs */}
                    <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-[100px] animate-pulse-soft"></div>
                    <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-sky-200/20 rounded-full blur-[100px] animate-pulse-soft" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-20 left-[10%] w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-[80px] animate-pulse-soft" style={{ animationDelay: '4s' }}></div>

                    {/* Moving Curves SVG */}
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

                <div className="relative z-10">

                    {/* Why We Started Section */}
                <section className="py-24 bg-gray-50 px-6">
                    <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="rounded-[2rem] overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-transform duration-500">
                        <img
                            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop"
                            alt="Volunteers packing boxes"
                            className="w-full h-[500px] object-cover"
                        />
                        </div>
                        <div>
                        <h2 className="text-4xl md:text-5xl font-black mb-8 text-slate-900 tracking-tight">
                            Why We <span className="text-emerald-600">Started</span>
                        </h2>
                        <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                            We noticed a disconnect. Millions of usable items end up in
                            landfills every year, while countless individuals and NGOs
                            struggle to find basic resources. The problem wasn&apos;t a lack of
                            generosity, but a lack of infrastructure.
                        </p>
                        <p className="text-slate-600 text-lg mb-10 leading-relaxed">
                            ShareNest was born to bridge this gap. We created a space where
                            giving is transparent, easy, and impactful. By connecting donors
                            directly with verified NGOs, we ensure every item goes exactly where it&apos;s needed most.
                        </p>
                        
                        <div className="flex flex-wrap gap-10 border-t border-gray-200 pt-10">
                            <div>
                            <h3 className="text-4xl font-black text-slate-900">2023</h3>
                            <p className="text-sm text-emerald-600 font-bold uppercase tracking-wider mt-1">Founded</p>
                            </div>
                            <div>
                            <h3 className="text-4xl font-black text-slate-900">12</h3>
                            <p className="text-sm text-emerald-600 font-bold uppercase tracking-wider mt-1">Cities Active</p>
                            </div>
                            <div>
                            <h3 className="text-4xl font-black text-slate-900">100%</h3>
                            <p className="text-sm text-emerald-600 font-bold uppercase tracking-wider mt-1">Not-for-profit</p>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </section>

                {/* Core Values Section */}
                <section className="py-24 px-6 bg-white">
                    <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black mb-4 text-slate-900">Our Core Values</h2>
                        <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                        The principles that guide every decision we make in our mission to reduce waste.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                        { icon: <Leaf size={28} />, title: "Sustainability First", color: "emerald", text: "Every item shared is one less item in a landfill. We believe in a circular economy where resources are valued." },
                        { icon: <ShieldCheck size={28} />, title: "Trust & Safety", color: "blue", text: "We rigorously verify every NGO on our platform. Safety is the foundation of our community." },
                        { icon: <Users size={28} />, title: "Community Driven", color: "amber", text: "Real change happens locally. We empower neighborhoods to take care of their own, fostering connections." }
                        ].map((value, idx) => (
                        <div key={idx} className="group bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300">
                            <div className={`w-14 h-14 bg-${value.color}-50 rounded-2xl flex items-center justify-center mb-8 text-${value.color}-600 group-hover:scale-110 transition-transform`}>
                            {value.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 text-slate-900">{value.title}</h3>
                            <p className="text-slate-500 leading-relaxed font-medium">{value.text}</p>
                        </div>
                        ))}
                    </div>
                    </div>
                </section>

                    

                    {/* Team Section */}
                    <section className="py-24 relative overflow-hidden bg-slate-950 text-white">
                        {/* Background Accents - Matching "How It Works" */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
                            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-600/10 rounded-full mix-blend-screen filter blur-[120px]"></div>
                        </div>

                        <div className="container mx-auto px-6 relative z-10 max-w-6xl">
                            {/* Section Header */}
                            <div className="text-center mb-20">
                                <span className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Our Story</span>
                                <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                                    Meet the <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">Visionaries</span>
                                </h2>
                                <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                                    The people working behind the scenes to make sharing simple, secure, and impactful.
                                </p>
                            </div>

                            {/* Team Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    {
                                        name: "Sarah Chen",
                                        role: "Co-Founder & CEO",
                                        bio: "Former environmental scientist passionate about waste reduction.",
                                        img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
                                        glow: "group-hover:shadow-emerald-500/20",
                                        accent: "text-emerald-400"
                                    },
                                    {
                                        name: "David Okonjo",
                                        role: "Head of Technology",
                                        bio: "Building scalable tech for social good. Open source advocate.",
                                        img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
                                        glow: "group-hover:shadow-sky-500/20",
                                        accent: "text-sky-400"
                                    },
                                    {
                                        name: "Elena Rodriguez",
                                        role: "Community Lead",
                                        bio: "Connecting NGOs with corporate partners and local donors.",
                                        img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
                                        glow: "group-hover:shadow-purple-500/20",
                                        accent: "text-purple-400"
                                    },
                                    {
                                        name: "Amir Fayed",
                                        role: "Product Design",
                                        bio: "Crafting intuitive experiences that encourage generosity.",
                                        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
                                        glow: "group-hover:shadow-amber-500/20",
                                        accent: "text-amber-400"
                                    }
                                ].map((member, index) => (
                                    <div 
                                        key={index}
                                        className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl transition-all duration-500 hover:-translate-y-3 hover:bg-white/[0.08] hover:border-white/20 shadow-2xl ${member.glow}`}
                                    >
                                        {/* Profile Image with Glow Effect */}
                                        <div className="relative w-24 h-24 mx-auto mb-6">
                                            <div className={`absolute inset-0 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full ${member.accent.replace('text', 'bg')}`}></div>
                                            <img
                                                src={member.img}
                                                alt={member.name}
                                                className="w-full h-full rounded-full object-cover border-2 border-white/10 group-hover:border-emerald-500/50 transition-all duration-500 relative z-10"
                                            />
                                        </div>

                                        <div className="text-center relative z-10">
                                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-white transition-colors">
                                                {member.name}
                                            </h3>
                                            <p className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-4 ${member.accent}`}>
                                                {member.role}
                                            </p>
                                            <p className="text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                                                {member.bio}
                                            </p>
                                        </div>

                                        {/* Hover Bottom Decoration */}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent group-hover:w-1/2 transition-all duration-500"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CTA Section */}
                    <section className="py-6 relative overflow-hidden bg-slate-950 text-center px-6">
                        {/* Background Glows - Matching the "How It Works" logic */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full filter blur-[120px] animate-pulse"></div>
                            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-sky-500/10 rounded-full filter blur-[100px]"></div>
                        </div>

                        <div className="container mx-auto max-w-4xl relative z-10">
                            {/* Decorative Badge */}
                            <span className="inline-block text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs mb-6 px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                                Ready to make an impact?
                            </span>

                            <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-tight">
                                Be Part of the <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">Solution</span>
                            </h2>

                            <p className="text-slate-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                                Whether you have items to give or need support for your cause, 
                                there is a place for you at <span className="text-white font-medium">ShareNest</span>.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <button className="group relative bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 px-10 rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1">
                                    Join the Community
                                </button>
                                
                                <button className="bg-white/5 backdrop-blur-sm border border-white/10 text-white font-bold py-4 px-10 rounded-2xl hover:bg-white/10 transition-all duration-300">
                                    Contact Support
                                </button>
                            </div>

                            {/* Bottom Decorative Line */}
                            <div className="mt-20 w-full max-w-xs mx-auto h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                        </div>
                    </section>
                </div>
            </div>
        </motion.div>
    );
};

export default About;
