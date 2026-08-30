/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const baseUrl = import.meta.env.VITE_BASE_URL;

const headersFormData = {
  'Content-Type': 'multipart/form-data',
};

export const axiosFormInstance = axios.create({
  baseURL: baseUrl,
  timeout: 60000,
  headers: headersFormData,
});

axiosFormInstance.interceptors.request.use(
  (config) => {
    config.withCredentials = true;
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

axiosFormInstance.interceptors.response.use(
  async (response) => {
    if (response.data.status === 401) {
      const originalRequest = response.config as AxiosRequestConfig & { _retry?: boolean };
      const passedUrl = ['/web/login'];
      if (originalRequest.url && passedUrl.includes(originalRequest.url)) return response;

      if (originalRequest._retry) return response;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return axiosFormInstance(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${baseUrl}/web/refresh/token`,
          {},
          {
            withCredentials: true,
          },
        );

        if (refreshResponse.data.status === 200) {
          const newAccessToken = refreshResponse.data.token;
          localStorage.setItem('accessToken', newAccessToken);
          axiosFormInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return await axiosFormInstance(originalRequest);
        }

        processQueue(refreshResponse.data.message, null);
        window.location.href = '/404';

        return await Promise.reject(refreshResponse.data.message);
      } catch (err: any) {
        /* empty */
      } finally {
        isRefreshing = false;
      }
    }

    return response;
  },
  (error) => {
    // Here is you can change your access token, refresh token
    console.log('axiosFormInstance error : ' + error);
    return Promise.reject(error);
  },
);
