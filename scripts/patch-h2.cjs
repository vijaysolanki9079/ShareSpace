const fs = require('fs');

const files = [
  'components/dashboard/MyDonations.jsx',
  'components/dashboard/MyRequests.jsx',
  'components/dashboard/Messages.jsx',
  'components/dashboard/NearbyNGOs.jsx',
  'components/dashboard/EventsDrives.jsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Regex to match the headings
  content = content.replace(
    /<h2 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">(.*?)<\/h2>/g,
    '<h2 className="text-2xl font-semibold tracking-tight sm:text-3xl bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">$1</h2>'
  );
  
  // also change the subtitle colors to read better on dark
  content = content.replace(
    /<p className="mt-1 text-sm text-zinc-500">/g,
    '<p className="mt-1 text-sm text-slate-300">'
  );

  fs.writeFileSync(file, content);
  console.log('Patched', file);
}
