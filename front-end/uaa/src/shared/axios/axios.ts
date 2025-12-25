import AuthService from "@shared/auth/AuthService";
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

let isRefreshing = false;
let failedQueue: {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(true);
  });
  failedQueue = [];
};

export const client = (() => {
  return axios.create({
    baseURL: import.meta.env.VITE_BASEURL,
    headers: {
      Accept: "application/json, text/plain, */*",
    },
    withCredentials: true, // bật cái này nếu ở backend có bật cờ Access-Control-Allow-Credentials: true
  });
})();

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

client.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    const status = error.response?.status;

    if (originalRequest?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: () => resolve(client(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const resp = await AuthService.refresh();

        if (!resp?.success) {
          throw new Error("Refresh token failed");
        }

        processQueue(null);
        return client(originalRequest);
      } catch (err) {
        processQueue(err);
        // await AuthService.logout?.();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    if (status === 403 && error.response?.data) {
      return Promise.reject(error.response.data);
    }

    return Promise.reject(error);
  },
);
