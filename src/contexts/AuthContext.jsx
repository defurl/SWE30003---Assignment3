import React, { useState, createContext } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (username, password) => {
    const response = await apiClient.login(username, password);
    if (response.success) {
      setUser(response.user);
      if (response.user.role === 'customer') {
        navigate('/profile');
      } else {
        navigate('/dashboard');
      }
    }
    return response;
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
    navigate('/');
  };

  const value = { user, isAuthenticated: !!user, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
