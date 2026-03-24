import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const linkClass = (path) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      location.pathname === path
        ? 'bg-indigo-600 text-white'
        : 'text-neutral-300 hover:text-white hover:bg-neutral-700'
    }`;

  return (
    <nav className="bg-neutral-800 border-b border-neutral-700 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/dashboard" className="text-lg font-bold text-indigo-400 tracking-tight">CineMatch</Link>
          <div className="flex items-center gap-1">
            <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
            <Link to="/discover" className={linkClass('/discover')}>Discover</Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-400">
            👋 <span className="text-neutral-200 font-medium">{user?.username}</span>
          </span>
          <button
            onClick={logout}
            className="px-3 py-1.5 text-sm text-neutral-300 hover:text-white border border-neutral-600 hover:border-neutral-500 rounded-md transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
