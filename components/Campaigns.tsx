import React from 'react';
import { Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

const campaignImages = {
  winterWarmth: '/assets/winter-warmth-drive.png',
  techForEducation: '/assets/tech-for-education.png',
  foodBankRestock: '/assets/food-bank-restock.png',
} as const;

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
      image: campaignImages.winterWarmth,
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
      image: campaignImages.techForEducation,
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
      image: campaignImages.foodBankRestock,
      delay: '2s'
    },
  ];

  return (
    // ADJUSTED: pt-12 reduces the gap from the component above
    <section className="relative scroll-mt-20 overflow-hidden bg-[#F8FAFC] pb-12 pt-12" id="campaigns">
      
      {/* Background Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute left-[-40%] top-20 h-72 w-72 rounded-full bg-emerald-200/30 blur-[100px] sm:left-[-10%] sm:h-96 sm:w-96 sm:blur-[120px]"></div>
        <div className="absolute bottom-20 right-[-45%] h-80 w-80 rounded-full bg-sky-200/20 blur-[110px] sm:right-[-5%] sm:h-[500px] sm:w-[500px] sm:blur-[150px]"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:mb-16 md:flex-row md:items-end md:gap-8">
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
              className="mb-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-6xl"
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
              className="group relative flex items-center gap-3 overflow-hidden rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-xl shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:px-8 sm:py-4 sm:text-base"
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
              className="group relative rounded-3xl border border-white bg-white p-3 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 sm:rounded-[2.5rem]"
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
              <div className="relative h-56 w-full overflow-hidden rounded-2xl sm:h-64 sm:rounded-[2rem]">
                <Image 
                  src={campaign.image} 
                  alt={campaign.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                
                <div className="absolute right-3 top-3 flex items-center gap-2 rounded-2xl border border-white/40 bg-white/70 px-3 py-2 text-[9px] font-black text-slate-900 shadow-lg backdrop-blur-md sm:right-4 sm:top-4 sm:px-4 sm:text-[10px]">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  {campaign.daysLeft} DAYS LEFT
                </div>
              </div>

              {/* Text Content */}
              <div className="p-5 sm:p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{campaign.ngo}</span>
                </div>
                
                <h3 className="mb-4 text-xl font-black text-slate-900 transition-colors group-hover:text-emerald-600 sm:text-2xl">
                  {campaign.title}
                </h3>
                
                <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-2 font-medium">
                  {campaign.description}
                </p>

                {/* Progress Box */}
                <div className="rounded-3xl border border-slate-100/50 bg-slate-50 p-5 sm:p-6">
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
