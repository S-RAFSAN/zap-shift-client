import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://zap-shift-server-taupe-six.vercel.app",
});

const useAxios = () => {
  return axiosInstance;
};

export default useAxios;
