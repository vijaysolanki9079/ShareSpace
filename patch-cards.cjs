const fs = require('fs');

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Article card background
  code = code.replace(/className="group overflow-hidden rounded-2xl border border-zinc-200\/90 bg-white shadow-sm transition-all duration-300 hover:border-zinc-300 hover:shadow-md"/g, 'className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-white/20 hover:shadow-md"');
  code = code.replace(/border-zinc-200\/90 bg-white/g, 'border-white/10 bg-slate-900/40 backdrop-blur-md');
  code = code.replace(/hover:border-zinc-300/g, 'hover:border-white/20');
  
  // Image container replacing bg-zinc-100 to bg-slate-800
  code = code.replace(/className="relative aspect-\[.*?\] overflow-hidden bg-zinc-100"/g, (match) => match.replace('bg-zinc-100', 'bg-slate-800'));
  
  // Add overlay to image if not present
  if (code.includes('<img') && !code.includes('absolute inset-0 bg-slate-950/40')) {
    code = code.replace(/(<img[^>]*>)/g, '$1\n              <div className="absolute inset-0 bg-slate-950/40 pointer-events-none transition-opacity duration-500 group-hover:bg-slate-950/20" />');
  }

  // Titles and text
  code = code.replace(/text-zinc-900/g, 'text-slate-100');
  code = code.replace(/text-zinc-500/g, 'text-slate-400');
  code = code.replace(/text-zinc-800/g, 'text-slate-200');

  // Status icons MyDonations / MyRequests
  code = code.replace(/'bg-emerald-50 text-emerald-700'/g, "'bg-emerald-500/20 text-emerald-400'");
  code = code.replace(/'bg-amber-50 text-amber-700'/g, "'bg-amber-500/20 text-amber-400'");

  // Details button
  code = code.replace(/border-zinc-200 bg-zinc-50/g, 'border-white/10 bg-white/5');
  code = code.replace(/hover:border-emerald-300 hover:bg-emerald-50\/80 hover:text-emerald-900/g, 'hover:border-emerald-500/50 hover:bg-emerald-500/20 hover:text-emerald-300');

  // Badges
  code = code.replace(/bg-zinc-950\/85/g, 'bg-slate-950/80 border border-white/10');
  code = code.replace(/text-white backdrop-blur-sm"/g, 'text-slate-200 backdrop-blur-md z-10"');

  fs.writeFileSync(filePath, code);
  console.log('Patched', filePath);
}

patchFile('components/dashboard/MyDonations.jsx');
patchFile('components/dashboard/MyRequests.jsx');
patchFile('components/dashboard/NearbyNGOs.jsx');
patchFile('components/dashboard/EventsDrives.jsx');
