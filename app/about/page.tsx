'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Users } from 'lucide-react';

const About = () => {
  const VALUES = [
    {
      icon: <Leaf size={28} />,
      title: "Sustainability First",
      text: "Every item shared is one less item in a landfill. We believe in a circular economy where resources are valued.",
      colorClass: "bg-emerald-50",
      colorText: "text-emerald-600",
    },
    {
      icon: <ShieldCheck size={28} />,
      title: "Trust & Safety",
      text: "We rigorously verify every NGO on our platform. Safety is the foundation of our community.",
      colorClass: "bg-blue-50",
      colorText: "text-blue-600",
    },
    {
      icon: <Users size={28} />,
      title: "Community Driven",
      text: "Real change happens locally. We empower neighborhoods to take care of their own, fostering connections.",
      colorClass: "bg-amber-50",
      colorText: "text-amber-600",
    }
  ];

  const TEAM = [
    {
      name: "Sarah Chen",
      role: "Co-Founder & CEO",
      bio: "Former environmental scientist passionate about waste reduction.",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop",
      accentColor: "emerald",
      glowColor: "emerald-500"
    },
    {
      name: "David Okonjo",
      role: "Head of Technology",
      bio: "Building scalable tech for social good. Open source advocate.",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
      accentColor: "sky",
      glowColor: "sky-500"
    },
    {
      name: "Elena Rodriguez",
      role: "Community Lead",
      bio: "Connecting NGOs with corporate partners and local donors.",
      img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
      accentColor: "purple",
      glowColor: "purple-500"
    },
    {
      name: "Amir Fayed",
      role: "Product Design",
      bio: "Crafting intuitive experiences that encourage generosity.",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      accentColor: "amber",
      glowColor: "amber-500"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-white font-sans"
    >
      {/* Hero Section */}
      <div className="relative bg-[#022c22] pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden min-h-screen flex flex-col justify-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop"
            alt="Background"
            className="w-full h-full object-cover opacity-50 mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#022c22]/60 via-[#022c22]/80 to-[#022c22]"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-6 max-w-4xl mx-auto flex flex-col items-center mt-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "backOut" }}
            className="inline-block bg-emerald-500/20 border border-emerald-400/50 px-4 py-2 rounded-full text-xs font-bold text-emerald-300 mb-6 tracking-wider"
          >
            OUR MISSION
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5, ease: "circOut" }}
            className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight tracking-tight"
          >
            Building a World Where Giving is <span className="text-emerald-400 drop-shadow-sm">Second Nature</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
            className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed mb-10 font-medium"
          >
            ShareSpace isn&apos;t just a platform; it&apos;s a movement to reduce waste and strengthen community bonds by ensuring usable items find a second home.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 text-base"
            >
              Get Started
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 font-bold py-4 px-8 rounded-full transition-all duration-300 text-base relative overflow-hidden group"
            >
              Learn More
            </motion.button>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-2 bg-emerald-400 rounded-full mt-1 animate-bounce"></div>
          </div>
          <span className="text-white/50 text-[10px] uppercase tracking-widest font-semibold font-sans">Scroll</span>
        </motion.div>
      </div>

      {/* Dynamic Background Wrapper for Mid-Section */}
      <div className="relative overflow-hidden bg-slate-50">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white via-emerald-50/30 to-white"></div>
          
          <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] bg-emerald-200/20 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-sky-200/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-[10%] w-[400px] h-[400px] bg-amber-200/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '4s' }}></div>
          
          <svg className="absolute top-0 left-0 w-full h-full opacity-30" preserveAspectRatio="none">
            <path d="M0,100 C300,200 600,0 900,100 C1200,200 1500,0 1800,100 L1800,0 L0,0 Z" fill="url(#grad1)" className="animate-pulse" />
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
          <section className="pt-16 md:pt-24 pb-8 md:pb-12 px-6 bg-transparent">
            <div className="container mx-auto max-w-6xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop"
                    alt="Volunteers"
                    className="w-full h-[400px] md:h-[500px] object-cover hover:scale-105 transition-transform duration-500"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-slate-900">
                    Why We <span className="text-emerald-600">Started</span>
                  </h2>
                  <p className="text-slate-600 text-sm md:text-base mb-4 leading-relaxed">
                    We noticed a disconnect. Millions of usable items end up in landfills every year, while countless individuals and NGOs struggle to find basic resources. The problem wasn&apos;t a lack of generosity, but a lack of infrastructure.
                  </p>
                  <p className="text-slate-600 text-sm md:text-base mb-8 leading-relaxed">
                    ShareSpace was born to bridge this gap. We created a space where giving is transparent, easy, and impactful. By connecting donors directly with verified NGOs, we ensure every item goes exactly where it&apos;s needed most.
                  </p>

                  <div className="flex flex-wrap gap-10 border-t border-slate-200 pt-8">
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-slate-900">2023</h3>
                      <p className="text-xs md:text-sm text-emerald-600 font-semibold uppercase mt-2">Founded</p>
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-slate-900">12</h3>
                      <p className="text-xs md:text-sm text-emerald-600 font-semibold uppercase mt-2">Cities Active</p>
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-slate-900">100%</h3>
                      <p className="text-xs md:text-sm text-emerald-600 font-semibold uppercase mt-2">Not-for-profit</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Core Values Section */}
          <section className="pt-8 md:pt-12 pb-16 md:pb-24 px-6 bg-transparent">
            <div className="container mx-auto max-w-6xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-slate-900">
                  Our Core <span className="text-emerald-600">Values</span>
                </h2>
                <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto">
                  The principles that guide every decision we make in our mission to reduce waste.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {VALUES.map((value, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    className="group bg-white/60 backdrop-blur-md p-8 rounded-xl border border-emerald-100 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                  >
                    <div className="mb-6 relative group/icon">
                      {/* Premium Icon Wrapper */}
                      <div className="absolute inset-0 blur-lg opacity-0 group-hover/icon:opacity-60 transition-opacity bg-gradient-to-r from-emerald-500/50 to-emerald-400/30 rounded-lg" />
                      <div className={`relative w-12 h-12 ${value.colorClass} rounded-lg flex items-center justify-center ${value.colorText} group-hover/icon:scale-110 transition-transform duration-300 border border-emerald-400/20 shadow-md group-hover/icon:shadow-lg group-hover/icon:shadow-emerald-500/30`}>
                        {/* Apply strokeWidth to icon if it accepts it */}
                        {React.cloneElement(value.icon, { strokeWidth: 1.75 })}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-slate-900">{value.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{value.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Team Section - With Original Effects */}
      <section className="py-16 md:py-24 px-6 bg-slate-950 text-white relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 -right-24 w-96 h-96 bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-sky-600/10 rounded-full mix-blend-screen filter blur-[120px]"></div>
        </div>

        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 md:mb-20"
          >
            <span className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Our Story</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-4 leading-tight">
              Meet the <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">Visionaries</span>
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              The people working behind the scenes to make sharing simple, secure, and impactful.
            </p>
          </motion.div>

          {/* Team Grid with Glow Effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {TEAM.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 p-6 md:p-8 rounded-2xl transition-all duration-500 hover:-translate-y-3 hover:bg-white/[0.08] hover:border-white/20 shadow-2xl hover:shadow-${member.glowColor}/20`}
              >
                {/* Glow Effect Behind Avatar */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"></div>

                {/* Profile Image with Glow */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className={`absolute inset-0 blur-2xl opacity-0 group-hover:opacity-40 transition-opacity duration-500 rounded-full bg-${member.glowColor}`}></div>
                  <img
                    src={member.img}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover border-2 border-white/10 group-hover:border-emerald-500/50 transition-all duration-500 relative z-10"
                  />
                </div>

                <div className="text-center relative z-10">
                  <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-300 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-3 text-emerald-400">
                    {member.role}
                  </p>
                  <p className="text-xs md:text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                    {member.bio}
                  </p>
                </div>

                {/* Bottom Hover Line */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent group-hover:w-1/2 transition-all duration-500"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom About CTA (Styled like Main Home CTA) */}
      <section className="py-24 bg-gradient-to-br from-emerald-900 to-emerald-800 text-white overflow-hidden relative">
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "50px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h2 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 md:mb-8"
            >
              Ready to Make a <span className="text-emerald-400">Difference?</span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-base md:text-lg text-emerald-100/90 mb-8 md:mb-12 max-w-2xl mx-auto leading-relaxed"
            >
              Whether you have items to give or need support for your cause, there is a place for you at ShareSpace.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6"
            >
              <button className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 text-white font-medium text-base rounded-full hover:bg-emerald-400 border border-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1 transform duration-300">
                Join Now
              </button>

              <button className="w-full sm:w-auto px-8 py-3.5 bg-transparent border-2 border-white/30 text-white font-medium text-base rounded-full hover:bg-white/10 transition-colors hover:-translate-y-1 transform duration-300">
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative Circles from Main CTA */}
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
    </motion.div>
  );
};

export default About;