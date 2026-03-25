import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import getApiErrorMessage from '../utils/getApiErrorMessage';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      const { token, user } = response.data;
      login(token, user);
      if (user.onboardingComplete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Invalid credentials'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700">
        <h2 className="text-3xl font-bold text-center text-indigo-400">Login</h2>
        {error && <div className="p-3 text-sm text-red-200 bg-red-900/50 border border-red-500/50 rounded">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2.5 mt-1 bg-neutral-900 border border-neutral-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2.5 mt-1 bg-neutral-900 border border-neutral-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 mt-4 text-white font-medium bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-sm text-center text-neutral-400">Don't have an account? <Link to="/register" className="text-indigo-400 hover:text-indigo-300 transition-colors">Register here</Link></p>
      </div>
    </div>
  );
}
