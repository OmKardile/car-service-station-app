import React, { createContext, useState, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        setUser(response.data.data.user);
        // Set default header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.tokens.accessToken}`;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        setUser(response.data.data.user);
         api.defaults.headers.common['Authorization'] = `Bearer ${response.data.data.tokens.accessToken}`;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
