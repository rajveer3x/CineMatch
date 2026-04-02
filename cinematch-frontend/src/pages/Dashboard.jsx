import React from 'react';
import Layout from '../components/Layout';
import MovieBubble from '../components/MovieBubble';

const MOCK_RECOMMENDATIONS = [
  { id: 1, title: 'Blade Runner 2049', matchScore: 98, size: 'large', delay: 0, imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop' },
  { id: 2, title: 'Drive', matchScore: 94, size: 'default', delay: 1500, imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=800&auto=format&fit=crop' },
  { id: 3, title: 'Nightcrawler', matchScore: 91, size: 'small', delay: 3000, imageUrl: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=800&auto=format&fit=crop' },
  { id: 4, title: 'The Batman', matchScore: 89, size: 'default', delay: 700, imageUrl: 'https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=800&auto=format&fit=crop' },
  { id: 5, title: 'John Wick', matchScore: 88, size: 'small', delay: 2200, imageUrl: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=800&auto=format&fit=crop' },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="relative pt-4 pb-20 min-h-[85vh] flex flex-col justify-center">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[150px] pointer-events-none"></div>

        {/* Header Section */}
        <div className="mb-16 text-center md:text-left relative z-10 max-w-2xl mx-auto md:mx-0">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-secondary/30 bg-secondary/5 mb-6">
            <div className="w-2 h-2 rounded-full bg-secondary animate-pulse"></div>
            <span className="text-secondary font-manrope font-bold tracking-widest uppercase text-xs">Neo Noir</span>
          </div>
          <h1 className="font-newsreader text-5xl md:text-7xl font-bold text-on-surface mb-4 tracking-tight drop-shadow-sm">
            Your recommendations
          </h1>
          <p className="text-on-surface-variant font-light text-xl md:text-2xl mt-6">
            Powered by AI &mdash; Curated for your late-night mood.
          </p>
        </div>

        {/* Floating Bubble Canvas (Asymmetrical Layout) */}
        <div className="relative z-10 flex flex-wrap justify-center md:justify-start items-center gap-4 md:gap-8 px-4 md:px-12 mt-8">
          {MOCK_RECOMMENDATIONS.map((movie, idx) => (
            <div 
              key={movie.id} 
              className={`flex justify-center items-center ${idx % 2 !== 0 ? 'md:-translate-y-12' : 'md:translate-y-8'}`}
            >
              <MovieBubble 
                title={movie.title}
                imageUrl={movie.imageUrl}
                matchScore={movie.matchScore}
                size={movie.size}
                delay={movie.delay}
              />
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
}
