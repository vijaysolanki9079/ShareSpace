const fs = require('fs');
let content = fs.readFileSync('components/dashboard/PremiumDashboard.tsx', 'utf8');

const target = `{/* Base + soft green streak (reference aesthetic) */}
      <div className="pointer-events-none absolute inset-0 bg-[#06100b]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute inset-0 opacity-90 mix-blend-screen"
          style={{
            backgroundImage: 'url(/images/sidebar-img2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background:
              'linear-gradient(180deg, rgba(6, 78, 59, 0.15) 0%, rgba(0,0,0,0.1) 50%, rgba(6, 78, 59, 0.4) 100%)',
          }}
        />
      </div>
      {/* Frosted glass: blurs the glow behind for aurora / glassmorphism look */}
      <div className="relative z-10 flex h-full flex-col bg-black/10 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-[12px] sm:p-7">`;

const replacement = `{/* Base + soft green streak (reference aesthetic) */}
      <div className="pointer-events-none absolute inset-0 bg-[#06100b]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Removed mix-blend and opacity restrictions to show full image */}
        <div
          className="absolute inset-0 opacity-90"
          style={{
            backgroundImage: 'url(/images/sidebar-img2.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center', // Align
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            background:
              'linear-gradient(180deg, rgba(6, 78, 59, 0.2) 0%, rgba(0,0,0,0.1) 50%, rgba(6, 78, 59, 0.4) 100%)',
          }}
        />
      </div>
      {/* Foreground Container: Removed backdrop-blur so the image is crisp! */}
      <div className="relative z-10 flex h-full flex-col bg-black/10 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] sm:p-7">`

content = content.replace(target, replacement);
fs.writeFileSync('components/dashboard/PremiumDashboard.tsx', content);
console.log('Patched');
