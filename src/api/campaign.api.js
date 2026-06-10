import axiosInstance from './axiosInstance';

export const getCampaigns = async (params = {}) => {
  const response = await axiosInstance.get('/api/campaigns', { params });
  return response.data;
};

export const getCampaign = async (id) => {
  const response = await axiosInstance.get(`/api/campaigns/${id}`);
  return response.data;
};

export const createCampaign = async (data) => {
  const response = await axiosInstance.post('/api/campaigns', data);
  return response.data;
};

export const sendCampaign = async (id, data = {}) => {
  const response = await axiosInstance.post(`/api/campaigns/${id}/send`, data);
  return response.data;
};

export const getCampaignStats = async (id) => {
  const response = await axiosInstance.get(`/api/campaigns/${id}/stats`);
  return response.data;
};

export const getCampaignLogs = async (id, params = {}) => {
  const response = await axiosInstance.get(`/api/campaigns/${id}/logs`, { params });
  return response.data;
};

export const getCampaignAnalysis = async (id) => {
  const response = await axiosInstance.get(`/api/campaigns/${id}/analysis`);
  return response.data;
};
