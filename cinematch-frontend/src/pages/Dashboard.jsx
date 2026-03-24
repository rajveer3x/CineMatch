import { useState, useEffect } from 'react';
import api from '../utils/api';
import RatingStars from '../components/RatingStars';
import WatchlistButton from '../components/WatchlistButton';

const SkeletonCard = () => (
  <div className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 animate-pulse">
    <div className="w-full aspect-[2/3] bg-neutral-700" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-neutral-700 rounded w-3/4" />
      <div className="h-3 bg-neutral-700 rounded w-1/2" />
      <div className="h-5 bg-neutral-700 rounded w-full" />
    </div>
  </div>
);

export default function Dashboard() {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await api.get('/api/movies/popular');
        setMovies(res.data.results);
      } catch (err) {
        setError('Failed to load popular movies. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPopular();
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-indigo-400 mb-2">Popular Movies</h1>
        <p className="text-neutral-400 mb-8">Explore what's trending right now.</p>

        {error && (
          <div className="p-4 text-red-200 bg-red-900/50 border border-red-500/50 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)
            : movies.map(movie => (
                <div key={movie._id || movie.tmdbId} className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10 group">
                  <div className="relative">
                    <img
                      src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
                      alt={movie.title}
                      className="w-full aspect-[2/3] object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    {movie.voteAverage != null && (
                      <span className="absolute top-2 right-2 px-2 py-1 text-xs font-bold bg-indigo-600/90 backdrop-blur-sm rounded-md">
                        ⭐ {movie.voteAverage.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-3">
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
                    <RatingStars tmdbId={movie.tmdbId} />
                    <WatchlistButton tmdbId={movie.tmdbId} />
                  </div>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  );
}
