const fs = require('fs');
const files = [
  'components/dashboard/MyDonations.jsx',
  'components/dashboard/MyRequests.jsx',
  'components/dashboard/NearbyNGOs.jsx',
  'components/dashboard/EventsDrives.jsx'
];

files.forEach(filePath => {
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(/bg-zinc-100/g, 'bg-slate-800');
  fs.writeFileSync(filePath, code);
  console.log('Fixed bg-zinc-100 in', filePath);
});
