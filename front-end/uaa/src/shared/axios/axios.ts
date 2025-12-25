import AuthService from "@shared/auth/AuthService";
import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";

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
  (res: AxiosResponse) => {
    return res;
  },
  async (err: AxiosError) => {
    const status = err.response ? err.response.status : null;

    if (status === 401) {
      try {
        const resp = await AuthService.refresh();
        if (!resp.success) {
          return Promise.reject(resp);
        }
        return await client({
          ...err.config,
        });
      } catch (error: any) {
        return Promise.reject(error);
      }
    }

    if (status === 403 && err?.response?.data) {
      return Promise.reject(err.response.data);
    }

    return Promise.reject(err);
  },
);
