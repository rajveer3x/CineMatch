import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import RatingStars from '../components/RatingStars';
import getApiErrorMessage from '../utils/getApiErrorMessage';

export default function Onboarding() {
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState('');
  const [ratedMovieIds, setRatedMovieIds] = useState([]);
  const searchDebounceRef = useRef(null);

  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/api/movies/popular');
        setMovies(res.data.results.slice(0, 10));
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load movies'));
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const searchMovies = useCallback(async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearchLoading(true);
    setError('');
    try {
      const res = await api.get('/api/movies/search', {
        params: { query: value }
      });
      setSearchResults(res.data.results || []);
      setHasSearched(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to search movies'));
    } finally {
      setIsSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      searchMovies(value);
    }, 400);
  };

  const handleRated = (tmdbId) => {
    setRatedMovieIds((prev) => (
      prev.includes(tmdbId) ? prev : [...prev, tmdbId]
    ));
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    setError('');
    try {
      await api.post('/api/users/complete-onboarding');
      updateUser({ onboardingComplete: true });
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to complete onboarding'));
    } finally {
      setIsCompleting(false);
    }
  };

  const progress = Math.min(ratedMovieIds.length, 5);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-neutral-900 text-white">
        <p className="text-lg text-neutral-400">Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-center text-indigo-400 mb-2">Welcome to CineMatch!</h1>
        <p className="text-center text-neutral-400 mb-8">Rate at least 5 movies so we can learn your taste. You can use the starter picks below or search for your own favorites.</p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-neutral-400 mb-2">
            <span>{progress} of 5 movies rated</span>
            <span>{progress >= 5 ? '✓ Ready!' : `${5 - progress} more to go`}</span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-3">
            <div
              className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(progress / 5) * 100}%` }}
            />
          </div>
        </div>

        {error && <div className="mb-6 p-3 text-sm text-red-200 bg-red-900/50 border border-red-500/50 rounded">{error}</div>}

        <div className="mb-10 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Search and rate any movie</h2>
            <p className="mt-1 text-sm text-neutral-400">Can’t find your favorites below? Search the full catalog here.</p>
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by movie title..."
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 p-4 pl-12 text-white outline-none transition-all placeholder:text-neutral-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
            />
            <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {isSearchLoading && (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
            </div>
          )}

          {!isSearchLoading && hasSearched && searchResults.length === 0 && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-800/60 p-6 text-center text-neutral-400">
              No movies found for "{searchQuery}".
            </div>
          )}

          {!isSearchLoading && searchResults.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {searchResults.slice(0, 10).map((movie) => (
                <div key={movie.id} className="overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800 transition-colors hover:border-indigo-500/50">
                  <img
                    src={movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=No+Poster'}
                    alt={movie.title}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="p-3">
                    <h3 className="mb-1 truncate text-sm font-medium text-white" title={movie.title}>{movie.title}</h3>
                    {movie.release_date && (
                      <p className="mb-2 text-xs text-neutral-500">{new Date(movie.release_date).getFullYear()}</p>
                    )}
                    <RatingStars tmdbId={movie.id} onRated={() => handleRated(movie.id)} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Movie grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-10">
          {movies.map(movie => (
            <div key={movie._id || movie.tmdbId} className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-indigo-500/50 transition-colors">
              <img
                src={movie.posterPath ? `https://image.tmdb.org/t/p/w300${movie.posterPath}` : 'https://via.placeholder.com/300x450?text=No+Poster'}
                alt={movie.title}
                className="w-full aspect-[2/3] object-cover"
              />
              <div className="p-3">
                <h3 className="text-sm font-medium text-white truncate mb-2" title={movie.title}>{movie.title}</h3>
                <RatingStars tmdbId={movie.tmdbId} onRated={() => handleRated(movie.tmdbId)} />
              </div>
            </div>
          ))}
        </div>

        {/* Continue button */}
        <div className="text-center">
          <button
            onClick={handleComplete}
            disabled={progress < 5 || isCompleting}
            className="px-8 py-3 text-lg font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCompleting ? 'Completing...' : 'Continue to Dashboard →'}
          </button>
          {progress < 5 && <p className="mt-3 text-sm text-neutral-500">Rate {5 - progress} more movie{5 - progress > 1 ? 's' : ''} to unlock</p>}
        </div>
      </div>
    </div>
  );
}
