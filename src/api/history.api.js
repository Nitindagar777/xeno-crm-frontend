import axiosInstance from './axiosInstance';

export const getMessageHistory = async (params = {}) => {
  const response = await axiosInstance.get('/api/history/messages', { params });
  return response.data;
};
