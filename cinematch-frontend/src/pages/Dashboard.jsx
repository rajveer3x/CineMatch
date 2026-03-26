import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import RatingStars from '../components/RatingStars';
import WatchlistButton from '../components/WatchlistButton';
import RecommendationCard from '../components/RecommendationCard';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const SkeletonCard = () => (
  <div className="animate-pulse overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800">
    <div className="aspect-[2/3] w-full bg-neutral-700" />
    <div className="space-y-3 p-4">
      <div className="h-4 w-3/4 rounded bg-neutral-700" />
      <div className="h-3 w-1/2 rounded bg-neutral-700" />
      <div className="h-5 w-full rounded bg-neutral-700" />
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
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [popular, setPopular] = useState([]);
  const [isPopLoading, setIsPopLoading] = useState(true);
  const [popError, setPopError] = useState('');

  const [recs, setRecs] = useState([]);
  const [isRecsLoading, setIsRecsLoading] = useState(true);
  const [recsError, setRecsError] = useState('');
  const [recsGeneratedAt, setRecsGeneratedAt] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDashboardBooting, setIsDashboardBooting] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await api.get('/api/movies/popular');
        setPopular(res.data.results);
      } catch (err) {
        setPopError(getApiErrorMessage(err, 'Failed to load popular movies.'));
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
      } catch {
        setRecsError("We're still learning your taste - rate more movies to improve suggestions");
      } finally {
        setIsRecsLoading(false);
      }
    };

    const bootstrapDashboard = async () => {
      try {
        const latestUser = await refreshUser();
        const hasCompletedOnboarding = Boolean(
          latestUser?.onboardingComplete || latestUser?.preferenceMovieIds?.length >= 5
        );

        if (!hasCompletedOnboarding) {
          navigate('/onboarding', { replace: true });
          return;
        }

        await Promise.all([fetchPopular(), fetchRecs()]);
      } finally {
        setIsDashboardBooting(false);
      }
    };

    bootstrapDashboard();
  }, [navigate, refreshUser]);

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
        setRecsError("We're still learning your taste - rate more movies to improve suggestions");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isDashboardBooting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-900 text-white">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
          <p className="text-sm uppercase tracking-[0.3em] text-neutral-400">Preparing your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <div className="mx-auto max-w-6xl space-y-16 px-4 py-8">
        <section>
          <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-amber-500">Movies You&apos;ll Like</h1>
              <p className="text-neutral-400">Personalised recommendations picked from your ratings and taste profile.</p>
            </div>

            <div className="flex items-center gap-4">
              {recsGeneratedAt && !isRecsLoading && !isRefreshing ? (
                <span className="text-xs italic text-neutral-500">
                  Recommendations updated {diffTime(recsGeneratedAt)}
                </span>
              ) : null}
              <button
                onClick={handleRefreshRecs}
                disabled={isRefreshing || isRecsLoading}
                className="flex flex-shrink-0 rounded-md border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-neutral-700 hover:text-white disabled:opacity-50"
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh recommendations'}
              </button>
            </div>
          </div>

          {recsError ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-900/20 p-6 text-center text-amber-200">
              {recsError}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {isRecsLoading || isRefreshing
                ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                : recs.map((item, i) => (
                    <RecommendationCard key={i} item={item} />
                  ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-3xl font-bold text-indigo-400">Popular now</h2>
          <p className="mb-6 text-neutral-400">Explore what&apos;s trending around the world.</p>

          {popError ? (
            <div className="mb-6 rounded-lg border border-red-500/50 bg-red-900/50 p-4 text-red-200">
              {popError}
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {isPopLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : popular.slice(0, 12).map((movie) => (
                  <div key={movie._id || movie.tmdbId} className="group flex flex-col overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800 transition-all hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10">
                    <div className="relative">
                      <img
                        src={movie.posterPath ? `https://image.tmdb.org/t/p/w500${movie.posterPath}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
                        alt={movie.title}
                        className="aspect-[2/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                      {movie.voteAverage != null ? (
                        <span className="absolute right-2 top-2 rounded-md bg-indigo-600/90 px-2 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
                          {movie.voteAverage.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col space-y-3 p-4">
                      <div>
                        <h3 className="truncate text-base font-semibold text-white" title={movie.title}>{movie.title}</h3>
                        {movie.releaseYear ? <p className="mt-0.5 text-xs text-neutral-500">{movie.releaseYear}</p> : null}
                      </div>

                      {movie.genres && movie.genres.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {movie.genres.slice(0, 3).map((genre) => (
                            <span key={genre} className="rounded-full bg-neutral-700 px-2 py-0.5 text-[10px] font-medium text-neutral-300">
                              {genre}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      <div className="min-h-20 rounded border border-neutral-700 bg-neutral-900/40 p-3">
                        <p className="line-clamp-4 text-sm leading-6 text-neutral-300">
                          {movie.overview || 'Description not available for this movie yet.'}
                        </p>
                      </div>

                      <div className="mt-auto space-y-2 border-t border-neutral-700 pt-2">
                        <RatingStars tmdbId={movie.tmdbId} />
                        <WatchlistButton tmdbId={movie.tmdbId} />
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </section>
      </div>
    </div>
  );
}
