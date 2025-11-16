import axios from 'axios';


const apiClient = axios.create({
 
  baseURL: '/api'
});


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// White-Label Instance Management APIs
export const whiteLabelAPI = {
  // Initialize white-label system
  initialize: () => apiClient.post('/whitelabel/initialize'),
  
  // List all instances
  listInstances: () => apiClient.get('/whitelabel/list'),
  
  // Get instance details
  getInstance: (instanceId) => apiClient.get(`/whitelabel/${instanceId}`),
  
  // Create new instance
  createInstance: (data) => apiClient.post('/whitelabel/create', data),
  
  // Start instance
  startInstance: (instanceId) => apiClient.put(`/whitelabel/${instanceId}/start`),
  
  // Stop instance
  stopInstance: (instanceId) => apiClient.put(`/whitelabel/${instanceId}/stop`),
  
  // Restart instance
  restartInstance: (instanceId) => apiClient.put(`/whitelabel/${instanceId}/restart`),
  
  // Delete instance
  deleteInstance: (instanceId) => apiClient.delete(`/whitelabel/${instanceId}`),
  
  // Get instance stats
  getInstanceStats: (instanceId) => apiClient.get(`/whitelabel/${instanceId}/stats`),
};

export default apiClient;