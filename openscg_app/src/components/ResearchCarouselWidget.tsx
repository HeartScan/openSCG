"use client";

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StudyImage } from '@/types/science';
import { X, ChevronLeft, ChevronRight, Maximize2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import useEmblaCarousel from 'embla-carousel-react';
import { UseEmblaCarouselType } from 'embla-carousel-react';

type EmblaApiType = UseEmblaCarouselType[1];

interface ExtendedStudyImage extends StudyImage {
  studyId: string;
  slug: string;
  studyTitle: string;
  studyYear: number;
  cluster: string;
}

export function ResearchCarouselWidget() {
  const [images, setImages] = useState<ExtendedStudyImage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [miniIndex, setMiniIndex] = useState(0);

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  const onSelect = useCallback((api: EmblaApiType) => {
    if (!api) return;
    setCurrentIndex(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    
    // Subscribe to embla events
    emblaApi.on('reInit', onSelect);
    emblaApi.on('select', onSelect);
    
    return () => {
      emblaApi.off('reInit', onSelect);
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    async function fetchManifest() {
      try {
        const response = await fetch('/science-hub/images.json');
        const data: ExtendedStudyImage[] = await response.json();
        
        // Randomize image order
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setImages(shuffled);
      } catch (error) {
        console.error('Failed to load image manifest:', error);
      }
    }
    fetchManifest();
  }, []);

  // Mini widget auto-advance
  useEffect(() => {
    if (images.length === 0 || isExpanded) return;
    const interval = setInterval(() => {
      setMiniIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length, isExpanded]);

  // Full carousel auto-advance
  useEffect(() => {
    if (!emblaApi || !isExpanded) return;
    
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);
    
    return () => clearInterval(interval);
  }, [emblaApi, isExpanded]);

  if (images.length === 0) return null;

  const currentMiniImage = images[miniIndex];

  return (
    <>
      {/* Mini Widget (Collapsed) */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="fixed bottom-6 right-6 z-50 group animate-in fade-in slide-in-from-bottom-10 duration-1000"
        >
          <div className="relative w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl shadow-2xl border-2 border-primary/20 overflow-hidden transition-all hover:scale-110 hover:border-primary active:scale-95">
            <Image
              src={currentMiniImage.path}
              alt="Research thumbnail"
              fill
              className="object-cover p-1 animate-pulse-subtle"
            />
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors" />
            <div className="absolute bottom-1 right-1 bg-primary text-white p-1 rounded-lg shadow-lg">
              <Maximize2 className="w-3 h-3" />
            </div>
          </div>
          <div className="absolute -top-2 -left-2 bg-slate-900 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg uppercase tracking-tighter">
            Insights
          </div>
        </button>
      )}

      {/* Full Carousel (Expanded Overlay) */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors z-[110]"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="w-full max-w-6xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[80vh] md:h-[70vh]">
            {/* Carousel Area */}
            <div className="flex-1 relative bg-slate-50 overflow-hidden group">
              <div className="h-full" ref={emblaRef}>
                <div className="flex h-full">
                  {images.map((img, idx) => (
                    <div key={img.id} className="flex-[0_0_100%] min-w-0 relative h-full flex items-center justify-center p-8">
                      <div className="relative w-full h-full">
                        <Image
                          src={img.path}
                          alt={img.caption}
                          fill
                          className="object-contain"
                          priority={idx === currentIndex}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              <button
                onClick={scrollPrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-900 shadow-2xl hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90 z-10"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={scrollNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 bg-white border-2 border-slate-100 rounded-full flex items-center justify-center text-slate-900 shadow-2xl hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90 z-10"
                aria-label="Next slide"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {currentIndex + 1} / {images.length}
              </div>
            </div>

            {/* Sidebar / Info Area */}
            <div className="w-full md:w-80 lg:w-96 p-8 md:p-12 flex flex-col bg-white border-l border-slate-100">
              <div className="flex-grow overflow-y-auto">
                <div className="mb-6">
                  <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-lg tracking-wider uppercase">
                    Study {images[currentIndex].studyId}
                  </span>
                  <span className="ml-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                    {images[currentIndex].studyYear}
                  </span>
                </div>

                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-6 leading-tight tracking-tight">
                  {images[currentIndex].studyTitle}
                </h3>

                <div className="prose prose-slate prose-sm">
                  <p className="text-slate-500 italic leading-relaxed font-medium">
                    {images[currentIndex].caption && images[currentIndex].caption !== "No caption found automatically." 
                      ? images[currentIndex].caption 
                      : "No descriptive caption available for this figure."}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50">
                <Link
                  href={`/science/studies/${images[currentIndex].slug}`}
                  onClick={() => setIsExpanded(false)}
                  className="flex items-center justify-center gap-3 w-full bg-slate-900 hover:bg-primary text-white py-4 rounded-2xl font-black text-sm transition-all shadow-xl active:scale-[0.98]"
                >
                  READ STUDY <ExternalLink className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.02); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}
