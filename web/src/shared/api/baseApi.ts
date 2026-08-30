/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL;
const contentType = import.meta.env.VITE_CONTENT_TYPE;

const headersData = {
  'Content-Type': contentType,
};

export const axiosInstance = axios.create({
  baseURL: baseUrl,
  timeout: 60000,
  headers: headersData,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (error: AxiosError) => void;
}[] = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  async (response) => {
    if (response.data.status === 401) {
      const originalRequest = response.config as AxiosRequestConfig & { _retry?: boolean };

      const passedUrl = ['/web/login'];
      if (originalRequest.url && passedUrl.includes(originalRequest.url)) return response;

      if (originalRequest._retry) return response;
    }

    return response;
  },
  (error) => {
    if (error.status === 401) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('loggedUser');
      // window.location.href = 'login';
    }

    // Here is you can change your access token, refresh token
    return Promise.reject(error);
  },
);
// );
