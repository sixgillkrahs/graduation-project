import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

export const fetchAI = (() => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASEURLAI!,
    headers: {
      Accept: "application/json, text/plain, */*",
    },
    // withCredentials: true, // bật cái này nếu ở backend có bật cờ Access-Control-Allow-Credentials: true
  });
})();

fetchAI.interceptors.request.use(
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

fetchAI.interceptors.response.use(
  (res: AxiosResponse) => {
    return res.data;
  },
  async (err: AxiosError) => {
    const status = err.response ? err.response.status : null;

    if (status === 401) {
      try {
        // const refreshTokenFromStorage = localStorage.getItem(STORAGE_TOKEN.REFRESH_TOKEN);
        // const { accessToken, refreshToken } = await AuthService.refresh(refreshTokenFromStorage);
        // LocalStorageService.setTokens(accessToken, refreshToken);
        // client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        // return await client(originalConfig);
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
