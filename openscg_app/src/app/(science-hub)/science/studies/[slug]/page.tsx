import React from 'react';
import { notFound } from 'next/navigation';
import { getStudyBySlug, getStudyContent, getStudyImages, getMasterStudies } from '@/lib/science';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ExternalLink, Users, Target, Info, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';

interface StudyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const studies = await getMasterStudies();
  return studies.map((study) => ({
    slug: study.slug,
  }));
}

export async function generateMetadata({ params }: StudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const study = await getStudyBySlug(slug);

  if (!study) {
    return {
      title: 'Study Not Found',
    };
  }

  const url = `https://openscg.org/science/studies/${slug}`;

  return {
    title: `${study.title} | OpenSCG Science Hub`,
    description: study.answer_machine.population_brief,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: study.title,
      description: study.answer_machine.population_brief,
      url: url,
      type: 'article',
      authors: [study.authors_short],
    },
  };
}

/**
 * Filter out images, their captions and the main H1 title from markdown content 
 * to avoid duplication with the page header.
 */
function processStudyMarkdown(content: string): string {
  return content
    // Remove the first H1 title if it exists (starts with # )
    .replace(/^#\s+.*$/m, '')
    // Remove images and their captions
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\*Caption:.*?\*/g, '')
    .replace(/### 🖼 Study Visuals/g, '')
    .trim();
}

export default async function StudyPage({ params }: StudyPageProps) {
  const { slug } = await params;
  const study = await getStudyBySlug(slug);
  
  if (!study) {
    notFound();
  }

  const { content } = await getStudyContent(study.id);
  const images = await getStudyImages(study.id);

  // Select a "random" image based on study ID to satisfy React purity rules while providing variety
  const studyIdSum = study.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const randomImage = images.length > 0 ? images[studyIdSum % images.length] : null;

  if (!content) {
    notFound();
  }

  const cleanContent = processStudyMarkdown(content);

  // Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    'headline': study.title,
    'description': study.answer_machine.population_brief,
    'author': [
      {
        '@type': 'Person',
        'name': study.authors_short,
      },
    ],
    'datePublished': study.year !== 0 ? `${study.year}-01-01` : undefined,
    'identifier': study.doi,
    'url': `https://openscg.org/science/studies/${slug}`,
  };

  return (
    <div className="bg-slate-50/50 min-h-screen pb-24 font-sans selection:bg-primary/10">
      {/* Add JSON-LD to the page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Study Header - Journal Style */}
      <div className="bg-white border-b border-slate-200 relative overflow-hidden">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        
        <div className="container mx-auto px-4 py-8 sm:px-6 relative">
          <Link href="/science" className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-8 group">
            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ChevronLeft className="w-4 h-4" />
            </div>
            Back to Evidence Hub
          </Link>
          
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
            <div className="max-w-4xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-slate-900 text-white text-[10px] font-black px-4 py-1.5 rounded-full tracking-[0.2em] uppercase shadow-lg shadow-slate-900/10">
                  Case Study {study.id}
                </div>
                <div className="h-px w-8 bg-slate-200" />
                <span className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em]">{study.year !== 0 ? study.year : 'N/A'} Release</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.95] max-w-3xl">
                {study.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-lg italic font-serif">{study.authors_short}</span>
                </div>
                {study.doi && (
                  <div className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300">
                    <div className="w-1 h-1 rounded-full bg-slate-300" />
                    DOI: {study.doi}
                  </div>
                )}
              </div>
            </div>
            
            {study.doi && (
              <a 
                href={`https://doi.org/${study.doi}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-slate-900 hover:bg-primary text-white px-8 py-4 rounded-2xl font-black transition-all shrink-0 shadow-2xl shadow-slate-900/20 active:scale-95 uppercase tracking-widest text-xs"
              >
                Access Paper <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
              {/* Journal accents */}
              <div className="absolute top-0 left-0 w-2 h-full bg-primary/5" />
              
              <article className="prose prose-slate max-w-none 
                prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tighter
                prose-h1:text-3xl prose-h1:mb-8
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:pb-4 prose-h2:border-b-2 prose-h2:border-slate-50
                prose-h3:text-[10px] prose-h3:mt-10 prose-h3:mb-4 prose-h3:text-primary prose-h3:uppercase prose-h3:tracking-[0.3em] prose-h3:bg-primary/5 prose-h3:inline-block prose-h3:px-4 prose-h3:py-2 prose-h3:rounded-lg
                prose-h4:text-lg prose-h4:font-black prose-h4:text-slate-800 prose-h4:mt-8 prose-h4:mb-4
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg prose-p:mb-6 prose-p:font-medium
                prose-blockquote:border-l-[6px] prose-blockquote:border-primary prose-blockquote:bg-slate-50 prose-blockquote:px-8 prose-blockquote:py-6 prose-blockquote:rounded-r-3xl prose-blockquote:not-italic prose-blockquote:font-black prose-blockquote:text-slate-900 prose-blockquote:text-xl prose-blockquote:my-8 prose-blockquote:shadow-inner
                prose-strong:text-slate-900 prose-strong:font-black
                prose-table:w-full prose-table:my-10 prose-table:border-collapse prose-table:shadow-xl prose-table:shadow-slate-100 prose-table:rounded-2xl prose-table:overflow-hidden
                prose-thead:bg-slate-900
                prose-th:text-white prose-th:p-4 prose-th:text-[10px] prose-th:font-black prose-th:uppercase prose-th:tracking-[0.2em] prose-th:text-left
                prose-td:p-4 prose-td:border-b prose-td:border-slate-50 prose-td:text-base prose-td:font-bold prose-td:text-slate-700
                prose-hr:border-slate-100 prose-hr:my-12
                prose-li:text-slate-600 prose-li:text-lg prose-li:mb-2 prose-li:font-medium prose-ul:list-disc prose-ul:pl-6 prose-ol:pl-6">
                <div className="mb-8">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {cleanContent}
                  </ReactMarkdown>
                </div>
              </article>

              {randomImage && (
                <div className="mt-12 pt-12 border-t-2 border-slate-50">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="h-px flex-grow bg-slate-100" />
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] shrink-0">Featured Illustration</h3>
                    <div className="h-px flex-grow bg-slate-100" />
                  </div>
                  
                  <div className="relative group">
                    <div className="relative aspect-video w-full max-w-2xl mx-auto overflow-hidden rounded-[2rem] border border-slate-100 shadow-xl transition-all duration-700 group-hover:scale-[1.01] group-hover:shadow-primary/10">
                      <Image 
                        src={randomImage.path} 
                        alt={randomImage.caption} 
                        fill
                        className="object-contain bg-slate-50 p-6 md:p-10 transition-all duration-700 group-hover:bg-white"
                      />
                    </div>
                    {randomImage.caption && randomImage.caption !== "No caption found automatically." && (
                      <div className="mt-8 max-w-xl mx-auto px-6">
                        <div className="w-12 h-1 bg-primary/20 mx-auto mb-6 rounded-full" />
                        <p className="text-sm text-slate-500 leading-relaxed font-medium italic text-center">
                          {randomImage.caption}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Snapshot Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/30 sticky top-12 border border-white/5">
              <div className="flex items-center gap-4 mb-10 border-b border-white/10 pb-6">
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20 transform -rotate-3">
                  <Info className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Study Snapshot</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Metadata Summary</p>
                </div>
              </div>

              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white/5 rounded-[1.25rem] flex items-center justify-center shrink-0 border border-white/10 text-primary shadow-inner">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Target Population</h4>
                    <p className="text-base text-slate-200 font-bold leading-tight">{study.answer_machine.population_brief}</p>
                  </div>
                </div>
                
                {study.answer_machine.n_count && (
                  <div className="flex gap-6">
                    <div className="w-12 h-12 bg-white/5 rounded-[1.25rem] flex items-center justify-center shrink-0 border border-white/10 text-primary font-black text-xl shadow-inner">N</div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Sample Size</h4>
                      <p className="text-2xl text-white font-black tracking-tighter italic">{study.answer_machine.n_count} <span className="text-[10px] uppercase text-slate-500 ml-1 font-black tracking-widest not-italic">Subjects</span></p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-white/5 rounded-[1.25rem] flex items-center justify-center shrink-0 border border-white/10 text-primary shadow-inner">
                    <Target className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Validated Metric</h4>
                    <p className="text-lg text-primary font-black font-mono tracking-tighter bg-primary/10 px-3 py-1 rounded-lg inline-block">{study.answer_machine.key_metric}</p>
                  </div>
                </div>

                {/* Appraisal Integration */}
                <div className="pt-10 border-t border-white/10 mt-10">
                   <div className="flex items-center gap-3 mb-4">
                     <ShieldCheck className="w-5 h-5 text-emerald-400" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Critical Appraisal</span>
                   </div>
                   <div className="mb-4">
                    <span className={cn(
                      "text-[10px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg",
                      study.appraisal_summary.confidence === 'cornerstone' ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-primary text-white shadow-primary/20"
                    )}>
                      {study.appraisal_summary.confidence}
                    </span>
                  </div>
                  <p className="text-slate-400 font-medium leading-relaxed italic text-base border-l-4 border-primary pl-6 py-1">
                    &ldquo;{study.appraisal_summary.relevance}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
