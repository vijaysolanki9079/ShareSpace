import React from 'react';
import Link from 'next/link';

const CTA = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-emerald-900 to-emerald-800 text-white">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-emerald-100 mb-10 leading-relaxed">
            Declutter your home and help your community. Join ShareNest today and be part of the change.
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-3.5 bg-emerald-500 text-white font-medium text-base rounded-lg hover:bg-emerald-400 transition-colors shadow-lg hover:shadow-xl"
            >
              Create Free Account
            </Link>
            <Link
              href="/register-ngo"
              className="px-8 py-3.5 bg-transparent border border-white/30 text-white font-medium text-base rounded-lg hover:bg-white/10 transition-colors"
            >
              Register as NGO
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
