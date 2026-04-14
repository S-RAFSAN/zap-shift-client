import { useEffect, useRef } from "react";
import axios from "axios";
import useAuth from "./useAuth";

const apiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === "development"
    ? "https://zap-shift-server-taupe-six.vercel.app"
    : "https://zap-shift-server-taupe-six.vercel.app");

const axiosSecure = axios.create({
  baseURL: apiUrl,
  headers: { "Content-Type": "application/json" },
});

const useAxiosSecure = () => {
  const { logOut } = useAuth();
  const logOutRef = useRef(logOut);
  logOutRef.current = logOut;

  useEffect(() => {
    const requestInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    const responseInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      async (error) => {
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          try {
            await logOutRef.current();
          } catch (_) {}
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosSecure.interceptors.request.eject(requestInterceptor);
      axiosSecure.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  return axiosSecure;
};

export default useAxiosSecure;
