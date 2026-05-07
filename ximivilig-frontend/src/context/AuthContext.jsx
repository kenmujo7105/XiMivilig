import React, { createContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user info is stored
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axiosClient.post('/auth/login', { username, password });
      if (response.success) {
        const { accessToken, userId, username: resUsername, email, role } = response.data;
        const userInfo = { userId, username: resUsername, email, role };
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        setUser(userInfo);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error("Login failed:", error);
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const response = await axiosClient.post('/auth/register', userData);
      if (response.success) {
        const { accessToken, userId, username: resUsername, email, role } = response.data;
        const userInfo = { userId, username: resUsername, email, role };
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        setUser(userInfo);
        setIsAuthenticated(true);
        return true;
      }
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(error.response?.data?.message || "Registration failed");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
