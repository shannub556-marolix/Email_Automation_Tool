import axios from 'axios';
import { toast } from 'react-hot-toast';
import { config } from '../config/env';

// Create axios instance
const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  login: async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const smtpAPI = {
  validate: async (smtpEmail, smtpPassword) => {
    const response = await api.post('/smtp/validate', {
      smtp_email: smtpEmail,
      smtp_password: smtpPassword,
    });
    return response.data;
  },
};

export const emailAPI = {
  uploadFile: async (file, smtpConfig) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('smtp_email', smtpConfig.smtpEmail);
    formData.append('smtp_password', smtpConfig.smtpPassword);
    formData.append('subject', smtpConfig.subject);
    formData.append('body', smtpConfig.body);

    const response = await api.post('/upload-excel', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getEmailStatus: async (batchId) => {
    let url = '/emails/status';
    if (batchId) {
      url += `?batch_id=${batchId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  getLogs: async (page = 1, search = '') => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    if (search) params.append('search', search);

    const response = await api.get(`/emails/logs?${params}`);
    return response.data;
  },

  deleteEmails: async (ids) => {
    const response = await api.delete('/emails', { data: ids });
    return response.data;
  },

  clearAll: async () => {
    const response = await api.delete('/emails/clear');
    return response.data;
  },
};

export default api;
