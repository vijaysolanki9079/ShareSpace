/**
 * Generate Hero Animation Frames (Browser-based)
 * 
 * Run this in your browser console or use it as a utility script
 * It will generate and cache hero frame images as data URLs
 * 
 * Usage:
 * 1. Open browser console (F12)
 * 2. Paste and run this script
 * 3. Download or use the generated data URLs
 */

export function generateHeroFramesAsDataUrls(
  numFrames = 30,
  width = 1920,
  height = 850
) {
  console.log(`Generating ${numFrames} hero frames...`);

  const frames: string[] = [];

  for (let i = 0; i < numFrames; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    const progress = numFrames > 1 ? i / (numFrames - 1) : 0;

    // Gradient transition from dark green to light emerald
    const r_start = 2;
    const g_start = 44;
    const b_start = 34;
    const r_end = 34;
    const g_end = 197;
    const b_end = 94;

    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);

    const r1 = Math.round(r_start + (r_end - r_start) * progress);
    const g1 = Math.round(g_start + (g_end - g_start) * progress);
    const b1 = Math.round(b_start + (b_end - b_start) * progress);

    const r2 = Math.round(r_start + (r_end - r_start) * (progress * 1.2));
    const g2 = Math.round(g_start + (g_end - g_start) * (progress * 1.2));
    const b2 = Math.round(b_start + (b_end - b_start) * (progress * 1.2));

    gradient.addColorStop(0, `rgb(${r1},${g1},${b1})`);
    gradient.addColorStop(1, `rgb(${r2},${g2},${b2})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add animated circles
    const circleRadius = 150 + 100 * (i / numFrames);
    const circleX = Math.round(width * (0.25 + 0.5 * progress));
    const circleY = Math.round(height * 0.5);

    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, 0.3 * (1 - progress))})`;
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fill();

    const circleX2 = Math.round(width * (0.75 - 0.5 * progress));
    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, 0.2 * progress)})`;
    ctx.beginPath();
    ctx.arc(circleX2, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fill();

    frames.push(canvas.toDataURL('image/webp'));
    console.log(`✓ Frame ${i + 1}/${numFrames}`);
  }

  console.log('✅ All frames generated!');
  console.log(`📦 Save this to localStorage or your backend:`);
  console.log(JSON.stringify({ frames, frameCount: numFrames }));

  return { frames, frameCount: numFrames };
}

// Alternative: Create as blobs for download
export async function downloadHeroFrames(
  numFrames = 30,
  width = 1920,
  height = 850
) {
  const frames: Blob[] = [];

  for (let i = 0; i < numFrames; i++) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) continue;

    const progress = numFrames > 1 ? i / (numFrames - 1) : 0;

    // Same drawing code as above
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    const r1 = Math.round(2 + (34 - 2) * progress);
    const g1 = Math.round(44 + (197 - 44) * progress);
    const b1 = Math.round(34 + (94 - 34) * progress);

    gradient.addColorStop(0, `rgb(${r1},${g1},${b1})`);
    gradient.addColorStop(1, `rgb(${r1},${g1},${b1})`);

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const circleRadius = 150 + 100 * (i / numFrames);
    const circleX = Math.round(width * (0.25 + 0.5 * progress));
    const circleY = Math.round(height * 0.5);

    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, 0.3 * (1 - progress))})`;
    ctx.beginPath();
    ctx.arc(circleX, circleY, circleRadius, 0, Math.PI * 2);
    ctx.fill();

    // Convert to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/webp", 0.8);
    });
    if (!blob) continue;

    frames.push(blob);
  }

  // Create download links
  frames.forEach((blob, index) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `frame_${String(index).padStart(3, '0')}.webp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });

  console.log(`✅ Downloaded ${frames.length} frames`);
}
