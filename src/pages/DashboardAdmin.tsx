import React ,{ useContext, useEffect, useState, useMemo, useCallback,type InputHTMLAttributes } from "react";
import { useForm, type SubmitHandler, type UseFormRegister } from "react-hook-form"; 

import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { FaPlus, FaEdit, FaTrash, FaUserGraduate, FaChalkboardTeacher, FaBookOpen, FaChartPie, FaBars, FaTachometerAlt, FaBoxes, FaTimes } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { IconType } from 'react-icons'; 

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import Sidebar from "../components/Sidebar"; 
import { AuthContext } from "../context/AuthContext";
import { userService } from "../api/userService"; 
import { courseService } from "../api/courseService"; 
import GenericTable from "../components/tables/GenericTable";
import type { Column } from "../components/tables/GenericTable";
import { ModalWrapper } from "../components/Modal";


type DashboardView = 'analytics' | 'manage_teachers' | 'manage_students';

interface NavItem {
    section: DashboardView;
    label: string;
    Icon: IconType;
}

const adminNavItems: NavItem[] = [
    { section: 'analytics', label: 'Dashboard', Icon: FaTachometerAlt },
    { section: 'manage_teachers', label: 'Teachers', Icon: FaChalkboardTeacher },
    { section: 'manage_students', label: 'Students', Icon: FaUserGraduate },
];

interface Teacher {
  id: number;
  name: string;
  email: string;
  specialization?: string;
  createdAt?: string;
}

interface Student {
  id: number;
  name: string;
  email: string;
  role?: string;
  createdAt?: string;
}

type SortOrder = 'ASC' | 'DESC';


interface UserFormBase {
  name: string;
  email: string;
  password?: string;
  specialization?: string;
}

interface StudentCreateFormValues extends Omit<UserFormBase, 'specialization'> {
  password: string; 
}


interface StudentEditFormValues extends Omit<UserFormBase, 'specialization'> {
  password?: string;
}


interface TeacherCreateFormValues extends UserFormBase {
  password: string; 
}


interface TeacherEditFormValues extends UserFormBase {}


interface CourseAnalytics {
  totalCourses: number;
  totalEnrollments: number;
  enrollmentsByCourse: { courseTitle: string; count: string | number }[];
  enrollmentsByCategory: { category: string; count: string | number }[];
}


const studentSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
}) as yup.ObjectSchema<StudentCreateFormValues>;

const studentEditSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),

  password: yup.string()
    .transform(value => value === '' ? undefined : value)
    .min(6, "Password must be at least 6 characters")
    .nullable()
    .optional(),
}) as yup.ObjectSchema<StudentEditFormValues>;

const teacherCreateSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  specialization: yup.string().optional(),
}) as yup.ObjectSchema<TeacherCreateFormValues>;

const teacherEditSchema = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string()
    .transform(value => value === '' ? undefined : value)
    .min(6, "Password must be at least 6 characters")
    .nullable()
    .optional(),
  specialization: yup.string().optional(),
}) as yup.ObjectSchema<TeacherEditFormValues>;



export default function DashboardAdmin() {
  const { user } = useContext(AuthContext)!;
  const API_KEY = "validKey123"; 

  const [activeView, setActiveView] = useState<DashboardView>('analytics');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const [analytics, setAnalytics] = useState<{ totalStudents: number; totalTeachers: number } | null>(null);
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics | null>(null);
  const [recentStudents, setRecentStudents] = useState<Student[]>([]);
  const [recentTeachers, setRecentTeachers] = useState<Teacher[]>([]);

  const [isCreatingStudent, setIsCreatingStudent] = useState(false);
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
  const [isEditingTeacher, setIsEditingTeacher] = useState(false);
  const [isEditingStudent, setIsEditingStudent] = useState(false); 
  const [currentTeacher, setCurrentTeacher] = useState<Teacher | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null); 

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherLimit] = useState(10);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [teacherSortField, setTeacherSortField] = useState<string>("name");
  const [teacherSortOrder, setTeacherSortOrder] = useState<SortOrder>("ASC");
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(false);

  const [students, setStudents] = useState<Student[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentPage, setStudentPage] = useState(1);
  const [studentLimit] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [studentSortField, setStudentSortField] = useState<string>("name");
  const [studentSortOrder, setStudentSortOrder] = useState<SortOrder>("ASC");
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const [error, setError] = useState<string | null>(null);


  const { register: registerStudentForm, handleSubmit: handleSubmitStudent, reset: resetStudentForm, formState: { errors: studentErrors },} = useForm<StudentCreateFormValues>({ resolver: yupResolver(studentSchema), mode: 'onSubmit', });
  const { register: registerEditStudentForm, handleSubmit: handleSubmitEditStudent, reset: resetEditStudentForm, setValue: setEditStudentValue, formState: { errors: editStudentErrors },} = useForm<StudentEditFormValues>({ resolver: yupResolver(studentEditSchema), mode: 'onSubmit', });
  const { register: registerTeacherForm, handleSubmit: handleSubmitTeacher, reset: resetTeacherForm, formState: { errors: teacherErrors },} = useForm<TeacherCreateFormValues>({ resolver: yupResolver(teacherCreateSchema), mode: 'onSubmit', });
  const { register: registerEditTeacherForm, handleSubmit: handleSubmitEditTeacher, reset: resetEditTeacherForm, setValue: setEditTeacherValue, formState: { errors: editTeacherErrors },} = useForm<TeacherEditFormValues>({ resolver: yupResolver(teacherEditSchema), mode: 'onSubmit', });


  const fetchAnalytics = async () => {
    try {
      const res = await userService.getAnalytics();
      setAnalytics(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch user analytics.");
    }
  };

  const fetchCourseAnalytics = async () => {
    try {
      const res = await courseService.getAnalytics(API_KEY);
      const formattedData: CourseAnalytics = {
        ...res.data,
        enrollmentsByCourse: res.data.enrollmentsByCourse.map((d: any) => ({
          ...d,
          count: Number(d.count),
        })),
        enrollmentsByCategory: res.data.enrollmentsByCategory.map((d: any) => ({
          ...d,
          count: Number(d.count),
        })),
      };
      setCourseAnalytics(formattedData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch course analytics.");
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const studentsRes = await userService.getStudents(undefined, 1, 5, "createdAt", "DESC");
      const teachersRes = await userService.getTeachers(undefined, 1, 5, "createdAt", "DESC");
      
      const studentsData = studentsRes.data?.users || Array.isArray(studentsRes.data) ? studentsRes.data : [];
      setRecentStudents(Array.isArray(studentsData) ? studentsData : studentsData.users || []);

      const teachersData = teachersRes.data?.users || Array.isArray(teachersRes.data) ? teachersRes.data : [];
      setRecentTeachers(Array.isArray(teachersData) ? teachersData : teachersData.users || []);

    } catch (err) {
      console.error("Failed to fetch recent users", err);
    }
  };


  const fetchTeachers = useCallback(async () => {
    setIsLoadingTeachers(true);
    try {
      const res = await userService.getTeachers(
        teacherSearch,
        teacherPage,
        teacherLimit,
        teacherSortField,
        teacherSortOrder
      );
      setTeachers(res.data.users || []);
      setTotalTeachers(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    } finally {
      setIsLoadingTeachers(false);
    }
  }, [teacherSearch, teacherPage, teacherLimit, teacherSortField, teacherSortOrder]);

  const fetchStudents = useCallback(async () => {
    setIsLoadingStudents(true);
    try {
      const res = await userService.getStudents(
        studentSearch,
        studentPage,
        studentLimit,
        studentSortField,
        studentSortOrder
      );
      setStudents(res.data.users || []);
      setTotalStudents(res.data.total || 0);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [studentSearch, studentPage, studentLimit, studentSortField, studentSortOrder]);


 
  const onCreateStudent: SubmitHandler<StudentCreateFormValues> = async (data) => {
    try {
      
      await userService.registerStudent(data); 
      toast.success("Student created successfully!"); 
      fetchAnalytics();
      fetchStudents(); 
      fetchRecentUsers(); 
      resetStudentForm();
      setIsCreatingStudent(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to create student.";
      toast.error(errorMsg); 
      console.error(err);
    }
  };
  
  const handleEditStudent = (student: Student) => {
    setCurrentStudent(student);
    setEditStudentValue("name", student.name);
    setEditStudentValue("email", student.email);
    setEditStudentValue("password", ""); 
    setIsEditingStudent(true);
  };
  
  const onUpdateStudent: SubmitHandler<StudentEditFormValues> = async (data) => {
    if (!currentStudent) return;
    
 
    const updateData = {
      name: data.name,
      email: data.email,
      ...(data.password && data.password.trim() !== "" && { password: data.password }), 
    };

    try {
      await userService.update(currentStudent.id, updateData);
      toast.success(`Student ${currentStudent.name} updated successfully!`); 
      setIsEditingStudent(false);
      setCurrentStudent(null);
      resetEditStudentForm();
      fetchStudents();
      fetchRecentUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to update student.";
      toast.error(errorMsg); 
      console.error(err);
    }
  };

  const handleDeleteStudent = async (id: number) => {
    try {
      await userService.delete(id);
      toast.success("Student deleted successfully! "); 
      fetchStudents();
      fetchAnalytics();
      fetchRecentUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to delete student.";
      toast.error(errorMsg); 
      console.error(err);
    }
  };


  const onCreateTeacher: SubmitHandler<TeacherCreateFormValues> = async (formData) => {
    const dataToSend = {
      ...formData,
      specialization: formData.specialization?.trim() || undefined, 
    };
    
    try {
     
      await userService.registerTeacher(dataToSend);
      toast.success("Teacher created successfully! "); 
      fetchAnalytics();
      fetchTeachers(); 
      fetchRecentUsers(); 
      resetTeacherForm(); 
      setIsCreatingTeacher(false);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to create teacher.";
      toast.error(errorMsg); 
      console.error(err);
    }
  };
  
  const handleEditTeacher = (teacher: Teacher) => {
    setCurrentTeacher(teacher);
    setEditTeacherValue("name", teacher.name);
    setEditTeacherValue("email", teacher.email);
    setEditTeacherValue("specialization", teacher.specialization || ""); 
    setEditTeacherValue("password", "");
    setIsEditingTeacher(true);
  };

  const onUpdateTeacher: SubmitHandler<TeacherEditFormValues> = async (data) => {
    if (!currentTeacher) return;
    
  
    const updateData = {
      name: data.name,
      email: data.email,
      specialization: data.specialization?.trim() || undefined, 
      ...(data.password && data.password.trim() !== "" && { password: data.password }), 
    };

    try {
      await userService.update(currentTeacher.id, updateData);
      toast.success(`Teacher ${currentTeacher.name} updated successfully!`); 
      setIsEditingTeacher(false);
      setCurrentTeacher(null);
      resetEditTeacherForm();
      fetchTeachers();
      fetchRecentUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to update teacher.";
      toast.error(errorMsg); 
      console.error(err);
    }
  };

  const handleDeleteTeacher = async (id: number) => {
    try {
      await userService.delete(id);
      toast.success("Teacher deleted successfully!"); 
      fetchTeachers();
      fetchAnalytics();
      fetchRecentUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to delete teacher.";
      toast.error(errorMsg); 
      console.error(err);
    }
  };

  const handleTeacherSort = (field: string) => {
    if (field === teacherSortField) {
      setTeacherSortOrder(teacherSortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setTeacherSortField(field);
      setTeacherSortOrder("ASC");
    }
  };

  const handleStudentSort = (field: string) => {
    if (field === studentSortField) {
      setStudentSortOrder(studentSortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setStudentSortField(field);
      setStudentSortOrder("ASC");
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchCourseAnalytics();
    fetchRecentUsers();
  }, []);

  useEffect(() => {
    if (activeView === 'manage_teachers') {
      fetchTeachers();
    }
  }, [activeView, teacherSearch, teacherPage, teacherSortField, teacherSortOrder, fetchTeachers]);

  useEffect(() => {
    if (activeView === 'manage_students') {
      fetchStudents();
    }
  }, [activeView, studentSearch, studentPage, studentSortField, studentSortOrder, fetchStudents]);


 
  const teacherColumns: Column<Teacher>[] = useMemo(() => [
    { key: 'name', header: 'Name', isSortable: true, render: (t) => <span className="font-medium">{t.name}</span>, },
    { key: 'email', header: 'Email', isSortable: true, render: (t) => <span>{t.email}</span>, },
    { key: 'specialization', header: 'Specialization', isSortable: true, render: (t) => <span className="text-sm">{t.specialization || <span className="italic text-gray-400">N/A</span>}</span>, },
    {
      key: 'actions',
      header: 'Actions',
      render: (teacher, icons) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleEditTeacher(teacher)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition shadow-md"
            title="Edit"
          >
            <icons.FaEdit />
          </button>
          <button
            onClick={() => handleDeleteTeacher(teacher.id)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition shadow-md"
            title="Delete"
          >
            <icons.FaTrash />
          </button>
        </div>
      ),
    },
  ], [handleDeleteTeacher]);

  const studentColumns: Column<Student>[] = useMemo(() => [
    { key: 'name', header: 'Name', isSortable: true, render: (s) => <span className="font-medium">{s.name}</span>, },
    { key: 'email', header: 'Email', isSortable: true, render: (s) => <span>{s.email}</span>, },
    { key: 'role', header: 'Role', isSortable: true, render: (s) => <span className="text-sm">{s.role || 'Student'}</span>, },
    {
      key: 'actions',
      header: 'Actions',
      render: (student, icons) => (
        <div className="flex gap-2">
          <button 
            onClick={() => handleEditStudent(student)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition shadow-md"
            title="Edit"
          >
            <icons.FaEdit />
          </button>
          
          <button
            onClick={() => handleDeleteStudent(student.id)}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition shadow-md"
            title="Delete"
          >
            <icons.FaTrash />
          </button>
        </div>
      ),
    },
  ], [handleDeleteStudent]);

  const renderAnalyticsView = () => {
    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'];

    const validRecentStudents = Array.isArray(recentStudents) ? recentStudents : [];
    const validRecentTeachers = Array.isArray(recentTeachers) ? recentTeachers : [];

   
    const sortedRecentStudents = validRecentStudents.slice().sort(
      (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
    );

    const sortedRecentTeachers = validRecentTeachers.slice().sort(
      (a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime()
    );

    return (
      <>
    
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="p-4 bg-theme-secondary rounded-xl shadow-lg flex flex-col items-start justify-center hover:shadow-xl transition-all duration-300">
            <FaUserGraduate className="text-3xl text-blue-500 mb-2" />
            <p className="text-sm text-theme-primary">Total Students</p>
            <p className="text-3xl font-bold text-theme-primary">{analytics?.totalStudents ?? '...'}</p>
          </div>
          <div className="p-4 bg-theme-secondary rounded-xl shadow-lg flex flex-col items-start justify-center hover:shadow-xl transition-all duration-300">
            <FaChalkboardTeacher className="text-3xl text-green-500 mb-2" />
            <p className="text-sm text-theme-primary">Total Teachers</p>
            <p className="text-3xl font-bold text-theme-primary">{analytics?.totalTeachers ?? '...'}</p>
          </div>
          <div className="p-4 bg-theme-secondary rounded-xl shadow-lg flex flex-col items-start justify-center hover:shadow-xl transition-all duration-300">
            <FaBookOpen className="text-3xl text-orange-500 mb-2" />
            <p className="text-sm text-theme-primary">Total Courses</p>
            <p className="text-3xl font-bold text-theme-primary">{courseAnalytics?.totalCourses ?? '...'}</p>
          </div>
          <div className="p-4 bg-theme-secondary rounded-xl shadow-lg flex flex-col items-start justify-center hover:shadow-xl transition-all duration-300">
            <FaChartPie className="text-3xl text-purple-500 mb-2" />
            <p className="text-sm text-theme-primary">Total Enrollments</p>
            <p className="text-3xl font-bold text-theme-primary">{courseAnalytics?.totalEnrollments ?? '...'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
      
          <div className="bg-theme-secondary p-6 rounded-2xl shadow-xl h-96 hover:shadow-xl transition-all duration-300 md:col-span-1 lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 text-theme-primary">Total Users Overview</h2>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={[
                  { name: 'Students', count: analytics?.totalStudents ?? 0 },
                  { name: 'Teachers', count: analytics?.totalTeachers ?? 0 }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                <XAxis dataKey="name" stroke="#555" /> 
                <YAxis allowDecimals={false} stroke="#555" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8b5cf6" name="Count" />
              </BarChart>
            </ResponsiveContainer>
          </div>

       
          <div className="bg-theme-secondary p-2 rounded-2xl shadow-xl h-96 hover:shadow-xl transition-all duration-300 md:col-span-1 lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 text-theme-primary">Enrollments by Category</h2>
            {courseAnalytics?.enrollmentsByCategory.length ? (
              <ResponsiveContainer width="100%" height="85%">
               <PieChart>
  <Pie
    data={courseAnalytics.enrollmentsByCategory}
    dataKey="count"
    nameKey="category"
    cx="50%"
    cy="50%"
    outerRadius={100}
    fill="#8884d8"
    labelLine={false}
    label={false}
  >
    {courseAnalytics.enrollmentsByCategory.map((_, index) => (
      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  <Tooltip formatter={(value: number, name: string) => [`${value} enrollments`, name]} />
  <Legend layout="horizontal" align="center" verticalAlign="bottom" />
</PieChart>

              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-theme-primary/60">Loading or No Data...</div>
            )}
          </div>

        
          <div className="bg-theme-secondary p-6 rounded-2xl shadow-xl h-96 hover:shadow-xl transition-all duration-300 md:col-span-2 lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 text-theme-primary">Top Enrollments by Course</h2>
            {courseAnalytics?.enrollmentsByCourse.length ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart
                  data={courseAnalytics.enrollmentsByCourse}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis type="number" allowDecimals={false} stroke="#555" />
               
                  <YAxis dataKey="courseTitle" type="category" width={120} stroke="#555" /> 
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Enrollments" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-theme-primary/60">Loading or No Data...</div>
            )}
          </div>
        </div>
   
        {sortedRecentStudents.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-theme-primary">Recently Added Students</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedRecentStudents.map((student) => (
                <div key={student.id} className="bg-theme-secondary p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-theme-primary">{student.name}</h3>
                  <p className="text-theme-primary/90">{student.email}</p>
                  <p className="text-sm text-theme-primary/70">{student.role || "student"}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {sortedRecentTeachers.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4 text-theme-primary">Recently Added Teachers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedRecentTeachers.map((teacher) => (
                <div key={teacher.id} className="bg-theme-secondary p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow">
                  <h3 className="text-lg font-semibold text-theme-primary">{teacher.name}</h3>
                  <p className="text-theme-primary/90">{teacher.email}</p>
                  <p className="text-sm text-theme-primary/70">{teacher.specialization || "N/A"}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </>
    );
  };

  const renderManageTeachersView = () => (
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-4 text-theme-primary">Manage Teachers</h2>
      <GenericTable<Teacher> 
        data={teachers}
        columns={teacherColumns}
        isLoading={isLoadingTeachers}
        totalItems={totalTeachers}
        limit={teacherLimit}
        page={teacherPage}
        setPage={setTeacherPage}
        search={teacherSearch}
        setSearch={setTeacherSearch}
        searchPlaceholder="Search teachers..."
        sortField={teacherSortField}
        sortOrder={teacherSortOrder}
        handleSort={handleTeacherSort}
        hasCreateButton={true}
        onCreate={() => {
          resetTeacherForm({ name: '', email: '', password: '', specialization: '' });
          setIsCreatingTeacher(true);
        }}
        createButtonLabel="Add Teacher"
        FaPlus={FaPlus} FaEdit={FaEdit} FaTrash={FaTrash}
      />
    </div>
  );

  const renderManageStudentsView = () => (
    <div className="mb-8">
      <h2 className="text-3xl font-bold mb-4 text-theme-primary">Manage Students</h2>
      <GenericTable<Student> 
        data={students}
        columns={studentColumns}
        isLoading={isLoadingStudents}
        totalItems={totalStudents}
        limit={studentLimit}
        page={studentPage}
        setPage={setStudentPage}
        search={studentSearch}
        setSearch={setStudentSearch}
        searchPlaceholder="Search students..."
        sortField={studentSortField}
        sortOrder={studentSortOrder}
        handleSort={handleStudentSort}
        hasCreateButton={true}
        onCreate={() => {
          resetStudentForm({ name: '', email: '', password: '' });
          setIsCreatingStudent(true);
        }}
        createButtonLabel="Add Student"
        FaPlus={FaPlus} FaEdit={FaEdit} FaTrash={FaTrash}
      />
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'analytics': return renderAnalyticsView();
      case 'manage_teachers': return renderManageTeachersView();
      case 'manage_students': return renderManageStudentsView();
      default: return renderAnalyticsView();
    }
  };

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }
  
  const currentViewLabel = adminNavItems.find(item => item.section === activeView)?.label || 'Dashboard';

  return (
    <div className="flex bg-theme-primary min-h-screen">
     
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      >
        <div className={`fixed inset-y-0 left-0 w-64 bg-theme-secondary shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <Sidebar
                role="Admin"
            
                navItems={adminNavItems as NavItem[]} 
                activeSection={activeView}
                setActiveSection={(section: string) => {
                  setActiveView(section as DashboardView);
                  setIsSidebarOpen(false); 
                }}
                FaBoxes={FaBoxes}
            />
        </div>
      </div>

    
      <div className="hidden lg:block">
        <Sidebar
          role="Admin"
        
          navItems={adminNavItems as NavItem[]} 
          setActiveSection={setActiveView as (section: string) => void}
          activeSection={activeView}
          FaBoxes={FaBoxes}
        />
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
  
        <div className="flex justify-between items-center mb-6 lg:hidden border-b pb-4">
          <h1 className="text-2xl font-extrabold text-theme-primary">
            {currentViewLabel}
          </h1>
          <button 
            className="p-2 text-theme-primary"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>

       
        <div className="hidden lg:flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-theme-primary">
            {currentViewLabel}
          </h1>
        </div>
        
        {renderContent()}
      </main>

      {isCreatingStudent && (
        <ModalWrapper isOpen={isCreatingStudent} onClose={() => {setIsCreatingStudent(false); resetStudentForm();}} title="Create New Student">
          <form onSubmit={handleSubmitStudent(onCreateStudent)} noValidate>
           
            <InputField label="Name" {...registerStudentForm("name")} error={studentErrors.name?.message} />
            <InputField label="Email" type="email" {...registerStudentForm("email")} error={studentErrors.email?.message} />
            <InputField label="Password" type="password" {...registerStudentForm("password")} error={studentErrors.password?.message} />
            <ModalButtons onCancel={() => {setIsCreatingStudent(false); resetStudentForm();}} />
          </form>
        </ModalWrapper>
      )}

      {isEditingStudent && currentStudent && (
        <ModalWrapper isOpen={isEditingStudent} onClose={() => {setIsEditingStudent(false); setCurrentStudent(null); resetEditStudentForm();}} title={`Edit Student: ${currentStudent.name}`}>
          <form onSubmit={handleSubmitEditStudent(onUpdateStudent)} noValidate>
           
            <InputField label="Name" {...registerEditStudentForm("name")} error={editStudentErrors.name?.message} />
            <InputField label="Email" type="email" {...registerEditStudentForm("email")} error={editStudentErrors.email?.message} />
            <InputField label="New Password (optional)" type="password" {...registerEditStudentForm("password")} error={editStudentErrors.password?.message} placeholder="Leave blank to keep current password" />
            <ModalButtons onCancel={() => {setIsEditingStudent(false); setCurrentStudent(null); resetEditStudentForm();}} saveText="Update" />
          </form>
        </ModalWrapper>
      )}

      {isCreatingTeacher && (
        <ModalWrapper isOpen={isCreatingTeacher} onClose={() => {setIsCreatingTeacher(false); resetTeacherForm();}} title="Create New Teacher">
          <form onSubmit={handleSubmitTeacher(onCreateTeacher)} noValidate>
         
            <InputField label="Name" {...registerTeacherForm("name")} error={teacherErrors.name?.message} />
            <InputField label="Email" type="email" {...registerTeacherForm("email")} error={teacherErrors.email?.message} />
            <InputField label="Password" type="password" {...registerTeacherForm("password")} error={teacherErrors.password?.message} />
            <InputField label="Specialization" {...registerTeacherForm("specialization")} error={teacherErrors.specialization?.message} />
            <ModalButtons onCancel={() => {setIsCreatingTeacher(false); resetTeacherForm();}} />
          </form>
        </ModalWrapper>
      )}

      {isEditingTeacher && currentTeacher && (
        <ModalWrapper isOpen={isEditingTeacher} onClose={() => {setIsEditingTeacher(false); setCurrentTeacher(null); resetEditTeacherForm();}} title={`Edit Teacher: ${currentTeacher.name}`}>
          <form onSubmit={handleSubmitEditTeacher(onUpdateTeacher)} noValidate>
        
            <InputField label="Name" {...registerEditTeacherForm("name")} error={editTeacherErrors.name?.message} />
            <InputField label="Email" type="email" {...registerEditTeacherForm("email")} error={editTeacherErrors.email?.message} />
            <InputField label="Specialization" {...registerEditTeacherForm("specialization")} error={editTeacherErrors.specialization?.message} />
            <InputField label="New Password (optional)" type="password" {...registerEditTeacherForm("password")} error={editTeacherErrors.password?.message} placeholder="Leave blank to keep current password" />
            <ModalButtons onCancel={() => {setIsEditingTeacher(false); setCurrentTeacher(null); resetEditTeacherForm();}} saveText="Update" />
          </form>
        </ModalWrapper>
      )}

      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light"/>
    </div>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  
}


const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, type = "text", error, placeholder, ...props }, ref) => (
  <div className="mb-4">
    <label className="block text-gray-600 mb-1">{label}</label>
    <input
      type={type}
      className={`w-full bg-theme-primary text-theme-primary border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
      placeholder={placeholder}
      ref={ref} 
      {...props}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
));
InputField.displayName = 'InputField';

const ModalButtons = ({ onCancel, saveText = "Save" }: { onCancel: () => void; saveText?: string }) => (
  <div className="flex justify-end gap-3 mt-4">
    <button
      type="button"
      onClick={onCancel}
      className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded transition shadow-md"
    >
      Cancel
    </button>
    <button
      type="submit"
      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition shadow-md"
    >
      {saveText}
    </button>
  </div>
);