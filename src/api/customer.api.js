import axiosInstance from './axiosInstance';

export const getCustomers = async (params = {}) => {
  const response = await axiosInstance.get('/api/customers', { params });
  return response.data;
};

export const getCustomer = async (id) => {
  const response = await axiosInstance.get(`/api/customers/${id}`);
  return response.data;
};

export const createCustomer = async (data) => {
  const response = await axiosInstance.post('/api/customers', data);
  return response.data;
};

export const updateCustomer = async (id, data) => {
  const response = await axiosInstance.put(`/api/customers/${id}`, data);
  return response.data;
};

export const deleteCustomer = async (id) => {
  const response = await axiosInstance.delete(`/api/customers/${id}`);
  return response.data;
};

export const importCSV = async (file, mapping = null) => {
  const formData = new FormData();
  if (mapping) {
    formData.append('mapping', JSON.stringify(mapping));
  }
  formData.append('file', file);
  const response = await axiosInstance.post('/api/customers/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const importPreview = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await axiosInstance.post('/api/customers/import-preview', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getCustomerMetadata = async () => {
  const response = await axiosInstance.get('/api/customers/metadata');
  return response.data;
};
