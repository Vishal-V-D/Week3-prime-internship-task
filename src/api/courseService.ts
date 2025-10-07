import axiosCourseClient from "./axiosCourseClient";

export const courseService = {

  getCourses: (search?: string, page?: number, limit?: number) => {
    let query = `?page=${page || 1}&limit=${limit || 10}`;
    if (search) query += `&search=${search}`;
    return axiosCourseClient.get(`/courses${query}`);
  },
   getAnalytics: (apiKey: string) =>
    axiosCourseClient.get(`/analytics?apiKey=${apiKey}`),

  getCourseById: (id: number) => axiosCourseClient.get(`/courses/${id}`),
  createCourse: (data: any) => axiosCourseClient.post("/courses", data),
  updateCourse: (id: number, data: any) => axiosCourseClient.put(`/courses/${id}`, data),
  deleteCourse: (id: number) => axiosCourseClient.delete(`/courses/${id}`),

  
  getEnrollments: () => axiosCourseClient.get("/enrollments"), 
  getEnrollmentById: (id: number) => axiosCourseClient.get(`/enrollments/${id}`), 
createEnrollment: (courseId: number) =>
  axiosCourseClient.post("/enrollments", { courseId }),

getMyEnrollments: () => axiosCourseClient.get("/enrollments/my"),

  updateEnrollment: (id: number, data: any) => axiosCourseClient.put(`/enrollments/${id}`, data), 
  deleteEnrollment: (id: number) => axiosCourseClient.delete(`/enrollments/${id}`),
};
