import React from 'react';
import RatingStars from './RatingStars';
import WatchlistButton from './WatchlistButton';

export default function RecommendationCard({ item }) {
  const { movie, source, explanation } = item;
  
  return (
    <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10 group flex flex-col h-full">
      <div className="relative">
        <img
          src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
          alt={movie.title}
          className="w-full aspect-[2/3] object-cover group-hover:scale-[1.02] transition-transform duration-300"
        />
        {movie.voteAverage != null && (
          <span className="absolute top-2 right-2 px-2 py-1 text-xs font-bold bg-indigo-600/90 backdrop-blur-sm rounded-md shadow-sm text-white">
            ⭐ {movie.voteAverage.toFixed(1)}
          </span>
        )}
        <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold rounded-md shadow-sm backdrop-blur-sm text-white ${source === 'ai' ? 'bg-amber-500/90' : 'bg-blue-500/90'}`}>
          {source === 'ai' ? 'AI pick' : 'Similar users'}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col space-y-3">
        <div>
          <h3 className="text-base font-semibold text-white truncate" title={movie.title}>{movie.title}</h3>
          {movie.releaseYear && <p className="text-xs text-neutral-500 mt-0.5">{movie.releaseYear}</p>}
        </div>
        
        {movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {movie.genres.slice(0, 3).map(genre => (
              <span key={genre} className="px-2 py-0.5 text-[10px] font-medium bg-neutral-700 text-neutral-300 rounded-full">{genre}</span>
            ))}
          </div>
        )}

        {explanation ? (
          <div className="relative group/tooltip flex-1">
            <p className="text-sm italic text-neutral-400 line-clamp-2 mt-2 bg-neutral-900/50 p-2 rounded border border-neutral-700 hover:text-neutral-200 transition-colors cursor-help">
              "{explanation}"
            </p>
            {/* Tooltip on hover */}
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 -translate-y-full w-64 bg-neutral-950 text-neutral-200 text-xs rounded p-3 opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl border border-neutral-700">
              <span className="font-bold text-indigo-400 block mb-1">Why this?</span>
              {explanation}
            </div>
          </div>
        ) : (
          <div className="flex-1"></div>
        )}
        
        <div className="pt-3 mt-auto border-t border-neutral-700 space-y-2">
          <RatingStars tmdbId={movie.tmdbId} />
          <WatchlistButton tmdbId={movie.tmdbId} />
        </div>
      </div>
    </div>
  );
}
