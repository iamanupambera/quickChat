import axios from "axios";
import { getToken } from "../store/localStorage";

export const axiosInstance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
