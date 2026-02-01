// API Configuration
// In development: http://localhost:8001/api
// In production: https://api.100croresclub.com/api

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Admin endpoints
  admin: {
    login: `${API_BASE_URL}/admin/login`,
    signup: `${API_BASE_URL}/admin/signup`,
    dashboard: `${API_BASE_URL}/admin/dashboard`,
    users: `${API_BASE_URL}/admin/users`,
    export: `${API_BASE_URL}/admin/export`,
    sendOtp: `${API_BASE_URL}/admin/send-otp`,
    verifyOtp: `${API_BASE_URL}/admin/verify-otp`,
    changePassword: `${API_BASE_URL}/admin/change-password`,
    changeEmail: `${API_BASE_URL}/admin/change-email`,
  },
  // Media endpoints
  media: {
    upload: `${API_BASE_URL}/media/upload`,
    list: `${API_BASE_URL}/media`,
  }
};

// Helper function for API calls
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}
