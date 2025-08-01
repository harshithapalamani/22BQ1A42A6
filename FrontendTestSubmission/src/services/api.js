import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service functions
export const urlService = {
  // Create short URL
  createShortUrl: async (data) => {
    const response = await api.post('/shorturls', data);
    return response.data;
  },

  // Get all URLs
  getAllUrls: async () => {
    const response = await api.get('/shorturls');
    return response.data;
  },

  // Get URL statistics
  getUrlStats: async (shortcode) => {
    const response = await api.get(`/shorturls/${shortcode}`);
    return response.data;
  },

  // Validate URL format
  isValidUrl: (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  },

  // Extract shortcode from full URL
  extractShortcode: (shortLink) => {
    return shortLink.split('/').pop();
  }
};

export default api;
