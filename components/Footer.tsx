'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer = () => {
  const pathname = usePathname();
  const howItWorksHref = pathname === '/' ? '#how-it-works' : '/#how-it-works';

  return (
    <footer className="relative bg-slate-950 text-white overflow-hidden border-t border-white/10">
      
      {/* Background Glow Effects (EMERALD + SOFT CYAN) */}
      <div className="absolute -top-20 left-1/4 w-72 h-72 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute -top-20 right-1/4 w-72 h-72 bg-cyan-400/5 blur-[140px] rounded-full pointer-events-none"></div>

      {/* Glass Layer */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"></div>

      <div className="container mx-auto px-6 py-12 relative z-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
        
        {/* Left */}
        <p className="text-sm text-slate-400">
          © {new Date().getFullYear()} 
          <span className="ml-1 font-semibold bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
            ShareSpace
          </span>. All rights reserved.
        </p>

        {/* Right */}
        <div className="flex items-center gap-6 text-sm">
          {[
            { name: 'Explore NGOs', href: '/explore' },
            { name: 'Donations', href: '/donations' },
            { name: 'How it Works', href: howItWorksHref },
            { name: 'About', href: '/about' },
          ].map((link, i) => (
            <Link
              key={i}
              href={link.href}
              className="relative text-slate-400 hover:text-white transition-colors group"
            >
              {link.name}
              <span className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-0 h-[2px] bg-gradient-to-r from-emerald-400 to-emerald-500 group-hover:w-full transition-all duration-300"></span>
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;