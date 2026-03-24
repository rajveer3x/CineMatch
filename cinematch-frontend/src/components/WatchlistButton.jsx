import { useState } from 'react';
import api from '../utils/api';

export default function WatchlistButton({ tmdbId, initialStatus = null, entryId = null, onUpdate }) {
  const [status, setStatus] = useState(initialStatus);
  const [currentEntryId, setCurrentEntryId] = useState(entryId);
  const [isLoading, setIsLoading] = useState(false);

  const addToWatchlist = async () => {
    const prevStatus = status;
    setStatus('to-watch');
    setIsLoading(true);
    try {
      const res = await api.post('/api/watchlist', { tmdbId, status: 'to-watch' });
      setCurrentEntryId(res.data.entry._id);
      if (onUpdate) onUpdate(res.data.entry);
    } catch (err) {
      setStatus(prevStatus);
      console.error('Failed to add to watchlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!currentEntryId) return;
    const newStatus = status === 'to-watch' ? 'watched' : 'to-watch';
    const prevStatus = status;
    setStatus(newStatus);
    setIsLoading(true);
    try {
      const res = await api.patch(`/api/watchlist/${currentEntryId}`, { status: newStatus });
      if (onUpdate) onUpdate(res.data);
    } catch (err) {
      setStatus(prevStatus);
      console.error('Failed to update watchlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const remove = async () => {
    if (!currentEntryId) return;
    const prevStatus = status;
    const prevId = currentEntryId;
    setStatus(null);
    setCurrentEntryId(null);
    setIsLoading(true);
    try {
      await api.delete(`/api/watchlist/${prevId}`);
      if (onUpdate) onUpdate(null);
    } catch (err) {
      setStatus(prevStatus);
      setCurrentEntryId(prevId);
      console.error('Failed to remove from watchlist:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!status) {
    return (
      <button
        onClick={addToWatchlist}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Adding...' : '+ Add to Watchlist'}
      </button>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={toggleStatus}
        disabled={isLoading}
        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          status === 'watched'
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-yellow-600 hover:bg-yellow-700 text-white'
        }`}
      >
        {isLoading ? '...' : status === 'watched' ? '✓ Watched' : '⏳ To Watch'}
      </button>
      <button
        onClick={remove}
        disabled={isLoading}
        className="px-2 py-2 text-sm text-neutral-400 hover:text-red-400 transition-colors disabled:opacity-50"
        aria-label="Remove from watchlist"
      >
        ✕
      </button>
    </div>
  );
}
