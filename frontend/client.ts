import axios from 'axios';

// Use environment variables to manage the API URL.
// For Expo Go, you MUST use your machine's IP address, not localhost
// The .env file should contain: EXPO_PUBLIC_API_URL=http://YOUR_IP:3000/api

// Get the API URL - Expo automatically loads EXPO_PUBLIC_* variables from .env
// Default fallback uses your current IP for mobile devices
// TEMPORARY: Hardcoded for Expo Go testing (will use env var if available)
const API_BASE_URL = 'http://192.168.29.15:3000/api';

// Debug log to help troubleshoot
if (__DEV__) {
  console.log('🌐 API Base URL:', API_BASE_URL);
  console.log('📱 Environment:', process.env.EXPO_PUBLIC_API_URL ? 'From .env' : 'Using fallback IP');
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 second timeout for mobile networks
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    if (__DEV__) {
      console.log('📤 API Request:', config.method?.toUpperCase(), config.url);
    }
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('✅ API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (__DEV__) {
      console.error('❌ API Error:', error.response?.status, error.response?.data?.message || error.message);
      console.error('🔗 Failed URL:', error.config?.baseURL + error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default apiClient;