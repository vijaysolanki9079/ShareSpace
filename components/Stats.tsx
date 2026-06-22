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
      <div className="flex w-max max-w-none animate-scroll hover:pause">
        {/* First set of items */}
        <div className="flex gap-10 px-6 sm:gap-24 sm:px-12">
          {stats.map((stat, index) => (
            <div key={`stat-1-${index}`} className="flex min-w-[150px] flex-col items-center sm:min-w-[200px]">
              <div className="mb-2 whitespace-nowrap text-3xl font-bold text-emerald-500 md:text-5xl">
                {stat.value}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Second set of items (Duplicate for seamless loop) */}
        <div className="flex gap-10 px-6 sm:gap-24 sm:px-12">
          {stats.map((stat, index) => (
            <div key={`stat-2-${index}`} className="flex min-w-[150px] flex-col items-center sm:min-w-[200px]">
              <div className="mb-2 whitespace-nowrap text-3xl font-bold text-emerald-500 md:text-5xl">
                {stat.value}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        {/* Third set of items (Extra buffer for wide screens) */}
        <div className="flex gap-10 px-6 sm:gap-24 sm:px-12">
          {stats.map((stat, index) => (
            <div key={`stat-3-${index}`} className="flex min-w-[150px] flex-col items-center sm:min-w-[200px]">
              <div className="mb-2 whitespace-nowrap text-3xl font-bold text-emerald-500 md:text-5xl">
                {stat.value}
              </div>
              <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
        {/* Fourth set of items (Extra buffer for very wide screens to prevent gap) */}
        <div className="flex gap-10 px-6 sm:gap-24 sm:px-12">
          {stats.map((stat, index) => (
            <div key={`stat-4-${index}`} className="flex min-w-[150px] flex-col items-center sm:min-w-[200px]">
              <div className="mb-2 whitespace-nowrap text-3xl font-bold text-emerald-500 md:text-5xl">
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
