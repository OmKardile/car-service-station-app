import axios from 'axios';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator, localhost for iOS Simulator
// If running on a real device, replace with your machine's IP address (e.g., 192.168.1.x)
const BASE_URL = 'http://192.168.1.51:5000/api';
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to debug errors
api.interceptors.request.use(request => {
  console.log('Starting Request', request.url);
  return request;
});

api.interceptors.response.use(response => {
  return response;
}, error => {
  console.log('Response Error:', error);
  if (error.response) {
      console.log('Data:', error.response.data);
      console.log('Status:', error.response.status);
  } else if (error.request) {
      console.log('Request:', error.request);
  } else {
      console.log('Error Message:', error.message);
  }
  return Promise.reject(error);
});

export default api;
