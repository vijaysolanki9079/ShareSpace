'use client';

import { ImageOff } from 'lucide-react';

interface NoImageFallbackProps {
  className?: string;
  label?: string;
}

export default function NoImageFallback({
  className = '',
  label = 'No image uploaded',
}: NoImageFallbackProps) {
  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-100 ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_32%),radial-gradient(circle_at_80%_70%,rgba(20,184,166,0.2),transparent_35%)]" />
      <div className="absolute inset-x-6 bottom-6 top-6 rounded-[2rem] border border-white/70 bg-white/35 shadow-inner" />
      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-white/85 text-emerald-600 shadow-sm">
          <ImageOff className="h-7 w-7" strokeWidth={1.8} />
        </div>
        <p className="rounded-full border border-emerald-200 bg-white/90 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-emerald-700 shadow-sm">
          {label}
        </p>
      </div>
    </div>
  );
}
