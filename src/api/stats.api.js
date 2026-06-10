import axiosInstance from './axiosInstance';

export const getOverview = async () => {
  const response = await axiosInstance.get('/api/stats/overview');
  return response.data;
};
