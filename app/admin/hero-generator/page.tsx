'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, Zap, AlertCircle } from 'lucide-react';
import { generateHeroFramesAsDataUrls, downloadHeroFrames } from '@/lib/generate-frames';

export default function HeroAnimationGenerator() {
  const [frameCount, setFrameCount] = useState(30);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  const handleGenerateDownload = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setMessage(`Generating ${frameCount} frames...`);

      await downloadHeroFrames(frameCount);

      setMessage(`✅ Downloaded ${frameCount} frames! Add them to public/hero-sequence/`);
      setProgress(100);
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePreview = async () => {
    try {
      setIsGenerating(true);
      setProgress(0);
      setMessage(`Generating preview...`);

      const { frames } = generateHeroFramesAsDataUrls(frameCount);

      setMessage(`✅ Generated ${frameCount} frames! Right-click images to save.`);
      setProgress(100);

      // Show preview in new window
      const previewWindow = window.open('', 'preview');
      if (previewWindow) {
        previewWindow.document.write(`
          <html>
            <head>
              <title>Hero Animation Frames Preview</title>
              <style>
                body { font-family: sans-serif; margin: 20px; background: #f3f4f6; }
                h1 { color: #1f2937; }
                .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                .frame { background: white; padding: 10px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
                img { width: 100%; height: auto; border-radius: 4px; }
                p { margin: 10px 0 0 0; font-size: 12px; color: #6b7280; }
              </style>
            </head>
            <body>
              <h1>Hero Animation Frames (${frameCount} frames)</h1>
              <p>Right-click any image and "Save image as..." to download</p>
              <div class="gallery">
                ${frames
                  .map(
                    (dataUrl, i) => `
                  <div class="frame">
                    <img src="${dataUrl}" alt="Frame ${i + 1}" />
                    <p>Frame ${String(i).padStart(3, '0')}</p>
                  </div>
                `,
                  )
                  .join('')}
              </div>
            </body>
          </html>
        `);
        previewWindow.document.close();
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2">
            <Zap className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-medium text-emerald-700">Hero Animation Tool</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold text-slate-900">Generate Hero Frames</h1>
          <p className="text-lg text-slate-600">
            Create animated transition frames for your ShareSpace hero section
          </p>
        </div>

        {/* Main Card */}
        <div className="rounded-xl bg-white p-8 shadow-lg">
          {/* Frame Count Input */}
          <div className="mb-6">
            <label htmlFor="frameCount" className="block text-sm font-semibold text-slate-700">
              Number of Frames
            </label>
            <div className="mt-2 flex items-center gap-4">
              <input
                type="range"
                id="frameCount"
                min="10"
                max="120"
                step="5"
                value={frameCount}
                onChange={(e) => setFrameCount(parseInt(e.target.value))}
                disabled={isGenerating}
                className="h-2 w-full flex-1 rounded-lg bg-slate-200"
              />
              <span className="text-2xl font-bold text-emerald-600">{frameCount}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              More frames = smoother animation but larger file size (each ~30-50KB)
            </p>
          </div>

          {/* Info Box */}
          <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-700 flex gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Estimated Size</p>
              <p>{frameCount * 40}KB - {frameCount * 80}KB total</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={handleGenerateDownload}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Download Frames'}
            </button>
            <button
              onClick={handleGeneratePreview}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 rounded-lg border-2 border-slate-300 px-6 py-3 font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Preview
            </button>
          </div>

          {/* Progress */}
          {isGenerating && (
            <div className="mb-4 space-y-2">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-emerald-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">Processing...</p>
            </div>
          )}

          {/* Message */}
          {message && (
            <div
              className={`rounded-lg p-4 text-sm ${
                message.includes('✅')
                  ? 'bg-green-50 text-green-700'
                  : message.includes('❌')
                    ? 'bg-red-50 text-red-700'
                    : 'bg-blue-50 text-blue-700'
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Setup Instructions</h2>

          <div className="space-y-3">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                1
              </div>
              <div>
                <p className="font-semibold text-slate-900">Generate frames</p>
                <p className="text-sm text-slate-600">Click &quot;Download Frames&quot; to create WebP images</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                2
              </div>
              <div>
                <p className="font-semibold text-slate-900">Create directory</p>
                <p className="text-sm font-mono text-slate-600">public/hero-sequence/</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                3
              </div>
              <div>
                <p className="font-semibold text-slate-900">Add files</p>
                <p className="text-sm text-slate-600">
                  Move downloaded frames (frame_000.webp, etc.) to the directory
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                4
              </div>
              <div>
                <p className="font-semibold text-slate-900">Configure</p>
                <p className="text-sm font-mono text-slate-600">
                  Set NEXT_PUBLIC_HERO_SEQUENCE_FRAMES={frameCount} in .env.local
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                5
              </div>
              <div>
                <p className="font-semibold text-slate-900">Restart</p>
                <p className="text-sm text-slate-600">
                  Run <span className="font-mono">npm run dev</span> and visit the home page
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex gap-3">
          <Link
            href="/HERO_SEQUENCER_SETUP.md"
            className="flex-1 rounded-lg bg-slate-200 px-4 py-3 text-center font-semibold text-slate-800 hover:bg-slate-300"
          >
            Full Guide
          </Link>
          <Link href="/" className="flex-1 rounded-lg bg-emerald-600 px-4 py-3 text-center font-semibold text-white hover:bg-emerald-700">
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}
