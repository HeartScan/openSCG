import React from 'react';
import { notFound } from 'next/navigation';
import { getSynthesisContent } from '@/lib/science';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { ChevronLeft, Share2, BookOpen } from 'lucide-react';

interface SynthesisPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return [
    { slug: 'cad-evolution' },
    { slug: 'smartphone-accuracy' },
    { slug: 'fiducial-points' },
  ];
}

export default async function SynthesisPage({ params }: SynthesisPageProps) {
  const { slug } = await params;
  const { content, data } = await getSynthesisContent(slug);

  if (!content) {
    notFound();
  }

  // Use title from frontmatter if available, otherwise format slug
  const title = (data.title as string) || slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

  return (
    <div className="bg-slate-50 min-h-screen pb-20">
      {/* Article Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-12 sm:px-6">
          <Link href="/science" className="inline-flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px] mb-8 hover:translate-x-[-4px] transition-transform">
            <ChevronLeft className="w-4 h-4" />
            Back to Evidence Hub
          </Link>
          
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px] mb-4">
              <BookOpen className="w-4 h-4" />
              Comprehensive Synthesis
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-6 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <span>Updated March 2026</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>Scientific Review</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[2rem] p-8 md:p-16 border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden">
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <article className="prose prose-slate dark:prose-invert max-w-none 
                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900
                prose-h1:text-4xl prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-8 prose-h2:pb-4 prose-h2:border-b prose-h2:border-slate-100
                prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-xl prose-p:mb-8
                prose-strong:text-slate-900 prose-strong:font-bold
                prose-table:min-w-[600px] prose-table:border prose-table:border-slate-100 prose-table:my-12
                prose-th:bg-slate-900 prose-th:text-white prose-th:p-5 prose-th:text-xs prose-th:font-bold prose-th:uppercase prose-th:tracking-widest
                prose-td:p-5 prose-td:border-slate-100 prose-td:text-base prose-td:font-medium prose-td:text-slate-700
                prose-li:text-slate-600 prose-li:text-lg prose-li:font-medium prose-li:mb-2
                prose-img:rounded-[2rem] prose-img:shadow-2xl prose-img:border prose-img:border-slate-100">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </article>
            </div>
          </div>

          {/* Social / Share footer for the article */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-8 p-8 bg-slate-900 rounded-[2rem] text-white shadow-xl">
            <div>
              <h4 className="text-xl font-bold mb-2 tracking-tight">Support Open Research</h4>
              <p className="text-slate-400 font-medium">OpenSCG.org provides free access to all clinical validation data.</p>
            </div>
            <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold transition-all whitespace-nowrap tracking-wide active:scale-95">
              <Share2 className="w-5 h-5" />
              Share Synthesis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
