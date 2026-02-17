import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.post('/auth/update-profile', data)
};

// Task API
export const taskAPI = {
  getTasks: (date) => api.get('/tasks/list', { params: { date } }),
  createTask: (taskData) => api.post('/tasks/create', taskData),
  completeTask: (taskId, updateData) => api.post(`/tasks/complete?taskId=${taskId}`, updateData),
  getStats: (startDate, endDate) => api.get('/tasks/stats', { params: { startDate, endDate } })
};

// Garden API
export const gardenAPI = {
  getGarden: () => api.get('/garden/state')
};

// Doctor API
export const doctorAPI = {
  getPatients: () => api.get('/doctor/patients'),
  getPatientDetail: (id) => api.get(`/doctor/patients/${id}`),
  assignTask: (patientId, taskData) => api.post(`/doctor/patients/${patientId}/tasks`, taskData),
  sendMessage: (patientId, message) => api.post(`/doctor/patients/${patientId}/message`, { content: message }),
  createPatient: (patientData) => api.post('/doctor/patients', patientData),
  createPatient: (patientData) => api.post('/doctor/patients', patientData),
  generateMessage: (data) => api.post('/doctor/generate-message', data),
  dismissAlert: (moodCheckId) => api.post('/doctor/dismiss-alert', { moodCheckId })
};

// Messages API
export const messageAPI = {
  getMessages: () => api.get('/messages/list'),
  getConversation: (userId) => api.get('/messages/list', { params: { userId } }),
  sendMessage: (toId, content) => api.post('/messages/send', { toId, content }),
  markAsRead: (messageId) => api.post('/messages/mark-read', { messageId })
};

// Mood API
export const moodAPI = {
  submitMood: (data) => api.post('/mood/submit', data),
  getHistory: (days = 30) => api.get('/mood/history', { params: { days } })
};

export default api;
