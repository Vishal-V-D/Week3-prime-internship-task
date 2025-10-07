import axios from "axios";


const axiosClient = axios.create({
  baseURL: "http://localhost:5000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});


axiosClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (res) => {
    console.log(`✅ Response: ${res.config.url}`, res.status);
    return res;
  },
  (err) => {
    console.log(`❌ Error: ${err.config?.url}`, err.response?.status);
    
 
    return Promise.reject(err);
  }
);

export default axiosClient;