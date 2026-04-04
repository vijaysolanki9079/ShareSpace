import React from 'react';
import { Package, Truck, Clock, MapPin, ArrowUpRight } from 'lucide-react';

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
    <section className="pt-6 pb-24 relative overflow-hidden bg-[#F8FAFC]" id="donations">
      
      {/* STRONG MESH GRADIENT BG */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-emerald-100/60 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-sky-100/60 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-emerald-600 font-bold tracking-[0.2em] uppercase text-[10px] mb-4 block">Live Feed</span>
          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Just Donated <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-sky-600">Nearby</span>
          </h2>
          <p className="text-lg text-slate-500 font-medium leading-relaxed">
            See what your neighbors are sharing right now. Join the circle of giving.
          </p>
        </div>

        {/* Donation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {donations.map((donation) => {
            const StatusIcon = donation.statusIcon;
            return (
              <div 
                key={donation.id}
                className="group relative bg-white rounded-[2.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500"
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
                <div className="relative h-64 rounded-[2rem] overflow-hidden shadow-inner bg-slate-100">
                  <img 
                    src={donation.image} 
                    alt={donation.item}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />

                  {/* NGO Glass Badge */}
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black text-slate-900 border border-white/40 shadow-sm flex items-center gap-2">
                     <MapPin className="w-3 h-3 text-emerald-600" />
                     TO: {donation.ngo.toUpperCase()}
                  </div>

                  {/* Category Glass Badge */}
                  <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg text-[9px] font-bold tracking-[0.15em] text-white uppercase border border-white/10">
                    {donation.category}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-emerald-600 transition-colors">
                    {donation.item}
                  </h3>

                  <div className="flex items-center justify-between mt-auto pt-2">
                    <div className={`flex items-center gap-2 font-bold text-xs ${donation.statusColor} bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100`}>
                      <StatusIcon className="w-4 h-4" />
                      {donation.status}
                    </div>

                    <button className="flex items-center gap-1.5 text-slate-400 font-bold text-xs hover:text-emerald-600 transition-colors uppercase tracking-widest">
                      Details <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button className="w-full mt-6 py-4 bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-600 font-bold rounded-2xl transition-all duration-300 border border-slate-100 group-hover:border-emerald-600">
                    Request Item
                  </button>
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