import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const Campaigns = () => {
  const campaigns = [
    {
      id: 1,
      title: 'Winter Warmth Drive',
      ngo: 'Save the Children',
      description: 'Collecting clean winter coats and blankets for homeless shelters.',
      progress: 75,
      goal: '1000 items',
      daysLeft: 12,
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
      delay: '0s'
    },
    {
      id: 2,
      title: 'Tech for Education',
      ngo: 'Digital Future Foundation',
      description: 'Donate old but working laptops for underprivileged students.',
      progress: 40,
      goal: '500 devices',
      daysLeft: 24,
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
      delay: '1s'
    },
    {
      id: 3,
      title: 'Food Bank Restock',
      ngo: 'City Food Rescue',
      description: 'Urgent need for non-perishable canned goods and rice.',
      progress: 90,
      goal: '2000 kg',
      daysLeft: 3,
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
      delay: '2s'
    },
  ];

  return (
    // ADJUSTED: pt-12 reduces the gap from the component above
    <section className="pt-12 pb-12 scroll-mt-20 relative bg-[#F8FAFC] overflow-hidden" id="campaigns">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[-10%] w-96 h-96 bg-emerald-200/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-20 right-[-5%] w-[500px] h-[500px] bg-sky-200/20 rounded-full blur-[150px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-emerald-600 font-bold tracking-[0.2em] uppercase text-xs mb-4 block"
            >
              Take Action
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight"
            >
              Urgent <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Campaigns</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-lg text-slate-500 font-medium leading-relaxed"
            >
              Join forces with verified NGOs. These drives need immediate community support.
            </motion.p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "50px" }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          >
            <Link 
              href="/explore"
              className="group relative px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 overflow-hidden"
            >
              <span className="relative z-10">View all campaigns</span>
              <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" strokeWidth={1.75} />
              <div className="absolute inset-0 bg-emerald-50 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </Link>
          </motion.div>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {campaigns.map((campaign) => (
            <div 
              key={campaign.id}
              className="relative group bg-white rounded-[2.5rem] border border-white p-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500"
              style={{
                // FIXED: Individual properties to prevent the "conflicting property" Console Error
                animationName: 'float-campaign',
                animationDuration: '7s',
                animationTimingFunction: 'ease-in-out',
                animationIterationCount: 'infinite',
                animationDelay: campaign.delay
              }}
            >
              {/* Image Container */}
              <div className="relative h-64 w-full rounded-[2rem] overflow-hidden">
                <Image 
                  src={campaign.image} 
                  alt={campaign.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                
                <div className="absolute top-4 right-4 bg-white/70 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-slate-900 shadow-lg border border-white/40 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  {campaign.daysLeft} DAYS LEFT
                </div>
              </div>

              {/* Text Content */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{campaign.ngo}</span>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">
                  {campaign.title}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2 font-medium">
                  {campaign.description}
                </p>

                {/* Progress Box */}
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100/50">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Impact</div>
                      <div className="text-xl font-black text-slate-900">{campaign.progress}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Target</div>
                      <div className="text-sm font-bold text-slate-700">{campaign.goal}</div>
                    </div>
                  </div>
                  
                  <div className="h-2.5 w-full bg-white rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-400 to-sky-500 rounded-full relative transition-all duration-1000"
                      style={{ width: `${campaign.progress}%` }}
                    >
                      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-shimmer"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-campaign {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}} />
    </section>
  );
};

export default Campaigns;