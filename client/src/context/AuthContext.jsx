import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('spendflow_token'));
  const [loading, setLoading] = useState(true);

  // Initialize user profile on load if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('spendflow_token');
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
        localStorage.removeItem('spendflow_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res.data.success) {
      const { token: receivedToken, ...userData } = res.data.data;
      localStorage.setItem('spendflow_token', receivedToken);
      setToken(receivedToken);
      setUser(userData);
      return res.data;
    }
  };

  const loginAsDemo = async () => {
    return await login('demo@financetracker.com', 'demo123');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res.data.success) {
      const { token: receivedToken, ...data } = res.data.data;
      localStorage.setItem('spendflow_token', receivedToken);
      setToken(receivedToken);
      setUser(data);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('spendflow_token');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await authService.updateProfile(data);
    if (res.data.success) {
      setUser(res.data.data);
      return res.data;
    }
  };

  const seedDemoData = async () => {
    return await authService.seedDemoData();
  };

  const clearUserData = async () => {
    return await authService.clearData();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        loginAsDemo,
        register,
        logout,
        updateProfile,
        seedDemoData,
        clearUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
