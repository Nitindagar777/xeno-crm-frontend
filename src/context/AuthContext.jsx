import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe, login as apiLogin, register as apiRegister, googleLogin as apiGoogleLogin } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('xeno_token'));
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const bootstrapAuth = async () => {
      if (token) {
        try {
          const res = await getMe();
          if (res.success) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (err) {
          console.error('[Auth Bootstrap Error]:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    bootstrapAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await apiLogin(email, password);
    if (res.success) {
      localStorage.setItem('xeno_token', res.data.token);
      localStorage.setItem('xeno_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    }
    return res;
  };

  const register = async (name, email, password) => {
    const res = await apiRegister(name, email, password);
    if (res.success) {
      localStorage.setItem('xeno_token', res.data.token);
      localStorage.setItem('xeno_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    }
    return res;
  };

  const loginWithGoogle = async (credential) => {
    const res = await apiGoogleLogin(credential);
    if (res.success) {
      localStorage.setItem('xeno_token', res.data.token);
      localStorage.setItem('xeno_user', JSON.stringify(res.data.user));
      setToken(res.data.token);
      setUser(res.data.user);
      navigate('/dashboard');
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('xeno_token');
    localStorage.removeItem('xeno_user');
    setToken(null);
    setUser(null);
    navigate('/login');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    loginWithGoogle,
    logout,
    isAuthenticated: !!token
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
