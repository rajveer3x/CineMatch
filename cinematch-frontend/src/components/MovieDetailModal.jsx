import React from 'react';

export default function MovieDetailModal({ isOpen = true, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12 font-manrope">
      {/* Immersive Blurred Backdrop honoring the Glass & Gradient Rule */}
      <div 
        className="absolute inset-0 bg-surface/70 backdrop-blur-[24px] transition-opacity cursor-pointer"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div 
        className="relative w-full max-w-[1000px] bg-surface-container-highest/95 backdrop-blur-[40px] rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(10,10,26,0.8)] border border-outline-variant/[0.1] flex flex-col md:flex-row animate-in fade-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 z-20 p-3 rounded-full bg-surface-container-lowest/60 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant transition-all backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-outline-variant"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
          </svg>
        </button>

        {/* Tall Movie Poster (Left) */}
        <div className="w-full md:w-[45%] min-h-[350px] md:min-h-full relative flex-shrink-0">
           {/* Fallback specific cinematic dark street image */}
           <img 
             src="https://images.unsplash.com/photo-1517604931442-7e0c8de00129?q=80&w=1200&auto=format&fit=crop" 
             alt="Neon Shadows Poster" 
             className="absolute inset-0 w-full h-full object-cover"
           />
           {/* Fade overlay mapping to the dark background so there are no hard cuts */}
           <div className="absolute inset-0 bg-gradient-to-t from-surface-container-highest/95 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-surface-container-highest/30 md:to-surface-container-highest/95"></div>
        </div>

        {/* Details Section (Right) */}
        <div className="w-full md:w-[55%] p-8 md:p-12 lg:pr-14 flex flex-col justify-center relative bg-surface-container-highest/95">
          
          {/* Genre Pill Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-4 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-widest bg-surface border border-outline-variant/[0.15] text-on-surface-variant">Noir</span>
            <span className="px-4 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-widest bg-surface border border-outline-variant/[0.15] text-on-surface-variant">Sci-Fi</span>
            <span className="px-4 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-widest bg-surface border border-outline-variant/[0.15] text-on-surface-variant">Mystery</span>
          </div>

          <h2 className="font-newsreader text-4xl md:text-5xl font-bold text-on-surface mb-2 mt-2">
            Neon Shadows
          </h2>
          <p className="text-primary text-xs md:text-sm font-semibold mb-6 uppercase tracking-[0.2em] opacity-90">
            Directed by Jules Vaughen • 2024
          </p>

          <p className="text-on-surface-variant text-base md:text-lg leading-relaxed mb-8 opacity-90">
            In a city that never sleeps and never forgives, a silent investigator uncovers a conspiracy that bleeds through the digital veil of modern society. A masterclass in visual storytelling and atmospheric tension.
          </p>

          {/* AI Explanation Box (Amber/Gold "Why you'll love this") */}
          <div className="relative overflow-hidden rounded-[20px] bg-primary/10 border border-primary/20 p-6 shadow-[0_0_40px_rgba(245,158,11,0.06)] mt-max">
            {/* Background design flourish */}
            <div className="absolute -top-6 -right-6 p-4 opacity-[0.08] pointer-events-none">
               <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
               </svg>
            </div>
            
            <div className="relative z-10">
              <h3 className="flex items-center gap-2 text-primary font-bold text-base md:text-lg mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Why you'll love this
              </h3>
              <p className="text-on-surface-variant leading-relaxed text-sm md:text-[0.95rem] opacity-90">
                &quot;Based on your admiration for 'The Third Man' and 'Blade Runner', Neon Shadows offers that same perfect collision of urban decay and high-contrast cinematography you crave. The protagonist's internal monologue resonates with your preference for brooding, complex anti-heroes.&quot;
              </p>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-8 flex gap-4">
             <button className="flex-1 bg-primary-gradient text-on-primary font-bold text-lg py-4 px-6 rounded-2xl shadow-[0_4_20px_rgba(245,158,11,0.25)] hover:shadow-[0_8_30px_rgba(245,158,11,0.4)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Play Now
             </button>
             <button className="p-4 rounded-2xl border border-outline-variant/30 hover:bg-surface transition-colors text-on-surface group shadow-sm bg-surface-container-low focus:outline-none focus:ring-2 focus:ring-outline-variant">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:fill-on-surface/20 transition-all">
                  <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                </svg>
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
