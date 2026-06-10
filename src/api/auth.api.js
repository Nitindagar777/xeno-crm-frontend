import axiosInstance from './axiosInstance';

export const login = async (email, password) => {
  const response = await axiosInstance.post('/api/auth/login', { email, password });
  return response.data;
};

export const register = async (name, email, password) => {
  const response = await axiosInstance.post('/api/auth/register', { name, email, password });
  return response.data;
};

export const googleLogin = async (credential) => {
  const response = await axiosInstance.post('/api/auth/google', { credential });
  return response.data;
};

export const getMe = async () => {
  const response = await axiosInstance.get('/api/auth/me');
  return response.data;
};
