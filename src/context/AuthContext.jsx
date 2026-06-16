import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Sync token with local storage and axios headers
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      // Verify user validity on mount if we have a token
      api.get('/user')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          // Token is invalid or expired
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      const { token: receivedToken, user: receivedUser } = response.data;
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, password_confirmation, role) => {
    setLoading(true);
    try {
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation,
        role
      });
      // The register endpoint might log us in automatically or we need to login
      // Standard Sanctum endpoint structure typically returns token & user on success
      if (response.data.token) {
        const { token: receivedToken, user: receivedUser } = response.data;
        setToken(receivedToken);
        setUser(receivedUser);
        return receivedUser;
      }
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/logout');
      }
    } catch (e) {
      console.warn("Error logging out from server, clearing local state anyway", e);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
      return response.data;
    } catch (error) {
      console.error("Could not refresh user status", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
