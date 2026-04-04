import React from 'react';

const Stats = () => {
  const stats = [
    { value: '250k+', label: 'Items Donated' },
    { value: '1,200+', label: 'Verified NGOs' },
    { value: '85k+', label: 'Lives Impacted' },
    { value: '$0', label: 'Fees on Donations' },
  ];

  return (
    <section className="py-8 bg-white border-y border-gray-100 overflow-hidden">
      {/* Full Width Scrolling Container */}
      <div className="flex w-max animate-scroll hover:pause">
        {/* First set of items */}
        <div className="flex gap-24 px-12">
          {stats.map((stat, index) => (
            <div key={`stat-1-${index}`} className="flex flex-col items-center min-w-[200px]">
              <div className="text-4xl md:text-5xl font-bold text-emerald-500 mb-2 whitespace-nowrap">
                {stat.value}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Second set of items (Duplicate for seamless loop) */}
        <div className="flex gap-24 px-12">
          {stats.map((stat, index) => (
            <div key={`stat-2-${index}`} className="flex flex-col items-center min-w-[200px]">
              <div className="text-4xl md:text-5xl font-bold text-emerald-500 mb-2 whitespace-nowrap">
                {stat.value}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        {/* Third set of items (Extra buffer for wide screens) */}
        <div className="flex gap-24 px-12">
          {stats.map((stat, index) => (
            <div key={`stat-3-${index}`} className="flex flex-col items-center min-w-[200px]">
              <div className="text-4xl md:text-5xl font-bold text-emerald-500 mb-2 whitespace-nowrap">
                {stat.value}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        {/* Fourth set of items (Extra buffer for very wide screens to prevent gap) */}
        <div className="flex gap-24 px-12">
          {stats.map((stat, index) => (
            <div key={`stat-4-${index}`} className="flex flex-col items-center min-w-[200px]">
              <div className="text-4xl md:text-5xl font-bold text-emerald-500 mb-2 whitespace-nowrap">
                {stat.value}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;