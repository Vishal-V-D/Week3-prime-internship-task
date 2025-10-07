import { useContext, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext";
// 👇 ORIGINAL SERVICE IMPORTS RESTORED
import { userService } from "../api/userService";
import { courseService } from "../api/courseService";
import { 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaBookOpen, 
  FaClipboardList, 
  FaUserGraduate,
  FaBoxes,
  FaTachometerAlt,
  FaBars, // ADDED for mobile menu toggle
  FaTimes, // ADDED for mobile menu close icon
} from "react-icons/fa";
import type { IconType } from 'react-icons'; // Import IconType for the navItems array

interface Student {
  id: number;
  name: string;
  email: string;
  role?: string;
  specialization?: string | null;
  createdAt?: string;
}

interface StudentFormValues {
  name: string;
  email: string;
  password?: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  category: string;
  rating?: number;
  createdAt?: string;
}

interface CourseFormValues {
  title: string;
  description: string;
  duration: number;
  category: string;
}

interface Enrollment {
  id: number;
  courseId: number;
  studentId: number;
  enrollmentDate: string; 
  course?: { title: string };
  student?: { name: string, email?: string }; 
  studentName?: string;
  studentEmail?: string;
  createdAt?: string; 
}

type ActiveSection = 'students' | 'courses' | 'enrollments' | 'recent';

// Define the shape for navigation items to be passed to the Sidebar
interface NavItem {
    section: ActiveSection | 'dashboard'; // Using 'dashboard' here to align with Sidebar component expectations for the 'recent' view
    label: string;
    Icon: IconType;
}

const teacherNavItems: NavItem[] = [
   
    { section: 'students', label: 'Students', Icon: FaUserGraduate },
    { section: 'courses', label: 'Courses', Icon: FaBookOpen },
     { section: 'dashboard', label: 'Recents', Icon: FaTachometerAlt }, // Changed 'recent' to 'dashboard' to match Sidebar type
    { section: 'enrollments', label: 'Enrollments', Icon: FaClipboardList },
];


// 👇 FIX 1: Make password required in create schema to match resolver type
const studentCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
}).required();

const studentEditSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup.string().optional(),
}).required();

const courseSchema = yup.object({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  duration: yup.number().typeError("Duration must be a number").min(1, "Duration must be at least 1").required("Duration is required"),
  category: yup.string().required("Category is required"),
}).required();


const useTeacherDashboard = () => {
  const { user } = useContext(AuthContext)!; 
  const queryClient = useQueryClient();

  const [isEditingStudent, setIsEditingStudent] = useState<boolean>(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [isCreatingStudent, setIsCreatingStudent] = useState<boolean>(false);
  const [isEditingCourse, setIsEditingCourse] = useState<boolean>(false);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [isCreatingCourse, setIsCreatingCourse] = useState<boolean>(false);
  
  const [activeSection, setActiveSection] = useState<ActiveSection>('students');
  // 👇 FIX 5: Remove unused variable warning by actually using it or prefixing with _
  const [_pendingEnrollmentId, setPendingEnrollmentId] = useState<number | null>(null);

  const [studentPage, setStudentPage] = useState<number>(1);
  const [studentLimit] = useState<number>(10);
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [studentSortField, setStudentSortField] = useState<string>("id");
  const [studentSortOrder, setStudentSortOrder] = useState<"ASC" | "DESC">("ASC");

  const [coursePage, setCoursePage] = useState<number>(1);
  const [courseLimit] = useState<number>(10);
  const [courseSearch, setCourseSearch] = useState<string>("");
  const [courseSortField, setCourseSortField] = useState<string>("id");
  const [courseSortOrder, setCourseSortOrder] = useState<"ASC" | "DESC">("ASC");

  const [enrollmentSearch, setEnrollmentSearch] = useState<string>("");

  // 👇 FIX 3: Check if getStudents supports sorting parameters, if not do client-side sorting
  const studentsQuery = useQuery({
    queryKey: ["students", studentPage, studentLimit, studentSearch, studentSortField, studentSortOrder],
    queryFn: async () => {
      // Try to pass all parameters - if API doesn't support, it will ignore extra params
      const res = await userService.getStudents(studentSearch, studentPage, studentLimit);
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });
  
  // Client-side sorting if API doesn't support it
  const sortedStudents = useMemo(() => {
    if (!studentsQuery.data?.users) return [];
    const users = [...studentsQuery.data.users];
    
    if (studentSortField && studentSortField !== 'actions') {
      users.sort((a: any, b: any) => {
        const aVal = a[studentSortField];
        const bVal = b[studentSortField];
        
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        let comparison = 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }
        
        return studentSortOrder === 'ASC' ? comparison : -comparison;
      });
    }
    
    return users;
  }, [studentsQuery.data, studentSortField, studentSortOrder]);
  const students: Student[] = sortedStudents;
  const studentTotal: number = studentsQuery.data?.total || 0;
  const loadingStudents = studentsQuery.isLoading;
  const recentStudents: Student[] = useMemo(() => (studentsQuery.data?.users || [])
    .filter((s: Student) => s.createdAt)
    .sort((a: Student, b: Student) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5), [studentsQuery.data]);


  const coursesQuery = useQuery({
    queryKey: ["courses", coursePage, courseLimit, courseSearch, courseSortField, courseSortOrder],
    queryFn: async () => {
      const res = await courseService.getCourses(
        courseSearch, 
        coursePage, 
        courseLimit
      );
      return res.data; 
    },
    placeholderData: (previousData) => previousData,
  });
  
  const rawData = coursesQuery.data || {};
  const allCourses = (rawData.data || rawData.courses || []) as Course[];
  
  // Client-side sorting for courses
  const sortedCourses = useMemo(() => {
    if (!allCourses.length) return [];
    const coursesArray = [...allCourses];
    
    if (courseSortField && courseSortField !== 'actions') {
      coursesArray.sort((a: any, b: any) => {
        const aVal = a[courseSortField];
        const bVal = b[courseSortField];
        
        if (aVal === bVal) return 0;
        if (aVal === null || aVal === undefined) return 1;
        if (bVal === null || bVal === undefined) return -1;
        
        let comparison = 0;
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          comparison = aVal.localeCompare(bVal);
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal));
        }
        
        return courseSortOrder === 'ASC' ? comparison : -comparison;
      });
    }
    
    return coursesArray;
  }, [allCourses, courseSortField, courseSortOrder]);
  
  const courses: Course[] = sortedCourses;
  const courseTotal: number = rawData.total || 0; 
  const loadingCourses = coursesQuery.isLoading;
  const recentCourses: Course[] = useMemo(() => courses
    .filter((c: Course) => c.createdAt)
    .sort((a: Course, b: Course) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
    .slice(0, 5), [courses]);


  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments"],
    queryFn: async () => {
      const res = await courseService.getEnrollments();
      return res.data;
    },
  });
  const enrollments: Enrollment[] = enrollmentsQuery.data?.data || enrollmentsQuery.data || [];
  const loadingEnrollments = enrollmentsQuery.isLoading;

  const createStudentMutation = useMutation({
    mutationFn: (data: StudentFormValues) => userService.registerStudent(data),
    onSuccess: () => {
      toast.success("Student created successfully! 🧑‍🎓");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsCreatingStudent(false);
      resetCreateStudent();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create student."),
  });

  const updateStudentMutation = useMutation({
    mutationFn: (data: StudentFormValues) => userService.update(currentStudent!.id, data),
    onSuccess: () => {
      toast.success("Student updated successfully! ✅");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditingStudent(false);
      setCurrentStudent(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update student."),
  });

  const deleteStudentMutation = useMutation({
    mutationFn: (id: number) => userService.delete(id),
    onSuccess: () => {
      toast.info("Student deleted. 🗑️");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to delete student."),
  });

  const createCourseMutation = useMutation({
    mutationFn: (data: CourseFormValues) => courseService.createCourse({ ...data, duration: Number(data.duration) }),
    onSuccess: () => {
      toast.success("Course created successfully! 📘");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setIsCreatingCourse(false);
      resetCreateCourse();
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to create course."),
  });

  const updateCourseMutation = useMutation({
    mutationFn: (data: CourseFormValues) => courseService.updateCourse(currentCourse!.id, { ...data, duration: Number(data.duration) }),
    onSuccess: () => {
      toast.success("Course updated successfully! ✏️");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setIsEditingCourse(false);
      setCurrentCourse(null);
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to update course."),
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => courseService.deleteCourse(id),
    onSuccess: () => {
      toast.info("Course deleted. ❌");
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to delete course."),
  });

  const deleteEnrollmentMutation = useMutation({
    mutationFn: (id: number) => courseService.deleteEnrollment(id),
    onSuccess: () => {
      toast.info("Enrollment removed. 🚫");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onError: (err: any) => toast.error(err?.response?.data?.message || "Failed to delete enrollment."),
  });
  


  const handleEditStudent = (student: Student) => {
    setCurrentStudent(student);
    resetEditStudent({ name: student.name, email: student.email, password: "" });
    setIsEditingStudent(true);
  };
  const handleCreateStudentSubmit = (data: StudentFormValues) => createStudentMutation.mutate(data);
  // Type fix: Ensure optional password is handled correctly for update
  const handleEditStudentSubmit = (data: StudentFormValues) => {
      const updateData = {
          name: data.name,
          email: data.email,
          ...(data.password && data.password.trim() !== "" && { password: data.password }), 
      };
      updateStudentMutation.mutate(updateData as StudentFormValues);
  };
  const handleDeleteStudent = (id: number) => {
    if (confirm("Are you sure you want to delete this student?")) deleteStudentMutation.mutate(id);
  };

  const handleEditCourse = (course: Course) => {
    setCurrentCourse(course);
    resetEditCourse({ title: course.title, description: course.description, duration: course.duration, category: course.category });
    setIsEditingCourse(true);
  };
  const handleCreateCourseSubmit = (data: CourseFormValues) => createCourseMutation.mutate(data);
  const handleEditCourseSubmit = (data: CourseFormValues) => updateCourseMutation.mutate(data);
  const handleDeleteCourse = (id: number) => {
    if (confirm("Are you sure you want to delete this course?")) deleteCourseMutation.mutate(id);
  };
  
  // 👇 FIX 2: Comment out or remove handleEnroll if enrollStudent doesn't exist
  /*
  const handleEnroll = (courseId: number) => {
    enrollMutation.mutate(courseId);
  }
  */
  
  const handleDeleteEnrollment = (id: number) => {
    if (confirm("Are you sure you want to delete this enrollment?")) deleteEnrollmentMutation.mutate(id);
  };

  const handleSortStudent = (field: string) => {
    if (studentSortField === field) setStudentSortOrder(studentSortOrder === "ASC" ? "DESC" : "ASC");
    else {
      setStudentSortField(field);
      setStudentSortOrder("ASC");
    }
  };

  const handleSortCourse = (field: string) => {
    if (courseSortField === field) setCourseSortOrder(courseSortOrder === "ASC" ? "DESC" : "ASC");
    else {
      setCourseSortField(field);
      setCourseSortOrder("ASC");
    }
  };


  const {
    register: createRegisterStudent,
    handleSubmit: handleCreateSubmitStudent,
    reset: resetCreateStudent,
    formState: { errors: createErrorsStudent },
  } = useForm<StudentFormValues>({
    resolver: yupResolver(studentCreateSchema) as any,
  });

  const {
    register: editRegisterStudent,
    handleSubmit: handleEditSubmitStudent,
    reset: resetEditStudent,
    formState: { errors: editErrorsStudent },
  } = useForm<StudentFormValues>({
    resolver: yupResolver(studentEditSchema) as any,
  });

  const {
    register: createRegisterCourse,
    handleSubmit: handleCreateSubmitCourse,
    reset: resetCreateCourse,
    formState: { errors: createErrorsCourse },
  } = useForm<CourseFormValues>({
    resolver: yupResolver(courseSchema) as any,
  });

  const {
    register: editRegisterCourse,
    handleSubmit: handleEditSubmitCourse,
    reset: resetEditCourse,
    formState: { errors: editErrorsCourse },
  } = useForm<CourseFormValues>({
    resolver: yupResolver(courseSchema) as any,
  });

  // 👇 ADDED SETTERS FOR SEARCH/FILTERING LOGIC BACK TO THE RETURN OBJECT
  return {
    user,
    activeSection, setActiveSection,
    isCreatingStudent, setIsCreatingStudent,
    isEditingStudent, setIsEditingStudent,
    currentStudent,
    isCreatingCourse, setIsCreatingCourse,
    isEditingCourse, setIsEditingCourse,
    currentCourse,

    students, loadingStudents, studentTotal,
    courses, loadingCourses, courseTotal, 
    enrollments, loadingEnrollments,
    recentStudents, recentCourses,

    studentPage, setStudentPage, studentLimit,
    // Restored student search setters
    studentSearch, setStudentSearch, 
    studentSortField, studentSortOrder, handleSortStudent,

    coursePage, setCoursePage, courseLimit, 
    // Restored course search setters
    courseSearch, setCourseSearch, 
    courseSortField, courseSortOrder, handleSortCourse,
    
    // Restored enrollment search setters
    enrollmentSearch, setEnrollmentSearch, 

    createStudentMutation, updateStudentMutation, deleteStudentMutation,
    createCourseMutation, updateCourseMutation, deleteCourseMutation,
    deleteEnrollmentMutation,
    
    handleEditStudent, handleCreateStudentSubmit, handleEditStudentSubmit, handleDeleteStudent,
    handleEditCourse, handleCreateCourseSubmit, handleEditCourseSubmit, handleDeleteCourse,
    handleDeleteEnrollment,

    createRegisterStudent, handleCreateSubmitStudent, createErrorsStudent,
    editRegisterStudent, handleEditSubmitStudent, editErrorsStudent,
    createRegisterCourse, handleCreateSubmitCourse, createErrorsCourse,
    editRegisterCourse, handleEditSubmitCourse, editErrorsCourse,
  };
};

// 👇 UPDATED IMPORTS to the components directory
import Sidebar from "../components/Sidebar"; 
import Content from "../components/Content";
import Modals from "../components/Modal"; 

export default function DashboardTeacher() {
  const state = useTeacherDashboard();
  // State for mobile sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Logic to handle the 'recent' view mapping to the Sidebar's 'dashboard' type
  const currentViewLabel = teacherNavItems.find(item => item.section === state.activeSection || (item.section === 'dashboard' && state.activeSection === 'recent'))?.label || 'Dashboard';
  const activeSectionForSidebar = state.activeSection === 'recent' ? 'dashboard' : state.activeSection;

  return (
    // The main container includes the flex layout and min-height
    <div className="flex bg-theme-primary min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      
      {/* ---------------- MOBILE OVERLAY SIDEBAR ---------------- */}
      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        // Overlay to close sidebar when clicked outside
        onClick={() => setIsSidebarOpen(false)}
      >
        {/* Actual sidebar panel that slides in */}
        <div 
          className={`fixed inset-y-0 left-0 w-64 bg-theme-secondary shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          // Prevents closing when clicking on the sidebar itself
          onClick={(e) => e.stopPropagation()}
        >
          <Sidebar
            role="Teacher" 
            navItems={teacherNavItems as NavItem[]} 
            activeSection={activeSectionForSidebar} 
            setActiveSection={(section: string) => {
                const newSection = section === 'dashboard' ? 'recent' : section;
                state.setActiveSection(newSection as ActiveSection);
                setIsSidebarOpen(false); // Close on selection
            }}
            FaBoxes={FaBoxes} 
          />
        </div>
      </div>
      
      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <div className="hidden lg:block">
        <Sidebar
          role="Teacher"
          navItems={teacherNavItems as NavItem[]}
          setActiveSection={(section: string) => {
            const newSection = section === 'dashboard' ? 'recent' : section;
            state.setActiveSection(newSection as ActiveSection);
          }}
          activeSection={activeSectionForSidebar}
          FaBoxes={FaBoxes}
        />
      </div>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        
        {/* ---------------- MOBILE HEADER WITH TOGGLE ---------------- */}
        <div className="flex justify-between items-center mb-6 lg:hidden border-b pb-4">
          <h1 className="text-2xl font-extrabold text-gray-800">
            {currentViewLabel}
          </h1>
          <button 
            className="p-2 text-gray-800"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
          </button>
        </div>
        
        {/* ---------------- DESKTOP HEADER ---------------- */}
        <div className="hidden lg:flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-theme-primary">
            {currentViewLabel} Management Portal 👨‍🏫
          </h1>
        </div>
        
        <div className="mt-6">
          <Content 
            section={state.activeSection} 
            {...state} 
            FaPlus={FaPlus} 
            FaEdit={FaEdit} 
            FaTrash={FaTrash} 
            FaClipboardList={FaClipboardList} 
            FaBookOpen={FaBookOpen}
            FaUserGraduate={FaUserGraduate}
            FaTachometerAlt={FaTachometerAlt}
          />
        </div>
      </main>

      <Modals {...state} />
    </div>
  );
}