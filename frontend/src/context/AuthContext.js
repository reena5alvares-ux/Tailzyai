import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('tailzyai_token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('tailzyai_user') || 'null'));

  useEffect(() => {
    if (token) {
      localStorage.setItem('tailzyai_token', token);
    } else {
      localStorage.removeItem('tailzyai_token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('tailzyai_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('tailzyai_user');
    }
  }, [user]);

  const login = (token, user) => {
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};