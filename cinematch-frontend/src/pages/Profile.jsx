import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Profile() {
  const { user } = useAuth();
  const [topRatings, setTopRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const res = await api.get('/api/ratings/me');
        const sorted = res.data.sort((a, b) => b.score - a.score).slice(0, 5);
        setTopRatings(sorted);
      } catch (error) {
        console.error("Failed to load ratings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRatings();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-900 text-white py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-indigo-400">Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 col-span-1 h-fit shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-white">User Details</h2>
            <div className="space-y-3 text-sm">
              <p><span className="text-neutral-500 font-medium w-24 inline-block">Username</span> <span className="text-neutral-200">{user.username}</span></p>
              <p><span className="text-neutral-500 font-medium w-24 inline-block">Email</span> <span className="text-neutral-200 truncate">{user.email}</span></p>
              <p><span className="text-neutral-500 font-medium w-24 inline-block">Ratings</span> <span className="text-indigo-400 font-bold">{user.ratingsCount}</span></p>
              <p><span className="text-neutral-500 font-medium w-24 inline-block">Status</span> <span className="text-green-400 font-medium">{user.onboardingComplete ? 'Active' : 'New User'}</span></p>
            </div>
          </div>
          
          <div className="bg-neutral-800 p-6 rounded-lg border border-neutral-700 col-span-2 shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-amber-500">Your taste profile</h2>
            {user.tasteProfile ? (
              <p className="text-neutral-300 italic leading-relaxed text-lg">"{user.tasteProfile}"</p>
            ) : (
              <p className="text-neutral-500 italic">No taste profile generated yet. Rate more movies or visit your dashboard to generate one.</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4 border-b border-neutral-800 pb-2 text-indigo-400 mt-12">Top 5 Rated Movies</h2>
          {loading ? (
            <p className="text-neutral-500 animate-pulse">Loading your favorites...</p>
          ) : topRatings.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {topRatings.map(rating => (
                <div key={rating._id} className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden relative group hover:border-indigo-500 transition-colors">
                  <img 
                    src={rating.movieId?.posterPath ? `https://image.tmdb.org/t/p/w500${rating.movieId.posterPath}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
                    alt={rating.movieId?.title}
                    className="w-full aspect-[2/3] object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute top-2 right-2 bg-indigo-600/90 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold text-white shadow-sm">
                    ⭐ {rating.score}
                  </div>
                  <div className="p-3 truncate text-sm font-semibold text-neutral-200">
                    {rating.movieId?.title}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 bg-neutral-800 p-4 rounded border border-neutral-700">You haven't rated any movies yet.</p>
          )}
        </div>

      </div>
    </div>
  );
}
