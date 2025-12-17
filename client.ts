import axios from 'axios';

// Use environment variables to manage the API URL.
// Create a .env file in your project root and add:
// EXPO_PUBLIC_API_URL='http://<YOUR_LOCAL_IP_ADDRESS>:3000/api'
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;