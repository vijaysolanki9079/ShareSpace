const fs = require('fs');
let content = fs.readFileSync('components/dashboard/PremiumDashboard.tsx', 'utf8');

content = content.replace(
  'className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"',
  'className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/30 p-6 shadow-xl backdrop-blur-xl transition-all hover:bg-black/40 hover:border-emerald-500/20 group"'
);

content = content.replace(
  '<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">',
  '<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">'
);

content = content.replace(
  '<p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{s.label}</p>',
  '<p className="text-xs font-medium uppercase tracking-wide text-emerald-400/70">{s.label}</p>'
);

content = content.replace(
  '<p className="mt-1 text-2xl font-semibold tabular-nums text-zinc-900">{s.value}</p>',
  '<p className="mt-1 text-2xl font-semibold tabular-nums text-white">{s.value}</p>'
);

content = content.replace(
  '<div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-zinc-100">',
  '<div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">'
);

content = content.replace(
  'className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-sm sm:p-8"',
  'className="relative overflow-hidden rounded-2xl border border-white/5 bg-black/30 p-6 shadow-xl backdrop-blur-xl sm:p-8"'
);

content = content.replace(
  '<h4 className="text-base font-semibold text-zinc-900">Recent activity</h4>',
  '<h4 className="text-base font-semibold text-white">Recent activity</h4>'
);

content = content.replace(
  '<ul className="mt-4 divide-y divide-zinc-100">',
  '<ul className="mt-4 divide-y divide-white/5">'
);

content = content.replace(
  '<span className="text-sm text-zinc-700">{row.t}</span>',
  '<span className="text-sm text-zinc-300">{row.t}</span>'
);

content = content.replace(
  'className="rounded-2xl border border-zinc-200/90 bg-white/95 p-4 shadow-sm sm:p-6"',
  'className="rounded-2xl border border-white/5 bg-black/30 p-4 shadow-xl backdrop-blur-xl sm:p-6"'
);

fs.writeFileSync('components/dashboard/PremiumDashboard.tsx', content);
console.log('Patched bg colors');
