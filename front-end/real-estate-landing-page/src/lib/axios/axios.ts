import { ErrorCode } from "@/const/error-code";
import AuthService from "@/shared/auth/AuthService";
import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

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
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      Accept: "application/json, text/plain, */*",
    },
    withCredentials: true, // bật cái này nếu ở backend có bật cờ Access-Control-Allow-Credentials: true
  });
})();

client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // const accessToken = localStorage.getItem(STORAGE_TOKEN.ACCESS_TOKEN);
    // if (accessToken) {
    //   config.headers.Authorization = `Bearer ${accessToken}`;
    // }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

client.interceptors.response.use(
  (res: AxiosResponse) => res,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;
    const status = error.response?.status;
    const errorCode = (error.response?.data as any)?.code;
    if (originalRequest?.url?.includes("/auth/refresh")) {
      return Promise.reject(error);
    }
    if (
      status === 401 &&
      (errorCode === ErrorCode.UNAUTHORIZED ||
        errorCode === ErrorCode.TOKEN_EXPIRED) &&
      !originalRequest._retry
    ) {
      if (
        errorCode === ErrorCode.UNAUTHORIZED &&
        typeof window !== "undefined" &&
        localStorage.getItem("isLoggedIn") !== "true"
      ) {
        return Promise.reject(error);
      }
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
        await AuthService.logout();
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
