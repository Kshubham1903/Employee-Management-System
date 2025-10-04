// frontend/src/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  axios.defaults.withCredentials = true; 

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('/check-auth');
        if (res.data.isAuthenticated) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    const destination = userData.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard';
    navigate(destination);
  };

  const login = async (username, password) => {
    const res = await axios.post('/login', { username, password });
    handleAuthSuccess(res.data.user);
  };

  const register = async (userData) => {
    const res = await axios.post('/register', userData);
    handleAuthSuccess(res.data.user);
  };

  const logout = async () => {
    await axios.post('/logout');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);