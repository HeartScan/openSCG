"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { StudyImage } from '@/types/science';
import { ChevronRight, Calendar, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExtendedStudyImage extends StudyImage {
  studyId: string;
  studyTitle: string;
  studyYear: number;
  cluster: string;
}

export function RandomStudyIllustration() {
  const [randomImage, setRandomImage] = useState<ExtendedStudyImage | null>(null);

  const clusterColors: Record<string, string> = {
    comparison: 'bg-blue-600',
    cad: 'bg-rose-600',
    hf: 'bg-amber-600',
    tech: 'bg-indigo-600',
    ml: 'bg-emerald-600',
  };

  useEffect(() => {
    async function fetchManifest() {
      try {
        const response = await fetch('/science-hub/images.json');
        const images: ExtendedStudyImage[] = await response.json();
        if (images.length > 0) {
          const randomIdx = Math.floor(Math.random() * images.length);
          setRandomImage(images[randomIdx]);
        }
      } catch (error) {
        console.error('Failed to load image manifest:', error);
      }
    }
    fetchManifest();
  }, []);

  if (!randomImage) return null;

  const clusterColor = clusterColors[randomImage.cluster] || 'bg-primary';

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 mb-20 px-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <Link href={`/science/studies/${randomImage.studyId}`} className="group block">
        <div className="relative overflow-hidden rounded-[3rem] bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 transition-all hover:shadow-primary/20 hover:border-primary/30">
          <div className="grid md:grid-cols-12 items-stretch">
            {/* Image Section */}
            <div className="md:col-span-5 relative aspect-[4/3] md:aspect-auto overflow-hidden bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-8 md:p-12">
              <div className="relative w-full h-full">
                <Image
                  src={randomImage.path}
                  alt={randomImage.caption || `Study ${randomImage.studyId} figure`}
                  fill
                  className="object-contain transition-transform duration-1000 group-hover:scale-110"
                />
              </div>
              <div className="absolute top-6 left-6">
                <div className={cn("text-white text-[8px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-[0.2em]", clusterColor)}>
                  {randomImage.cluster}
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="md:col-span-7 p-8 md:p-16 flex flex-col justify-center relative">
              {/* Decorative accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -z-0 opacity-50" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-opacity-20", clusterColor)}>
                    <Bookmark className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Scientific Highlight</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-black text-slate-900 tracking-wider">STUDY {randomImage.studyId}</span>
                      <div className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{randomImage.studyYear}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 tracking-tighter leading-[0.9] group-hover:text-primary transition-colors">
                  {randomImage.studyTitle}
                </h3>

                <blockquote className="border-l-4 border-primary pl-6 mb-10">
                  <p className="text-slate-600 leading-relaxed font-medium text-lg italic line-clamp-3">
                    {randomImage.caption && randomImage.caption !== "No caption found automatically." 
                      ? randomImage.caption 
                      : "A critical visualization of Seismocardiography data proving clinical efficacy and technical robustness."}
                  </p>
                </blockquote>

                <div className="flex items-center text-primary font-black text-xs uppercase tracking-[0.2em] gap-3">
                  EXPLORE FULL EVIDENCE <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
      
      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Scientific Insight</p>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      </div>
    </div>
  );
}
