import axios from 'axios';

const getApiUrl = () => {
  let url = import.meta.env.VITE_API_URL || '';
  
  if (typeof window !== 'undefined' && window.location) {
    const { hostname, protocol } = window.location;
    const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
    
    // If we are in production (not localhost) but the configured URL points to localhost (or is blank),
    // override it to use the dynamic production api subdomain.
    const isUrlLocalhost = url.includes('localhost') || url.includes('127.0.0.1');
    
    if (!isLocalhost && (isUrlLocalhost || !url)) {
      if (hostname.startsWith('frontend.')) {
        url = `${protocol}//${hostname.replace('frontend.', 'api.')}`;
      } else {
        url = `${protocol}//api.${hostname}`;
      }
    } else if (isLocalhost && !url) {
      url = `${protocol}//${hostname}:5000`;
    }
  }
  return url;
};

const apiURL = getApiUrl();

const axiosInstance = axios.create({
  baseURL: apiURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('xeno_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const workspaceId = localStorage.getItem('xeno_workspace_id');
    if (workspaceId) {
      config.headers['x-workspace-id'] = workspaceId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 Unauthorized
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request detected (401). Redirecting to login...');
      // Clear credentials
      localStorage.removeItem('xeno_token');
      localStorage.removeItem('xeno_user');
      localStorage.removeItem('xeno_workspace_id');
      localStorage.removeItem('xeno_workspace_name');
      
      // Redirect using window object for absolute route breakout
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
