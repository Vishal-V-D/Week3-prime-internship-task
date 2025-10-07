import axios from "axios";

const axiosCourseClient = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

axiosCourseClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 [CourseService] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosCourseClient.interceptors.response.use(
  (res) => {
    console.log(`✅ [CourseService] ${res.config.url}`, res.status);
    return res;
  },
  (err) => {
    console.log(`❌ [CourseService] ${err.config?.url}`, err.response?.status);
    return Promise.reject(err);
  }
);

export default axiosCourseClient;
