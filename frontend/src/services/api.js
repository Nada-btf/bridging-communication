import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

// Create a separate instance for file uploads (no timeout)
const uploadApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 0
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

uploadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 unauthorized responses globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('bridge_user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userType');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

uploadApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('bridge_user');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userType');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ========== AUTH API ==========
export const authAPI = {
  login:    (email, password) => api.post('/auth/login', { email, password }),
  register: (userData)        => api.post('/auth/register', userData),
};

// ========== HISTORY API ==========
export const historyAPI = {
  /**
   * Fetch history with optional server-side filters.
   * @param {Object} filters - { direction, dateRange, favorite }
   *   direction : 'sign-to-speech' | 'speech-to-sign' | 'all'
   *   dateRange : '7days' | '30days' | 'all'
   *   favorite  : true | undefined
   */
  getAll: (filters = {}) => {
    const params = {};
    if (filters.direction && filters.direction !== 'all') params.direction = filters.direction;
    if (filters.dateRange && filters.dateRange !== 'all')  params.dateRange = filters.dateRange;
    if (filters.favorite === true)                         params.favorite  = 'true';
    return api.get('/history', { params });
  },
  delete:         (id)             => api.delete(`/history/${id}`),
  toggleFavorite: (id, favorite)   => api.put(`/history/${id}/favorite`, { favorite }),
  add:            (item)           => api.post('/history', item),
};

// ========== TRANSLATION API ==========
export const translationAPI = {
  signToSpeechLive: (frameData, language = 'ASL') =>
    api.post('/sign-to-speech/live', { frame: frameData, language }),

  signToSpeechUpload: (videoFile, onProgress) => {
    const formData = new FormData();
    formData.append('video', videoFile);
    return uploadApi.post('/sign-to-speech/upload', formData, {
      onUploadProgress: onProgress,
    });
  },

  speechToSignLive: (audioBlob, language = 'en') => {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('language', language);
    return api.post('/speech-to-sign/live', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  speechToSignUpload: (audioFile, onProgress) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    return uploadApi.post('/speech-to-sign/upload', formData, {
      onUploadProgress: onProgress,
    });
  },
};

// ========== ADMIN API ==========
export const adminAPI = {
  getStats:          ()              => api.get('/admin/stats'),
  getSigns:          ()              => api.get('/admin/signs'),
  addSign:           (data)          => api.post('/admin/signs', data),
  updateSign:        (id, data)      => api.put(`/admin/signs/${id}`, data),
  deleteSign:        (id)            => api.delete(`/admin/signs/${id}`),
  getRecentActivity: ()              => api.get('/admin/recent-activity'),
  getUsers:          ()              => api.get('/admin/users'),
  blockUser:         (userId, block) => api.put(`/admin/users/${userId}/block`, { block }),
  // New endpoints
  getAnalytics:      ()              => api.get('/admin/analytics'),
  getLogs:           ()              => api.get('/admin/logs'),

};

// ========== NOTIFICATIONS API ==========
export const notificationsAPI = {
  get:        ()   => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
};

// ========== TEST API ==========
export const testAPI = {
  test: () => api.get('/test'),
};

export default api;