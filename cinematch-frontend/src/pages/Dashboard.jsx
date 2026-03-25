import { useState, useEffect } from 'react';
import api from '../utils/api';
import RatingStars from '../components/RatingStars';
import WatchlistButton from '../components/WatchlistButton';
import RecommendationCard from '../components/RecommendationCard';

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

const diffTime = (date) => {
  if (!date) return '';
  const diffMs = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours === 0) {
    const min = Math.floor(diffMs / (1000 * 60));
    return min === 0 ? 'just now' : `${min} minute${min > 1 ? 's' : ''} ago`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''} ago`;
};

export default function Dashboard() {
  const [popular, setPopular] = useState([]);
  const [isPopLoading, setIsPopLoading] = useState(true);
  const [popError, setPopError] = useState('');

  const [recs, setRecs] = useState([]);
  const [isRecsLoading, setIsRecsLoading] = useState(true);
  const [recsError, setRecsError] = useState('');
  const [recsGeneratedAt, setRecsGeneratedAt] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await api.get('/api/movies/popular');
        setPopular(res.data.results);
      } catch (err) {
        setPopError('Failed to load popular movies.');
      } finally {
        setIsPopLoading(false);
      }
    };

    const fetchRecs = async () => {
      try {
        const res = await api.get('/api/recommendations');
        setRecs(res.data.data);
        if (res.data.generatedAt) {
          setRecsGeneratedAt(res.data.generatedAt);
        }
      } catch (err) {
        setRecsError("We're still learning your taste — rate more movies to improve suggestions");
      } finally {
        setIsRecsLoading(false);
      }
    };

    fetchPopular();
    fetchRecs();
  }, []);

  const handleRefreshRecs = async () => {
    setIsRefreshing(true);
    setRecsError('');
    try {
      const res = await api.post('/api/recommendations/refresh');
      setRecs(res.data.data);
      if (res.data.generatedAt) {
        setRecsGeneratedAt(res.data.generatedAt);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setRecsError('You have hit the refresh limit. Please try again later.');
      } else {
        setRecsError("We're still learning your taste — rate more movies to improve suggestions");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-16">
        
        {/* Section 1: Recommendations */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-amber-500 mb-2">Your picks</h1>
              <p className="text-neutral-400">Personalised recommendations based on your taste profile.</p>
            </div>
            
            <div className="flex items-center gap-4">
              {recsGeneratedAt && !isRecsLoading && !isRefreshing && (
                <span className="text-xs text-neutral-500 italic">
                  Recommendations updated {diffTime(recsGeneratedAt)}
                </span>
              )}
              <button
                onClick={handleRefreshRecs}
                disabled={isRefreshing || isRecsLoading}
                className="px-4 py-2 bg-neutral-800 text-neutral-200 border border-neutral-700 hover:bg-neutral-700 hover:text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 flex flex-shrink-0"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh recommendations'}
              </button>
            </div>
          </div>

          {recsError ? (
            <div className="p-6 text-center text-amber-200 bg-amber-900/20 border border-amber-500/30 rounded-lg">
              {recsError}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {isRecsLoading || isRefreshing
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : recs.map((item, i) => (
                    <RecommendationCard key={i} item={item} />
                  ))
              }
            </div>
          )}
        </section>

        {/* Section 2: Popular Now */}
        <section>
          <h2 className="text-3xl font-bold text-indigo-400 mb-2">Popular now</h2>
          <p className="text-neutral-400 mb-6">Explore what's trending around the world.</p>

          {popError && (
            <div className="p-4 text-red-200 bg-red-900/50 border border-red-500/50 rounded-lg mb-6">
              {popError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isPopLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : popular.slice(0, 12).map(movie => (
                  <div key={movie._id || movie.tmdbId} className="bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-indigo-500/50 transition-all hover:shadow-lg hover:shadow-indigo-500/10 group flex flex-col">
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
                      
                      <div className="flex-1"></div>
                      
                      <div className="pt-2 mt-auto border-t border-neutral-700 space-y-2">
                        <RatingStars tmdbId={movie.tmdbId} />
                        <WatchlistButton tmdbId={movie.tmdbId} />
                      </div>
                    </div>
                  </div>
                ))
            }
          </div>
        </section>
        
      </div>
    </div>
  );
}
