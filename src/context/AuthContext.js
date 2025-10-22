import React, { createContext, useContext, useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../config/constants';
import { getLocalStorage, setLocalStorage, removeLocalStorage, handleApiError } from '../utils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const token = getLocalStorage(STORAGE_KEYS.auth.token);
      const userData = getLocalStorage(STORAGE_KEYS.auth.user);
      
      if (token && userData) {
        setIsAuthenticated(true);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading auth data:', handleApiError(error));
      // Clear potentially corrupted data
      removeLocalStorage(STORAGE_KEYS.auth.token);
      removeLocalStorage(STORAGE_KEYS.auth.user);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    try {
      setIsAuthenticated(true);
      setUser(userData);
      setLocalStorage(STORAGE_KEYS.auth.token, token);
      setLocalStorage(STORAGE_KEYS.auth.user, userData);
    } catch (error) {
      console.error('Error saving auth data:', handleApiError(error));
      throw error;
    }
  };

  const logout = () => {
    try {
      setIsAuthenticated(false);
      setUser(null);
      removeLocalStorage(STORAGE_KEYS.auth.token);
      removeLocalStorage(STORAGE_KEYS.auth.user);
    } catch (error) {
      console.error('Error during logout:', handleApiError(error));
      // Still perform logout even if storage cleanup fails
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    try {
      setUser(userData);
      setLocalStorage(STORAGE_KEYS.auth.user, userData);
    } catch (error) {
      console.error('Error updating user data:', handleApiError(error));
      throw error;
    }
  };

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 