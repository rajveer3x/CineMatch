import { useState, useEffect, useRef, useCallback } from 'react';
import api from '../utils/api';
import RatingStars from '../components/RatingStars';
import WatchlistButton from '../components/WatchlistButton';

export default function Discover() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef(null);

  const searchMovies = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await api.get('/api/movies/search', { params: { query: q } });
      setResults(res.data.results || []);
      setHasSearched(true);
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      searchMovies(value);
    }, 400);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-indigo-400 mb-2">Discover</h1>
        <p className="text-neutral-400 mb-6">Search for any movie in the world.</p>

        {/* Search input */}
        <div className="relative mb-8">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search for a movie..."
            className="w-full p-4 pl-12 bg-neutral-800 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-lg"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {error && (
          <div className="p-4 text-red-200 bg-red-900/50 border border-red-500/50 rounded-lg mb-6">{error}</div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state — before first search */}
        {!isLoading && !hasSearched && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🎬</p>
            <p className="text-lg text-neutral-500">Search for a movie to get started</p>
          </div>
        )}

        {/* No results */}
        {!isLoading && hasSearched && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-lg text-neutral-500">No results found for "{query}"</p>
          </div>
        )}

        {/* Results grid */}
        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map(movie => (
              <div key={movie.id} className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10 group">
                <div className="relative">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
                    alt={movie.title}
                    className="w-full aspect-[2/3] object-cover group-hover:scale-[1.02] transition-transform duration-300"
                  />
                  {movie.vote_average != null && (
                    <span className="absolute top-2 right-2 px-2 py-1 text-xs font-bold bg-indigo-600/90 backdrop-blur-sm rounded-md">
                      ⭐ {movie.vote_average.toFixed(1)}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-base font-semibold text-white truncate" title={movie.title}>{movie.title}</h3>
                    {movie.release_date && <p className="text-xs text-neutral-500 mt-0.5">{new Date(movie.release_date).getFullYear()}</p>}
                  </div>
                  <RatingStars tmdbId={movie.id} />
                  <WatchlistButton tmdbId={movie.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
