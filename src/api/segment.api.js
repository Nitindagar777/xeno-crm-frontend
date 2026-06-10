import axiosInstance from './axiosInstance';

export const getSegments = async () => {
  const response = await axiosInstance.get('/api/segments');
  return response.data;
};

export const getSegment = async (id) => {
  const response = await axiosInstance.get(`/api/segments/${id}`);
  return response.data;
};

export const createSegment = async (data) => {
  const response = await axiosInstance.post('/api/segments', data);
  return response.data;
};

export const updateSegment = async (id, data) => {
  const response = await axiosInstance.put(`/api/segments/${id}`, data);
  return response.data;
};

export const deleteSegment = async (id) => {
  const response = await axiosInstance.delete(`/api/segments/${id}`);
  return response.data;
};

export const refreshSegment = async (id) => {
  const response = await axiosInstance.post(`/api/segments/${id}/refresh`);
  return response.data;
};

export const previewSegment = async (rules) => {
  const response = await axiosInstance.post('/api/segments/preview', { rules });
  return response.data;
};
