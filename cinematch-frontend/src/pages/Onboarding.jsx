import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SelectableMovieCard from '../components/SelectableMovieCard';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import getApiErrorMessage from '../utils/getApiErrorMessage';

const MIN_SELECTIONS = 5;
const MAX_SELECTIONS = 15;

export default function Onboarding() {
  const [movies, setMovies] = useState([]);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await api.get('/api/movies/popular');
        setMovies(res.data.results.slice(0, 20));
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load movies.'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    if (user?.onboardingComplete || user?.preferenceMovieIds?.length >= MIN_SELECTIONS) {
      navigate('/dashboard', { replace: true });
      return;
    }

    if (user?.preferenceMovieIds?.length) {
      setSelectedMovies(user.preferenceMovieIds.slice(0, MAX_SELECTIONS));
    }
  }, [navigate, user]);

  const selectedCount = selectedMovies.length;
  const isContinueEnabled = selectedCount >= MIN_SELECTIONS;

  const progressMessage = useMemo(() => {
    if (selectedCount >= MAX_SELECTIONS) {
      return `You have reached the ${MAX_SELECTIONS}-movie cap.`;
    }

    if (isContinueEnabled) {
      return 'Your first recommendation set is ready.';
    }

    return `Select ${MIN_SELECTIONS - selectedCount} more movie${MIN_SELECTIONS - selectedCount === 1 ? '' : 's'} to continue.`;
  }, [isContinueEnabled, selectedCount]);

  const toggleMovieSelection = (tmdbId) => {
    setError('');
    setSelectedMovies((current) => {
      if (current.includes(tmdbId)) {
        return current.filter((id) => id !== tmdbId);
      }

      if (current.length >= MAX_SELECTIONS) {
        return current;
      }

      return [...current, tmdbId];
    });
  };

  const handleContinue = async () => {
    if (!isContinueEnabled) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const res = await api.post('/api/users/preferences', {
        movieIds: selectedMovies
      });

      updateUser(res.data);
      navigate('/dashboard');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save your movie preferences.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d14] text-white">
        <div className="space-y-4 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#f3c56b] border-t-transparent" />
          <p className="text-sm uppercase tracking-[0.35em] text-neutral-400">Loading movies</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(243,197,107,0.18),_transparent_30%),linear-gradient(180deg,_#090b12_0%,_#111629_55%,_#090b12_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_90px_rgba(0,0,0,0.35)] backdrop-blur-sm">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.35fr_0.65fr] lg:px-10 lg:py-10">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-[#f3c56b]">CineMatch Setup</p>
              <div className="space-y-3">
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">Tell us what you like</h1>
                <p className="max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg">
                  Select at least 5 movies to personalize your recommendations. We&apos;ll use these picks to shape the dashboard instead of dropping you into generic results.
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/25 p-5">
              <div className="flex items-center justify-between text-sm text-neutral-300">
                <span>Selected movies</span>
                <span className="font-semibold text-white">{selectedCount} / {MAX_SELECTIONS}</span>
              </div>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#f3c56b] via-[#ee8f68] to-[#e35b61] transition-all duration-300"
                  style={{ width: `${Math.min((selectedCount / MIN_SELECTIONS) * 100, 100)}%` }}
                />
              </div>
              <p className="mt-4 text-sm leading-6 text-neutral-400">{progressMessage}</p>
              <button
                type="button"
                onClick={handleContinue}
                disabled={!isContinueEnabled || isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-[#f3c56b] px-5 py-3 text-sm font-bold text-[#1d1620] transition hover:bg-[#ffd88a] disabled:cursor-not-allowed disabled:bg-[#6e654b] disabled:text-neutral-300"
              >
                {isSubmitting ? 'Saving your taste...' : 'Continue'}
              </button>
              <p className="mt-3 text-xs leading-5 text-neutral-500">
                You only do this once unless preferences are reset later.
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Popular right now</h2>
            <p className="mt-1 text-sm text-neutral-400">
              Pick the movies you already know you love. Each selection becomes a strong signal for your first recommendation batch.
            </p>
          </div>
          <p className="text-sm text-neutral-500">Minimum 5 movies, maximum 15 movies</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {movies.map((movie) => (
            <SelectableMovieCard
              key={movie.tmdbId}
              movie={movie}
              isSelected={selectedMovies.includes(movie.tmdbId)}
              onToggle={() => toggleMovieSelection(movie.tmdbId)}
            />
          ))}
        </div>

        <div className="mt-10 rounded-[1.5rem] border border-white/10 bg-black/20 p-4 sm:hidden">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!isContinueEnabled || isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-[#f3c56b] px-5 py-3 text-sm font-bold text-[#1d1620] transition hover:bg-[#ffd88a] disabled:cursor-not-allowed disabled:bg-[#6e654b] disabled:text-neutral-300"
          >
            {isSubmitting ? 'Saving your taste...' : `Continue with ${selectedCount} picks`}
          </button>
        </div>
      </div>
    </div>
  );
}
