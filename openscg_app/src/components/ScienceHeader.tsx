'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

export function ScienceHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const navItems = [
    { name: 'Overview', href: '/science' },
    { name: 'CAD Evolution', href: '/science/synthesis/cad-evolution' },
    { name: 'Smartphone Accuracy', href: '/science/synthesis/smartphone-accuracy' },
    { name: 'Fiducial Points', href: '/science/synthesis/fiducial-points' },
    { name: 'About', href: '/about' },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-black text-2xl flex items-center gap-3 tracking-tighter hover:opacity-90 transition-opacity">
          <Logo />
          <span className="text-slate-900 hidden sm:inline-block">OpenSCG<span className="text-primary">.org</span></span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-bold transition-all hover:text-primary relative py-1",
                pathname === item.href 
                  ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary" 
                  : "text-slate-500"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="flex items-center gap-4">
           {/* Mobile Menu Toggle */}
           <button 
             className="lg:hidden p-2 text-slate-600 hover:text-primary transition-colors"
             onClick={() => setIsMenuOpen(!isMenuOpen)}
           >
             {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
           
           <div className="hidden sm:block">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stable v2.0.1</span>
           </div>
        </div>
      </div>

      {/* Mobile Nav Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[73px] bg-white border-b border-slate-200 shadow-xl p-4 animate-in slide-in-from-top duration-300 z-50">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-base font-bold py-2 px-4 rounded-lg",
                  pathname === item.href ? "bg-primary/10 text-primary" : "text-slate-600 hover:bg-slate-50"
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
