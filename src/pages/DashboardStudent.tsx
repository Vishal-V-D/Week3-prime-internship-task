import React, { useContext, useState, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../context/AuthContext";
import { courseService } from "../api/courseService";
import GenericTable from "../components/tables/GenericTable";
import type { Column, DataItem, SortOrder } from "../components/tables/GenericTable";
import Sidebar from "../components/Sidebar"; 
import type  { NavItem } from "../components/Sidebar"; 
import { 
    FaEdit, 
    FaTrash, 
    FaPlus, 
    FaHome, 
    FaBookOpen, 
    FaUserGraduate, 
    FaBoxes,
    FaThLarge, 
    FaList,    
    FaStar,
    FaSignOutAlt,
    FaBars, 
    FaTimes,
    FaEye
} from "react-icons/fa"; 

type StudentActiveSection = 'dashboard' | 'availableCourses' | 'myEnrollments';
type ViewMode = 'table' | 'card'; 

interface Course extends DataItem {
  id: number;
  title: string;
  description: string;
  rating: number; 
}

interface Enrollment extends DataItem {
  id: number;
  courseId: number;
  courseTitle: string;
}

const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const stars = [];
    for (let i = 0; i < 5; i++) {
        stars.push(
            <FaStar 
                key={i} 
                className={i < fullStars ? "text-yellow-400" : "text-gray-300"} 
            />
        );
    }
    return <div className="flex text-sm">{stars}</div>;
};

const CourseCard: React.FC<{ course: Course; onEnroll: (id: number) => void; isEnrolling: boolean; onViewDetails: (course: Course) => void }> = ({ course, onEnroll, isEnrolling, onViewDetails }) => {
    const colorClasses = [
        "bg-blue-500", 
        "bg-purple-500", 
        "bg-green-500", 
        "bg-red-500", 
        "bg-yellow-500"
    ];
    const thumbnailColor = colorClasses[course.id % colorClasses.length];

    return (
        <div 
            className="bg-theme-secondary p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between border-t-4 border-b-4 border-transparent hover:border-accent cursor-pointer"
            onClick={() => onViewDetails(course)}
        >
            <div className={`p-5 rounded-xl mb-4 flex items-center justify-center text-white ${thumbnailColor}`}>
                <FaBookOpen className="text-4xl" />
            </div>
            
            <h3 className="text-lg font-extrabold text-theme-primary truncate mb-2">{course.title}</h3>

            <div className="flex items-center mb-2">
                {renderStars(course.rating)}
                <span className="ml-2 text-sm text-theme-secondary font-semibold">{course.rating.toFixed(1)}</span>
            </div>
            
            <p className="text-sm text-theme-secondary mb-4 line-clamp-3">{course.description || "No description provided."}</p>
            
            <div className="flex justify-between items-center mt-auto border-t border-theme pt-3">
                <span className="text-xs font-medium text-theme-secondary">ID: {course.id}</span>
                <button 
                    onClick={(e) => {
                        e.stopPropagation(); 
                        onEnroll(course.id);
                    }} 
                    className="button-theme py-1 px-4 text-sm disabled:opacity-50" 
                    disabled={isEnrolling}
                > 
                    {isEnrolling ? 'Enrolling...' : 'Enroll'}
                </button>
            </div>
        </div>
    );
};

const EnrollmentCard: React.FC<{ enrollment: Enrollment; onUnenroll: (id: number) => void; isUnenrolling: boolean }> = ({ enrollment, onUnenroll, isUnenrolling }) => {
    const colorClasses = [
        "bg-pink-500", 
        "bg-indigo-500", 
        "bg-teal-500", 
        "bg-orange-500", 
        "bg-cyan-500"
    ];
    const cardColor = colorClasses[enrollment.id % colorClasses.length];

    return (
        <div className="bg-theme-secondary p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between border-t-4 border-b-4 border-transparent hover:border-accent">
            <div className={`p-5 rounded-xl mb-4 flex items-center justify-center text-white ${cardColor}`}>
                <FaBookOpen className="text-4xl" />
            </div>

            <h3 className="text-lg font-extrabold text-theme-primary truncate mb-2">{enrollment.courseTitle}</h3>
            
            <p className="text-sm text-theme-secondary mb-4 line-clamp-3">You are currently enrolled in this course. You can unenroll at any time.</p>
            
            <div className="flex justify-between items-center mt-auto border-t border-theme pt-3">
                <span className="text-xs font-medium text-theme-secondary">Enrollment ID: {enrollment.id}</span>
                <button 
                    onClick={() => onUnenroll(enrollment.id)} 
                    className="button-error flex items-center space-x-1 py-1 px-4 text-sm disabled:opacity-50" 
                    disabled={isUnenrolling}
                > 
                    <FaSignOutAlt />
                    <span>{isUnenrolling ? 'Removing...' : 'Unenroll'}</span>
                </button>
            </div>
        </div>
    );
};

const CourseDetailModal: React.FC<{ course: Course; onClose: () => void; onEnroll: (id: number) => void; isEnrolling: boolean }> = ({ course, onClose, onEnroll, isEnrolling }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-theme-secondary w-full max-w-lg md:max-w-xl rounded-xl shadow-3xl p-6 relative animate-fade-in-slide-up">
            <button onClick={onClose} className="absolute top-4 right-4 text-theme-secondary hover:text-theme-primary">
                <FaTimes className="text-xl" />
            </button>
            <h2 className="text-3xl font-extrabold text-theme-primary mb-2">{course.title}</h2>
            <div className="flex items-center mb-4">
                {renderStars(course.rating)}
                <span className="ml-2 text-md font-semibold text-theme-secondary">{course.rating.toFixed(1)} Rating</span>
            </div>
            
            <div className="space-y-4 py-4 border-t border-b border-theme mb-6">
                <p className="text-theme-secondary text-sm font-semibold">Course ID: <span className="text-theme-primary">{course.id}</span></p>
                
                <h3 className="text-lg font-bold text-theme-primary">Description:</h3>
                <p className="text-theme-secondary text-base whitespace-pre-wrap">{course.description || "Detailed description not available for this course."}</p>
            </div>

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="py-2 px-4 rounded-lg text-sm font-semibold text-theme-secondary bg-gray-200 hover:bg-gray-300 transition-colors"
                >
                    Close
                </button>
                <button 
                    onClick={() => { 
                        onEnroll(course.id);
                        onClose();
                    }} 
                    className="button-theme py-2 px-4 text-sm disabled:opacity-50" 
                    disabled={isEnrolling}
                > 
                    {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
            </div>
        </div>
    </div>
);

const DashboardStudent: React.FC = () => {
  const authContext = useContext(AuthContext); 
  const queryClient = useQueryClient();

  const [activeSection, setActiveSection] = useState<StudentActiveSection>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const [availableViewMode, setAvailableViewMode] = useState<ViewMode>('card'); 
  const [enrollmentViewMode, setEnrollmentViewMode] = useState<ViewMode>('card'); 

  const studentNavItems: NavItem[] = useMemo(() => [
      { section: 'dashboard', label: 'Home', Icon: FaHome },
      { section: 'availableCourses', label: 'Available Courses', Icon: FaBookOpen },
      { section: 'myEnrollments', label: 'My Enrollments', Icon: FaUserGraduate },
  ], []);

  const [pendingEnrollmentId, setPendingEnrollmentId] = useState<number | null>(null);
  const [pendingUnenrollmentId, setPendingUnenrollmentId] = useState<number | null>(null);
  
  const [availableSearch, setAvailableSearch] = useState<string>("");
  const [availablePage, setAvailablePage] = useState<number>(1);
  const [availableSortField, setAvailableSortField] = useState<string>("id");
  const [availableSortOrder, setAvailableSortOrder] = useState<SortOrder>("ASC");
  
  const [enrollmentSearch, setEnrollmentSearch] = useState<string>("");
  const [enrollmentPage, setEnrollmentPage] = useState<number>(1);
  const [enrollmentSortField, setEnrollmentSortField] = useState<string>("id");
  const [enrollmentSortOrder, setEnrollmentSortOrder] = useState<SortOrder>("ASC");

  const coursesQuery = useQuery({ queryKey: ["courses"], queryFn: async () => (await courseService.getCourses()).data, });
  const recentEnrollmentsQuery = useQuery({ queryKey: ["recentEnrollments"], queryFn: async () => (await courseService.getMyEnrollments()).data, });

  const enrollMutation = useMutation({
    mutationFn: (courseId: number) => courseService.createEnrollment(courseId),
    onMutate: (courseId) => setPendingEnrollmentId(courseId),
    onSuccess: () => {
      toast.success("Enrolled successfully!"); 
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["recentEnrollments"] });
    },
    onSettled: () => setPendingEnrollmentId(null),
    onError: (err: any) => toast.error(err?.response?.data?.message || "Enrollment failed"),
  });

  const deleteEnrollMutation = useMutation({
    mutationFn: (id: number) => courseService.deleteEnrollment(id),
    onMutate: (id) => setPendingUnenrollmentId(id),
    onSuccess: () => {
      toast.info("Enrollment removed"); 
      queryClient.invalidateQueries({ queryKey: ["recentEnrollments"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
    onSettled: () => setPendingUnenrollmentId(null),
    onError: (err: any) => toast.error(err?.response?.data?.message || "Delete failed"),
  });
  
  const handleEnroll = (id: number) => enrollMutation.mutate(id);
  const handleUnenroll = (id: number) => deleteEnrollMutation.mutate(id);
  const handleViewDetails = (course: Course) => setSelectedCourse(course);

  const recentEnrollments: Enrollment[] = recentEnrollmentsQuery.data?.data || [];
  const enrolledCourseIds = useMemo(() => new Set(recentEnrollments.map(e => e.courseId)), [recentEnrollments]);

  const allCourses = coursesQuery.data?.data || [];
  const availableCourses = allCourses.filter((course: Course) => !enrolledCourseIds.has(course.id));

  const filteredAndSortedAvailableCourses = useMemo(() => {
    let coursesToProcess = availableCourses.map((c: Course) => ({
      ...c, 
      rating: c.rating !== undefined ? c.rating : (c.id % 5) + 1, 
      description: c.description || 'This course offers an exciting introduction to the subject matter.',
    }));

    if (availableSearch.trim()) {
      const searchLower = availableSearch.toLowerCase();
      coursesToProcess = coursesToProcess.filter((course: Course) => 
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.id.toString().includes(searchLower)
      );
    }

    return [...coursesToProcess].sort((a, b) => {
      const aVal = a[availableSortField as keyof Course];
      const bVal = b[availableSortField as keyof Course];
      
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      }
      
      return availableSortOrder === 'ASC' ? comparison : -comparison;
    });
  }, [availableCourses, availableSearch, availableSortField, availableSortOrder]);

  const filteredAndSortedEnrollments = useMemo(() => {
    let enrollmentsToProcess = [...recentEnrollments];

    if (enrollmentSearch.trim()) {
      const searchLower = enrollmentSearch.toLowerCase();
      enrollmentsToProcess = enrollmentsToProcess.filter((enrollment: Enrollment) => 
        enrollment.courseTitle.toLowerCase().includes(searchLower) ||
        enrollment.id.toString().includes(searchLower)
      );
    }

    return enrollmentsToProcess.sort((a, b) => {
      const aVal = a[enrollmentSortField as keyof Enrollment];
      const bVal = b[enrollmentSortField as keyof Enrollment];
      
      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;
      
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      }
      
      return enrollmentSortOrder === 'ASC' ? comparison : -comparison;
    });
  }, [recentEnrollments, enrollmentSearch, enrollmentSortField, enrollmentSortOrder]);

  const limit = 10;
  const startIndex = (availablePage - 1) * limit;
  const endIndex = availablePage * limit;

  const handleAvailableSort = (field: string) => {
    setAvailableSortField(field);
    setAvailableSortOrder(
      field === availableSortField && availableSortOrder === "ASC" ? "DESC" : "ASC"
    );
  };

  const paginatedAvailableCourses = filteredAndSortedAvailableCourses.slice(startIndex, endIndex);
  const totalAvailableItems = filteredAndSortedAvailableCourses.length;
  const isLoadingAvailable = coursesQuery.isLoading;
  
  const availableCourseColumns: Column<Course>[] = useMemo(() => [
    { key: "id", header: "ID", isSortable: true, render: (course) => <span className="text-sm text-theme-secondary">{course.id}</span>, },
    { key: "title", header: "Title", isSortable: true, render: (course) => <span className="text-sm font-bold text-theme-primary">{course.title}</span>, }, 
    { key: "rating", header: "Rating", isSortable: true, render: (course) => renderStars(course.rating), }, 
    { key: "details", header: "Details", isSortable: false, render: (course) => (
        <button 
            onClick={() => handleViewDetails(course)} 
            className="flex items-center space-x-1 py-1 px-3 rounded text-sm text-theme-primary bg-gray-200 hover:bg-gray-300 transition-colors"
        >
            <FaEye className="w-3 h-3" />
            <span>View</span>
        </button>
    )},
    { key: "actions", header: "Action", isSortable: false, render: (course) => (
        <button 
            onClick={() => handleEnroll(course.id)} 
            className="button-theme py-1 px-3 text-sm disabled:opacity-50" 
            disabled={enrollMutation.isPending && pendingEnrollmentId === course.id} 
        > 
            {enrollMutation.isPending && pendingEnrollmentId === course.id ? 'Enrolling...' : 'Enroll'} 
        </button>
    )},
  ], [pendingEnrollmentId, enrollMutation.isPending]);
  
  const handleEnrollmentSort = (field: string) => {
    setEnrollmentSortField(field);
    setEnrollmentSortOrder(
      field === enrollmentSortField && enrollmentSortOrder === "ASC" ? "DESC" : "ASC"
    );
  };
  
  const enrollmentStartIndex = (enrollmentPage - 1) * limit;
  const enrollmentEndIndex = enrollmentPage * limit;
  const paginatedRecentEnrollments = filteredAndSortedEnrollments.slice(enrollmentStartIndex, enrollmentEndIndex);
  const totalEnrollmentItems = filteredAndSortedEnrollments.length;
  const isLoadingEnrollments = recentEnrollmentsQuery.isLoading;
  
  const recentEnrollmentColumns: Column<Enrollment>[] = useMemo(() => [
    { key: "id", header: "Enrollment ID", isSortable: true, render: (enroll) => <span className="text-sm text-theme-secondary">{enroll.id}</span>, },
    { key: "courseTitle", header: "Course Title", isSortable: true, render: (enroll) => <span className="text-sm font-semibold text-theme-primary">{enroll.courseTitle}</span>, },
    { key: "actions", header: "Action", isSortable: false, render: (enroll) => (
        <button 
            onClick={() => handleUnenroll(enroll.id)} 
            className="button-error flex items-center space-x-1 py-1 px-3 text-sm disabled:opacity-50" 
            disabled={deleteEnrollMutation.isPending && pendingUnenrollmentId === enroll.id} 
        > 
            <FaSignOutAlt className="w-3 h-3"/> 
            <span>{deleteEnrollMutation.isPending && pendingUnenrollmentId === enroll.id ? 'Removing...' : 'Unenroll'}</span>
        </button>
    )},
  ], [pendingUnenrollmentId, deleteEnrollMutation.isPending]);
  
  const ViewModeToggle: React.FC<{ currentMode: ViewMode; setMode: (mode: ViewMode) => void }> = ({ currentMode, setMode }) => (
   <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-full shadow-inner w-fit mx-auto">
  <button
    onClick={() => setMode('table')}
    className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
      currentMode === 'table'
        ? 'bg-theme-primary text-cyan-400 shadow-md scale-[1.03]'
        : 'text-gray-600 hover:bg-gray-200 hover:text-gray-800'
    }`}
  >
    <FaList className="text-base" />
    <span>Table</span>
  </button>

  <button
    onClick={() => setMode('card')}
    className={`flex items-center gap-2 py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 ${
      currentMode === 'card'
        ? 'bg-theme-primary text-cyan-400 shadow-md scale-[1.03]'
        : 'text-cyan-300 hover:bg-gray-200 hover:text-gray-800'
    }`}
  >
    <FaThLarge className="text-base" />
    <span>Card</span>
  </button>
</div>

  );
  
  const currentViewLabel = studentNavItems.find(item => item.section === activeSection)?.label || 'Dashboard';

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-theme-primary">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-theme-secondary p-6 rounded-xl shadow-lg border border-theme">
                    <h3 className="text-xl font-semibold text-theme-primary">Total Enrolled Courses</h3>
                    <p className="text-4xl font-extrabold text-theme-primary mt-2">{recentEnrollments.length}</p>
                </div>
                <div className="bg-theme-secondary p-6 rounded-xl shadow-lg border border-theme">
                    <h3 className="text-xl font-semibold text-theme-primary">Courses Available</h3>
                    <p className="text-4xl font-extrabold text-theme-primary mt-2">{availableCourses.length}</p>
                </div>
                <div className="bg-theme-secondary p-6 rounded-xl shadow-lg border border-theme">
                    <h3 className="text-xl font-semibold text-theme-primary">Account Status</h3>
                    <p className="text-lg text-theme-secondary mt-2">Active</p>
                </div>
            </div>
            <div className="pt-4 bg-theme-secondary p-6 rounded-xl shadow-xl border border-theme">
                <h3 className="text-2xl font-bold mb-4 text-theme-primary">Quick View: My Enrollments</h3>
                <GenericTable<Enrollment>
                    data={filteredAndSortedEnrollments.slice(0, 5)} 
                    columns={recentEnrollmentColumns.slice(0, -1)} 
                    isLoading={isLoadingEnrollments}
                    totalItems={5} limit={5} page={1} setPage={() => {}} 
                    search="" setSearch={() => {}} searchPlaceholder=""
                    sortField="id" sortOrder="ASC" handleSort={handleEnrollmentSort}
                    FaPlus={FaPlus} FaEdit={FaEdit} FaTrash={FaTrash} hasCreateButton={false} 
                />
            </div>
          </div>
        );

      case 'availableCourses':
        return (
          <section className="bg-theme-secondary p-6 rounded-xl shadow-2xl border border-theme">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-y-3">
                <h2 className="text-2xl font-bold text-theme-primary flex-grow">Available Courses</h2> 
                <ViewModeToggle currentMode={availableViewMode} setMode={setAvailableViewMode} />
            </div>
            
            {availableViewMode === 'table' ? (
                <GenericTable<Course>
                  data={paginatedAvailableCourses} 
                  columns={availableCourseColumns} 
                  isLoading={isLoadingAvailable}
                  totalItems={totalAvailableItems} 
                  limit={limit} 
                  page={availablePage} 
                  setPage={setAvailablePage}
                  search={availableSearch} 
                  setSearch={setAvailableSearch} 
                  searchPlaceholder="Search courses..."
                  sortField={availableSortField} 
                  sortOrder={availableSortOrder} 
                  handleSort={handleAvailableSort}
                  FaPlus={FaPlus} FaEdit={FaEdit} FaTrash={FaTrash} hasCreateButton={false} 
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoadingAvailable ? (
                        <p className="col-span-full text-center p-8 text-theme-secondary">Loading courses...</p>
                    ) : paginatedAvailableCourses.length > 0 ? (
                        paginatedAvailableCourses.map(course => (
                            <CourseCard 
                                key={course.id} 
                                course={course} 
                                onEnroll={handleEnroll} 
                                isEnrolling={enrollMutation.isPending && pendingEnrollmentId === course.id}
                                onViewDetails={handleViewDetails}
                            />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-theme-secondary p-4">No available courses found.</p>
                    )}
                </div>
            )}
          </section>
        );

      case 'myEnrollments':
        return (
          <section className="bg-theme-secondary p-6 rounded-xl shadow-2xl border border-theme">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-y-3">
                <h2 className="text-2xl font-bold text-theme-primary flex-grow">My Enrollments</h2> 
                <ViewModeToggle currentMode={enrollmentViewMode} setMode={setEnrollmentViewMode} />
            </div>
            
            {enrollmentViewMode === 'table' ? (
                <GenericTable<Enrollment>
                    data={paginatedRecentEnrollments} columns={recentEnrollmentColumns} isLoading={isLoadingEnrollments}
                    totalItems={totalEnrollmentItems} limit={limit} page={enrollmentPage} setPage={setEnrollmentPage}
                    search={enrollmentSearch} setSearch={setEnrollmentSearch} searchPlaceholder="Search my enrollments..."
                    sortField={enrollmentSortField} sortOrder={enrollmentSortOrder} handleSort={handleEnrollmentSort}
                    FaPlus={FaPlus} FaEdit={FaEdit} FaTrash={FaTrash} hasCreateButton={false} 
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {isLoadingEnrollments ? (
                        <p className="col-span-full text-center p-8 text-theme-secondary">Loading enrollments...</p>
                    ) : paginatedRecentEnrollments.length > 0 ? (
                        paginatedRecentEnrollments.map(enrollment => (
                            <EnrollmentCard 
                                key={enrollment.id} 
                                enrollment={enrollment} 
                                onUnenroll={handleUnenroll} 
                                isUnenrolling={deleteEnrollMutation.isPending && pendingUnenrollmentId === enrollment.id}
                            />
                        ))
                    ) : (
                        <p className="col-span-full text-center text-theme-secondary p-4">No recent enrollments found. Enroll in a course!</p>
                    )}
                </div>
            )}
          </section>
        );

      default:
        return <div className="p-6 text-xl text-theme-primary">Section not found.</div>;
    }
  };

  return (
    <div className="flex bg-theme-primary min-h-screen">
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <div 
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)} 
      >
        <div 
            onClick={(e) => e.stopPropagation()}
            className={`fixed inset-y-0 left-0 w-64 bg-theme-secondary shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
            <Sidebar
                role="Student"
                activeSection={activeSection}
                setActiveSection={(section: string) => {
                    setActiveSection(section as StudentActiveSection);
                    setIsSidebarOpen(false); 
                }}
                navItems={studentNavItems}
                FaBoxes={FaBoxes}
            />
        </div>
      </div>

      <div className="hidden lg:block">
        <Sidebar
          role="Student" 
          activeSection={activeSection}
          setActiveSection={setActiveSection as (section: string) => void} 
          navItems={studentNavItems}
          FaBoxes={FaBoxes}
        />
      </div>
      
      <div className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto"> 
        
        <div className="flex justify-between items-center mb-6 lg:hidden border-b border-theme pb-4">
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

        <header className="hidden lg:flex pb-4 border-b border-theme justify-between items-center">
            <div>
                <h1 className="text-4xl font-extrabold text-theme-primary">
                    {activeSection === 'dashboard' ? 'Student Dashboard' : activeSection === 'availableCourses' ? 'Course Catalog' : 'My Courses'}
                </h1>
                <p className="text-lg text-theme-secondary mt-2">
                    Welcome, <span className="font-bold text-theme-primary">{authContext?.user?.name || 'Student'}</span>
                </p>
            </div>
        </header>
        
        {renderContent()}
      </div>
      
      {selectedCourse && (
        <CourseDetailModal 
            course={selectedCourse}
            onClose={() => setSelectedCourse(null)}
            onEnroll={handleEnroll}
            isEnrolling={enrollMutation.isPending && pendingEnrollmentId === selectedCourse.id}
        />
      )}
    </div>
  );
};

export default DashboardStudent;