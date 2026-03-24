import { useState } from 'react';
import api from '../utils/api';

export default function RatingStars({ tmdbId, initialScore = 0, onRated }) {
  const [score, setScore] = useState(initialScore);
  const [hoverScore, setHoverScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleRate = async (newScore) => {
    setIsLoading(true);
    try {
      const res = await api.post('/api/ratings', { tmdbId, score: newScore });
      setScore(newScore);
      if (onRated) onRated(res.data.rating);
    } catch (err) {
      console.error('Failed to save rating:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`inline-flex items-center gap-0.5 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = hoverScore ? star <= hoverScore : star <= score;
        return (
          <button
            key={star}
            type="button"
            onClick={() => handleRate(star)}
            onMouseEnter={() => setHoverScore(star)}
            onMouseLeave={() => setHoverScore(0)}
            className={`text-2xl cursor-pointer transition-colors duration-150 ${
              filled ? 'text-yellow-400' : 'text-neutral-600'
            } hover:scale-110 transform`}
            disabled={isLoading}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            {filled ? '★' : '☆'}
          </button>
        );
      })}
      {isLoading && <span className="ml-2 text-xs text-neutral-400">Saving...</span>}
    </div>
  );
}
