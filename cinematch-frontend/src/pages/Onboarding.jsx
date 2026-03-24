import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import RatingStars from '../components/RatingStars';

export default function Onboarding() {
  const [movies, setMovies] = useState([]);
  const [ratingsCount, setRatingsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState('');

  const { updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/api/movies/popular');
        setMovies(res.data.results.slice(0, 10));
      } catch (err) {
        setError('Failed to load movies');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const handleRated = () => {
    setRatingsCount(prev => prev + 1);
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    setError('');
    try {
      const res = await api.post('/api/users/complete-onboarding');
      updateUser({ onboardingComplete: true });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete onboarding');
    } finally {
      setIsCompleting(false);
    }
  };

  const progress = Math.min(ratingsCount, 5);

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
        <p className="text-center text-neutral-400 mb-8">Rate at least 5 movies so we can learn your taste.</p>

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
                <RatingStars tmdbId={movie.tmdbId} onRated={handleRated} />
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
