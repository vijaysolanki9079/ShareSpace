'use client';

import React, { useEffect, useRef } from 'react';

interface HeroSequenceCanvasProps {
  frameCount: number;
  imagePrefix: string;
  imageSuffix: string;
  fps?: number;
}

export default function HeroSequenceCanvas({
  frameCount,
  imagePrefix,
  imageSuffix,
  fps = 24,
}: HeroSequenceCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(0);
  const requestRef = useRef<number | null>(null);
  const lastFrameTime = useRef(0);
  const isLoadingRef = useRef(true);
  const loadedCountRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    console.log(`[HeroSequencer] Starting load: ${frameCount} frames from ${imagePrefix}`);

    // Setup canvas dimensions
    const setupCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const rect = parent.getBoundingClientRect();
        canvas.width = Math.max(rect.width, 1920);
        canvas.height = Math.max(rect.height, 850);
      }
      canvas.style.width = '100%';
      canvas.style.height = '100%';
      canvas.style.display = 'block';
    };

    setupCanvas();

    // Preload all images
    const preloadImages = async () => {
      const images: (HTMLImageElement | null)[] = [];
      const promises: Promise<void>[] = [];

      for (let i = 0; i < frameCount; i++) {
        const frameNum = i.toString().padStart(3, '0');
        const imagePath = `${imagePrefix}${frameNum}${imageSuffix}`;

        const promise = new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = imagePath;

          const loadHandler = () => {
            console.log(`[HeroSequencer] ✓ Frame ${i + 1}/${frameCount} loaded`);
            loadedCountRef.current++;
            images[i] = img;
            img.removeEventListener('load', loadHandler);
            img.removeEventListener('error', errorHandler);
            resolve();
          };

          const errorHandler = () => {
            console.warn(`[HeroSequencer] ✗ Failed to load: ${imagePath}`);
            images[i] = null;
            img.removeEventListener('load', loadHandler);
            img.removeEventListener('error', errorHandler);
            resolve();
          };

          img.addEventListener('load', loadHandler, { once: true });
          img.addEventListener('error', errorHandler, { once: true });

          // Timeout after 5 seconds
          setTimeout(() => {
            console.warn(`[HeroSequencer] ⏱ Timeout loading: ${imagePath}`);
            img.removeEventListener('load', loadHandler);
            img.removeEventListener('error', errorHandler);
            images[i] = null;
            resolve();
          }, 5000);
        });

        promises.push(promise);
      }

      await Promise.all(promises);

      imagesRef.current = images.filter((img) => img !== null) as HTMLImageElement[];
      isLoadingRef.current = false;

      console.log(
        `[HeroSequencer] Load complete: ${imagesRef.current.length}/${frameCount} frames ready`,
      );

      if (imagesRef.current.length > 0) {
        animate(0);
      } else {
        console.error('[HeroSequencer] No images loaded successfully');
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Loading images...', canvas.width / 2, canvas.height / 2);
      }
    };

    // Animation render loop
    const animate = (timestamp: number) => {
      if (isLoadingRef.current || imagesRef.current.length === 0) {
        requestRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = timestamp - lastFrameTime.current;
      const frameDuration = 1000 / fps;

      if (elapsed >= frameDuration) {
        const currentImg = imagesRef.current[frameIndexRef.current];

        if (currentImg && currentImg.complete) {
          // Draw with object-fit cover behavior
          const canvasRatio = canvas.width / canvas.height;
          const imgRatio = currentImg.width / currentImg.height;

          const sx = 0;
          const sy = 0;
          const sw = currentImg.width;
          const sh = currentImg.height;
          let dx = 0;
          let dy = 0;
          let dw = canvas.width;
          let dh = canvas.height;

          if (imgRatio > canvasRatio) {
            // Image is wider
            dh = canvas.width / imgRatio;
            dy = (canvas.height - dh) / 2;
          } else {
            // Image is taller
            dw = canvas.height * imgRatio;
            dx = (canvas.width - dw) / 2;
          }

          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(currentImg, sx, sy, sw, sh, dx, dy, dw, dh);
        }

        // Advance frame
        frameIndexRef.current = (frameIndexRef.current + 1) % imagesRef.current.length;
        lastFrameTime.current = timestamp;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    // Handle window resize
    const handleResize = () => {
      setupCanvas();
    };
    window.addEventListener('resize', handleResize);

    preloadImages();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [frameCount, imagePrefix, imageSuffix, fps]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 block h-full w-full"
      style={{ background: '#000' }}
      aria-hidden="true"
    />
  );
}
