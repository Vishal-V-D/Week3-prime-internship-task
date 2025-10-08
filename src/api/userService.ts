import axiosClient from "./axiosClient";

export const userService = {
  registerStudent: (data: any) => axiosClient.post("/users/register/student", data),
  registerTeacher: (data: any) => axiosClient.post("/users/register/teacher", data),
  login: (data: any) => axiosClient.post("/users/login", data),
  getMe: () => axiosClient.get("/users/me/info"),

  getStudents: (
    search?: string,
    page?: number,
    limit?: number,
    sortField?: string,
    sortOrder?: "ASC" | "DESC"
  ) => {
    let query = `?page=${page || 1}&limit=${limit || 10}`;
    if (search) query += `&search=${search}`;
    if (sortField) query += `&sortField=${sortField}`;
    if (sortOrder) query += `&sortOrder=${sortOrder}`;
    return axiosClient.get(`/users/students${query}`);
  },

  getTeachers: (
    search?: string,
    page?: number,
    limit?: number,
    sortField?: string,
    sortOrder?: "ASC" | "DESC"
  ) => {
    let query = `?page=${page || 1}&limit=${limit || 10}`;
    if (search) query += `&search=${search}`;
    if (sortField) query += `&sortField=${sortField}`;
    if (sortOrder) query += `&sortOrder=${sortOrder}`;
    return axiosClient.get(`/users/teachers${query}`);
  },

  getAnalytics: () => axiosClient.get("/users/analytics"),
  getById: (id: number) => axiosClient.get(`/users/${id}`),
  update: (id: number, data: any) => axiosClient.put(`/users/${id}`, data),
  delete: (id: number, data?: any) => axiosClient.delete(`/users/${id}`, { data }),

  logout: () => axiosClient.post("/users/logout"),
};
