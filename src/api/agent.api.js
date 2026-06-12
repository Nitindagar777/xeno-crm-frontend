import axiosInstance from './axiosInstance';

export const sendMessage = async (message, agentContext) => {
  const response = await axiosInstance.post('/api/agent/message', { message, agentContext });
  return response.data;
};

export const approveStep = async (step, agentContext, editedData) => {
  const response = await axiosInstance.post('/api/agent/approve', { step, agentContext, editedData });
  return response.data;
};

export const getSuggestions = async (refresh = false) => {
  const response = await axiosInstance.get(`/api/agent/suggestions${refresh ? '?refresh=true' : ''}`);
  return response.data;
};

export const getInsights = async (refresh = false) => {
  const response = await axiosInstance.get(`/api/agent/insights${refresh ? '?refresh=true' : ''}`);
  return response.data;
};
