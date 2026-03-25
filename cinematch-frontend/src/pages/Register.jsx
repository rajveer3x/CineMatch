import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import getApiErrorMessage from '../utils/getApiErrorMessage';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/api/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      const { token, user } = response.data;
      login(token, user);
      navigate('/onboarding');
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-neutral-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-neutral-800 rounded-lg shadow-xl border border-neutral-700">
        <h2 className="text-3xl font-bold text-center text-indigo-400">Register</h2>
        {serverError && <div className="p-3 text-sm text-red-200 bg-red-900/50 border border-red-500/50 rounded">{serverError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full p-2.5 mt-1 bg-neutral-900 border border-neutral-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="johndoe" />
            {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2.5 mt-1 bg-neutral-900 border border-neutral-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="john@example.com" />
            {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300">Password</label>
            <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2.5 mt-1 bg-neutral-900 border border-neutral-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
            {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full p-2.5 mt-1 bg-neutral-900 border border-neutral-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
          </div>
          <button type="submit" disabled={isLoading} className="w-full py-3 mt-4 text-white font-medium bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Registering...' : 'Complete Registration'}
          </button>
        </form>
        <p className="text-sm text-center text-neutral-400">Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">Login here</Link></p>
      </div>
    </div>
  );
}
