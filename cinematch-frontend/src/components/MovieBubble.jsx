import React from 'react';

export default function MovieBubble({ title, imageUrl, matchScore, size = 'default', delay = 0 }) {
  // Map sizes to classes
  const sizeClasses = {
    small: 'w-40 h-40 md:w-48 md:h-48',
    default: 'w-48 h-48 md:w-56 md:h-56',
    large: 'w-56 h-56 md:w-64 md:h-64'
  };

  return (
    <div 
      className={`relative group cursor-pointer rounded-full overflow-hidden transition-all duration-700 hover:z-20 align-top inline-block hover:-translate-y-2 ${sizeClasses[size]} m-4`}
      style={{
        animation: `float 6s ease-in-out infinite`,
        animationDelay: `${delay}ms`
      }}
    >
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110"
        style={{ backgroundImage: `url(${imageUrl})` }}
      ></div>
      
      {/* Deep baseline overlay to ensure image blends with Noir theme */}
      <div className="absolute inset-0 bg-background/30 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-0"></div>

      {/* Glassmorphism Hover Overlay (Electric Violet AI interaction) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-surface-variant/40 backdrop-blur-[12px] transition-all duration-500 flex flex-col items-center justify-center p-4 text-center">
        {/* AI Match Score Badge */}
        <div className="relative w-16 h-16 rounded-full border border-secondary flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(210,187,255,0.4)]">
          {/* Inner violet glow */}
          <div className="absolute inset-0 rounded-full bg-secondary/10 blur-sm"></div>
          <span className="text-secondary font-newsreader text-2xl font-bold z-10">{matchScore}%</span>
        </div>
        
        {/* Movie Title */}
        <h3 className="font-newsreader text-on-surface text-lg md:text-xl font-bold leading-tight drop-shadow-md">{title}</h3>
        <span className="text-xs font-manrope text-secondary mt-1 uppercase tracking-widest drop-shadow-md">AI Match</span>
      </div>

      {/* Structural & Ambient glow around the bubble */}
      <div className="absolute inset-0 rounded-full ring-1 ring-outline-variant/30 group-hover:ring-secondary/60 group-hover:shadow-[0_0_50px_rgba(210,187,255,0.3)] transition-all duration-500 pointer-events-none"></div>

      {/* Built-in Keyframes for floating (simplest way without modding config) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-12px) scale(1.02); }
          100% { transform: translateY(0px) scale(1); }
        }
      `}} />
    </div>
  );
}
