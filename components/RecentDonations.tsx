import React from 'react';
import { Package, Truck, Clock, MapPin, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const RecentDonations = () => {
  const donations = [
    {
      id: 1,
      item: 'Old Winter Coats (3x)',
      category: 'Clothes',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', 
      ngo: 'Green Earth Initiative',
      status: 'Delivered',
      statusColor: 'text-emerald-500',
      statusIcon: Package,
      delay: '0s'
    },
    {
      id: 2,
      item: 'Dell XPS 13 Laptop',
      category: 'Electronics',
      image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80',
      ngo: 'Tech for Kids',
      status: 'Picked Up',
      statusColor: 'text-sky-500',
      statusIcon: Truck,
      delay: '1s'
    },
    {
      id: 3,
      item: 'Canned Goods - 2 Boxes',
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
      ngo: 'Food Rescue Network',
      status: 'Pending',
      statusColor: 'text-amber-500',
      statusIcon: Clock,
      delay: '2s'
    },
  ];

  return (
    <section className="pt-0 pb-24 relative overflow-hidden bg-[#F8FAFC]" id="donations">
      
      {/* STRONG MESH GRADIENT BG */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-[-40%] top-[-10%] h-[360px] w-[360px] rounded-full bg-emerald-100/60 blur-[100px] sm:right-[-5%] sm:h-[600px] sm:w-[600px] sm:blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-40%] h-[360px] w-[360px] rounded-full bg-sky-100/60 blur-[100px] sm:left-[-5%] sm:h-[600px] sm:w-[600px] sm:blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "50px" }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto mb-10"
        >
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-emerald-600 font-bold tracking-[0.2em] uppercase text-[10px] mb-4 block"
          >
            Live Feed
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="mb-6 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl md:text-6xl"
          >
            Just Donated <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Nearby</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-lg text-slate-500 font-medium leading-relaxed"
          >
            See what your neighbors are sharing right now. Join the circle of giving.
          </motion.p>
        </motion.div>

        {/* Donation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {donations.map((donation) => {
            const StatusIcon = donation.statusIcon;
            return (
              <div 
                key={donation.id}
                className="group relative rounded-3xl border border-white bg-white p-3 shadow-[0_20px_50px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] sm:rounded-[2.5rem] sm:p-4"
                style={{
                  // FIXED: Broken down shorthand to avoid React Conflict Error
                  animationName: 'float-donation',
                  animationDuration: '7s',
                  animationTimingFunction: 'ease-in-out',
                  animationIterationCount: 'infinite',
                  animationDelay: donation.delay
                }}
              >
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden rounded-2xl bg-slate-100 shadow-inner sm:h-64 sm:rounded-[2rem]">
                  <img 
                    src={donation.image} 
                    alt={donation.item}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                  {/* NGO Glass Badge */}
                  <div className="absolute right-3 top-3 flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-xl border border-white/40 bg-white/80 px-3 py-2 text-[9px] font-black text-slate-900 shadow-sm backdrop-blur-md sm:right-4 sm:top-4 sm:gap-2 sm:px-4 sm:text-[10px]">
                     <MapPin className="w-3 h-3 text-emerald-600" />
                     TO: {donation.ngo.toUpperCase()}
                  </div>

                  {/* Category Glass Badge */}
                  <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-bold tracking-[0.15em] text-white uppercase border border-white/10">
                    {donation.category}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-4 sm:p-6">
                  <h3 className="mb-5 text-xl font-black text-slate-900 transition-colors group-hover:text-emerald-600 sm:mb-6 sm:text-2xl">
                    {donation.item}
                  </h3>

                  <div className="mt-auto flex items-center justify-between gap-3 pt-2">
                    <div className={`flex items-center gap-2 font-bold text-xs ${donation.statusColor} bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100`}>
                      <StatusIcon className="w-4 h-4" />
                      {donation.status}
                    </div>

                    <button className="flex shrink-0 items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 transition-colors hover:text-emerald-600">
                      Details <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    href={`/requests?search=${encodeURIComponent(donation.item)}`}
                    className="mt-5 block w-full rounded-2xl border border-emerald-100 bg-emerald-50 py-3.5 text-center text-sm font-bold text-emerald-700 shadow-sm shadow-emerald-100/50 transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-100 hover:text-emerald-900 hover:shadow-md hover:shadow-emerald-200/60 group-hover:border-emerald-200 sm:mt-6 sm:py-4 sm:text-base"
                  >
                    Request Item
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Animation Definitions */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-donation {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
      `}} />
    </section>
  );
};

export default RecentDonations;
