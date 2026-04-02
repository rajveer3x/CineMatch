import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-surface/80 backdrop-blur-[24px] border-b border-outline-variant/[0.15] transition-all">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <NavLink to="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center shadow-[0_4_20px_rgba(245,158,11,0.2)] group-hover:shadow-[0_4_24px_rgba(245,158,11,0.4)] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-on-primary">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 3v18M17 3v18M3 9h18M3 15h18" />
              </svg>
            </div>
            <span className="font-newsreader text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
              CineMatch
            </span>
          </NavLink>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 translate-x-4">
            <NavLink 
              to="/dashboard" 
              className={({isActive}) => `text-base font-manrope font-medium transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/discover" 
              className={({isActive}) => `text-base font-manrope font-medium transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Discover
            </NavLink>
            <NavLink 
              to="/watchlist" 
              className={({isActive}) => `text-base font-manrope font-medium transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Watchlist
            </NavLink>
          </div>

          {/* Right section: Search & Profile */}
          <div className="flex items-center gap-6">
            <button className="text-on-surface-variant hover:text-on-surface transition-colors focus:outline-none" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </button>
            <div className="h-6 w-px bg-surface-container-high hidden sm:block"></div>
            <button className="flex items-center gap-3 p-1 pr-4 rounded-full bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/[0.15] transition-all focus:outline-none focus:ring-1 focus:ring-primary/50 group">
              <div className="w-9 h-9 rounded-full bg-surface-container-highest flex items-center justify-center overflow-hidden border border-outline-variant/[0.15] group-hover:border-primary/50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-on-surface-variant">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <span className="text-sm font-manrope font-medium text-on-surface hidden sm:block">Aria</span>
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}
