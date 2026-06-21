'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NoImageFallback from './NoImageFallback';
import { getRenderableImages } from '@/lib/image-src';

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export default function ImageCarousel({
  images,
  title,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const renderableImages = getRenderableImages(images);

  if (renderableImages.length === 0) {
    return (
      <div className="relative w-full h-72 md:h-80 rounded-lg overflow-hidden">
        <NoImageFallback label="No images uploaded" />
      </div>
    );
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % renderableImages.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + renderableImages.length) % renderableImages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Container */}
      <div className="relative w-full h-72 md:h-80 bg-gray-200 rounded-lg overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full h-full"
          >
            <img
              src={renderableImages[currentIndex]}
              alt={`${title} - Image ${currentIndex + 1}`}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        {renderableImages.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {renderableImages.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Strip */}
      {renderableImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {renderableImages.map((image, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                idx === currentIndex
                  ? 'border-blue-500'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <img
                src={image}
                alt={`Thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
