import React from 'react';
import { ScienceHeader } from '@/components/ScienceHeader';
import { ScienceFooter } from '@/components/ScienceFooter';
import { ResearchCarouselWidget } from '@/components/ResearchCarouselWidget';

export default function ScienceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ScienceHeader />
      <main className="flex-grow">
        {children}
      </main>
      <ResearchCarouselWidget />
      <ScienceFooter />
    </div>
  );
}
