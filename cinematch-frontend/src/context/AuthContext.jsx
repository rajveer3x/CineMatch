import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { setAuthToken, setLogoutCallback } from '../utils/api';

const AuthContext = createContext(null);
const AUTH_STORAGE_KEY = 'cinematch-auth';

const getStoredAuth = () => {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    return storedAuth ? JSON.parse(storedAuth) : null;
  } catch (error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [storedAuth] = useState(getStoredAuth);
  const [user, setUser] = useState(storedAuth?.user ?? null);
  const [token, setTokenState] = useState(storedAuth?.token ?? null);
  const navigate = useNavigate();

  const logout = useCallback(() => {
    setUser(null);
    setTokenState(null);
    setAuthToken(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    setLogoutCallback(logout);
  }, [logout]);

  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
      return;
    }

    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [token, user]);

  const login = (newToken, userData) => {
    setTokenState(newToken);
    setUser(userData);
    setAuthToken(newToken);
  };

  const updateUser = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
