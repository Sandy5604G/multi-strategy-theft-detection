import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = api.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const res = await api.login(username, password);
    if (res && res.user) {
      setUser(res.user);
      return res.user;
    }
    throw new Error('Invalid credentials');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('aegis_jwt_token');
    localStorage.removeItem('aegis_user');
    setUser(null);
  };

  // Helper function to allow easy testing of RBAC roles in UI
  const switchRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    localStorage.setItem('aegis_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, switchRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
