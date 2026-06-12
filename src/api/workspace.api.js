import axiosInstance from './axiosInstance';

export const getActivities = async (page = 1) => {
  const response = await axiosInstance.get(`/api/workspace?page=${page}`);
  return response.data;
};

export const getWorkspaceSummary = async () => {
  const response = await axiosInstance.get('/api/workspace/summary');
  return response.data;
};

export const getWorkspaces = async () => {
  const response = await axiosInstance.get('/api/workspace/list');
  return response.data;
};

export const createWorkspace = async (data) => {
  const response = await axiosInstance.post('/api/workspace', data);
  return response.data;
};
