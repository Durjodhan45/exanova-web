import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';

// Create base Axios instance
export const api = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Storage keys
export const TOKEN_STORAGE_KEY = 'exanova_access_token';
export const REFRESH_TOKEN_STORAGE_KEY = 'exanova_refresh_token';
export const USER_STORAGE_KEY = 'exanova_user';

// Track token refresh state to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor: Attach JWT Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: Handle 401 & token refresh
api.interceptors.response.use(
  (response) => {
    // If response contains standard backend wrapper { success: true, data: ..., meta: ... }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Avoid infinite loop on auth endpoints
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ||
        sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

      if (!refreshToken) {
        // Clear auth and redirect
        clearStoredAuth();
        window.dispatchEvent(new Event('auth:unauthorized'));
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post(`${ENV.API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const newAccessToken =
          refreshResponse.data?.data?.accessToken || refreshResponse.data?.accessToken;
        const newRefreshToken =
          refreshResponse.data?.data?.refreshToken || refreshResponse.data?.refreshToken;

        if (newAccessToken) {
          const isPersistent = !!localStorage.getItem(TOKEN_STORAGE_KEY);
          if (isPersistent) {
            localStorage.setItem(TOKEN_STORAGE_KEY, newAccessToken);
            if (newRefreshToken) localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);
          } else {
            sessionStorage.setItem(TOKEN_STORAGE_KEY, newAccessToken);
            if (newRefreshToken) sessionStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, newRefreshToken);
          }

          api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }

          processQueue(null, newAccessToken);
          return api(originalRequest);
        }
      } catch (refreshErr) {
        processQueue(refreshErr as Error, null);
        clearStoredAuth();
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(USER_STORAGE_KEY);
}

export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data) {
      if (typeof data.message === 'string') return data.message;
      if (Array.isArray(data.message)) return data.message.join(', ');
      if (data.error && typeof data.error === 'string') return data.error;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred. Please try again.';
}
