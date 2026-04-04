import React from 'react';
import { Camera, MessageCircle, Package } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Camera,
      title: '1. List Your Item',
      description: 'Snap a photo, add a brief description, and choose who can see your listing—NGOs or everyone nearby.',
      glowColor: 'group-hover:shadow-emerald-500/20',
      iconColor: 'text-emerald-400',
      delay: '0ms',
    },
    {
      icon: MessageCircle,
      title: '2. Receive Requests',
      description: 'Review requests from verified NGOs or neighbors. Chat securely to arrange details without sharing personal info.',
      glowColor: 'group-hover:shadow-sky-500/20',
      iconColor: 'text-sky-400',
      delay: '200ms',
    },
    {
      icon: Package,
      title: '3. Easy Handoff',
      description: 'Confirm the donation and hand it off. Some NGOs offer pickup services for bulk items or furniture.',
      glowColor: 'group-hover:shadow-amber-500/20',
      iconColor: 'text-amber-400',
      delay: '400ms',
    },
  ];

  return (
    <section className="scroll-mt-24 py-24 relative overflow-hidden bg-slate-950 text-white" id="how-it-works">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-600/10 rounded-full mix-blend-screen filter blur-[150px]"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <span className="text-emerald-400 font-bold tracking-[0.2em] uppercase text-xs mb-4 block">Simple Process</span>
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            How <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent">ShareNest</span> Works
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Making a difference is simpler than ever. Connect directly with those in need in just three easy steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative group bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-3xl transition-all duration-500 hover:-translate-y-3 hover:bg-white/[0.08] hover:border-white/20 shadow-2xl ${step.glowColor}`}
              style={{ animationDelay: step.delay }}
            >
              {/* Step Number Badge */}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center font-bold text-slate-500 group-hover:text-white group-hover:border-emerald-500/50 transition-colors">
                0{index + 1}
              </div>

              <div className="mb-8 relative">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:rotate-[10deg]`}>
                   {/* Icon Glow */}
                   <div className={`absolute inset-0 blur-2xl opacity-20 group-hover:opacity-50 transition-opacity ${step.iconColor.replace('text', 'bg')}`}></div>
                   <step.icon className={`w-10 h-10 relative z-10 ${step.iconColor}`} />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-4">
                {step.title.split('. ')[1]}
              </h3>
              <p className="text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                {step.description}
              </p>
              
              {/* Hover Bottom Bar Decoration */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent group-hover:w-1/2 transition-all duration-500"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;