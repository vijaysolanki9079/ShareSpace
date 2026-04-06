const fs = require('fs');
let content = fs.readFileSync('components/dashboard/PremiumDashboard.tsx', 'utf8');

// Dashboard summary stat blocks
content = content.replace(
  'className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/30 p-6 shadow-xl backdrop-blur-xl transition-all hover:bg-black/40 hover:border-emerald-500/20 group"',
  'className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-300/10 to-blue-400/10 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-[24px] transition-all hover:from-slate-300/15 hover:to-blue-400/15 hover:border-blue-400/30 group"'
);

// Icons
content = content.replace(
  '<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">',
  '<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-300/10 text-blue-200 border border-blue-300/20">'
);

// Stat Labels
content = content.replace(
  '<p className="text-xs font-medium uppercase tracking-wide text-emerald-400/70">{s.label}</p>',
  '<p className="text-xs font-medium uppercase tracking-wide text-zinc-300 drop-shadow-md">{s.label}</p>'
);

// Stat Values
content = content.replace(
  '<p className="mt-1 text-2xl font-semibold tabular-nums text-white">{s.value}</p>',
  '<p className="mt-1 text-2xl font-semibold tabular-nums text-white drop-shadow-lg">{s.value}</p>'
);

// Recent Activity Card
content = content.replace(
  'className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/30 p-6 shadow-xl backdrop-blur-xl sm:p-8"',
  'className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-300/10 to-blue-400/10 p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-[24px] sm:p-8"'
);

// SectionFrame
content = content.replace(
  'className="rounded-2xl border border-white/5 bg-black/30 p-4 shadow-xl backdrop-blur-xl sm:p-6"',
  'className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-300/10 to-blue-400/10 p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-[24px] sm:p-6"'
);

fs.writeFileSync('components/dashboard/PremiumDashboard.tsx', content);
console.log('Patched with frosted white/blue');
