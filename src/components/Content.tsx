import React, { useMemo } from 'react';
import type { IconType } from 'react-icons';
import GenericTable  from './tables/GenericTable'; 
import type { GenericTableProps, Column, SortOrder } from './tables/GenericTable'; // Imported Column type

type ActiveSection = 'students' | 'courses' | 'enrollments' | 'recent';


interface Student { id: number; name: string; email: string; createdAt?: string; role?: string; }
interface Course { id: number; title: string; description: string; duration: number; category: string; createdAt?: string; }
interface Enrollment { 
  id: number; 
  courseId: number; 
  studentId: number; 
  course?: { title: string }; 
  studentName?: string; 
  studentEmail?: string; 
  createdAt?: string; 
  student?: { name: string, email?: string }; 
}


interface ContentProps {
  section: ActiveSection;
  
  // Student Props
  students: Student[];
  loadingStudents: boolean;
  studentTotal: number;
  studentLimit: number;
  studentPage: number;
  setStudentPage: (page: number) => void;
  studentSearch: string;
  // CORRECTED TYPE: setSearch takes a string and returns void
  setStudentSearch: (search: string) => void; 
  studentSortField: string;
  studentSortOrder: SortOrder;
  handleSortStudent: (field: string) => void;
  handleEditStudent: (student: Student) => void;
  handleDeleteStudent: (id: number) => void;
  setIsCreatingStudent: (isCreating: boolean) => void;

  // Course Props
  courses: Course[];
  loadingCourses: boolean;
  courseTotal: number;
  courseLimit: number;
  coursePage: number;
  setCoursePage: (page: number) => void;
  courseSearch: string;
  // CORRECTED TYPE: setSearch takes a string and returns void
  setCourseSearch: (search: string) => void;
  courseSortField: string;
  courseSortOrder: SortOrder;
  handleSortCourse: (field: string) => void;
  handleEditCourse: (course: Course) => void;
  handleDeleteCourse: (id: number) => void;
  setIsCreatingCourse: (isCreating: boolean) => void;

  // Enrollment Props
  enrollments: Enrollment[];
  loadingEnrollments: boolean;
  enrollmentSearch: string;
  // CORRECTED TYPE: setSearch takes a string and returns void
  setEnrollmentSearch: (search: string) => void;
  handleDeleteEnrollment: (id: number) => void;
  deleteEnrollmentMutation: { isPending: boolean };

  // Recent/Icons
  recentStudents: Student[];
  recentCourses: Course[];
  FaPlus: IconType;
  FaEdit: IconType;
  FaTrash: IconType;
  FaClipboardList: IconType;
  FaBookOpen: IconType;
  FaTachometerAlt: IconType;
  FaUserGraduate: IconType;
}


const Content: React.FC<ContentProps> = (props) => {
  const { 
    section, 
    FaPlus, FaEdit, FaTrash, 
    FaClipboardList, FaBookOpen, FaUserGraduate,
    recentStudents, recentCourses
  } = props;

  // --- Enrollment Filter Logic ---
  const filteredEnrollments = useMemo(() => {
    return props.enrollments.filter(e => 
      e.course?.title?.toLowerCase().includes(props.enrollmentSearch.toLowerCase()) || 
      e.studentName?.toLowerCase().includes(props.enrollmentSearch.toLowerCase()) || 
      e.studentEmail?.toLowerCase().includes(props.enrollmentSearch.toLowerCase()) || 
      e.createdAt?.toLowerCase().includes(props.enrollmentSearch.toLowerCase())
    );
  }, [props.enrollments, props.enrollmentSearch]);

  // --- Column Definitions: Students ---
  const studentColumns: Column<Student>[] = useMemo(() => [
    { key: 'id', header: 'ID', isSortable: true, render: (s) => s.id },
    { key: 'name', header: 'Name', isSortable: true, render: (s) => <span className="font-medium">{s.name}</span> },
    { key: 'email', header: 'Email', isSortable: true, render: (s) => s.email },
    { key: 'createdAt', header: 'Created At', isSortable: true, render: (s) => s.createdAt ? new Date(s.createdAt).toLocaleString() : '-' },
    { key: 'actions', header: 'Actions', isSortable: false, render: (s, { FaEdit, FaTrash }) => (
      <div className="flex gap-2">
        <button onClick={() => props.handleEditStudent(s)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
        <button onClick={() => props.handleDeleteStudent(s.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
      </div>
    )},
  ], [props.handleEditStudent, props.handleDeleteStudent]);

  // --- Column Definitions: Courses ---
  const courseColumns: Column<Course>[] = useMemo(() => [
    { key: 'id', header: 'ID', isSortable: true, render: (c) => c.id },
    { key: 'title', header: 'Title', isSortable: true, render: (c) => <span className="font-semibold">{c.title}</span> },
    // Use a key that exists on Course, even if the render function uses substrings
    { key: 'description', header: 'Description', isSortable: false, render: (c) => c.description.substring(0, 50) + '...' },
    { key: 'duration', header: 'Duration (hrs)', isSortable: true, render: (c) => `${c.duration} hrs` },
    { key: 'category', header: 'Category', isSortable: true, render: (c) => c.category },
    { key: 'actions', header: 'Actions', isSortable: false, render: (c, { FaEdit, FaTrash }) => (
      <div className="flex gap-2">
        <button onClick={() => props.handleEditCourse(c)} className="text-blue-600 hover:text-blue-800"><FaEdit /></button>
        <button onClick={() => props.handleDeleteCourse(c.id)} className="text-red-600 hover:text-red-800"><FaTrash /></button>
      </div>
    )},
  ], [props.handleEditCourse, props.handleDeleteCourse]);

  // --- Column Definitions: Enrollments ---
  // We use type assertion (as Column<Enrollment>[]) here to tell TypeScript that while 
  // 'courseTitle', 'studentName', and 'studentEmail' aren't keys of Enrollment, 
  // GenericTable can handle them as synthetic columns. 
  // We must define these keys explicitly if GenericTable's Column type only allows 'keyof T' | 'actions'.
  // Assuming 'GenericTable' can handle synthetic keys when 'isSortable: false', 
  // we cast the array to the correct type to satisfy the compiler.
  const enrollmentColumns = useMemo(() => [
    { key: 'id', header: 'ID', isSortable: false, render: (e: Enrollment) => e.id },
    { key: 'courseTitle', header: 'Course Title', isSortable: false, render: (e: Enrollment) => e.course?.title || `ID: ${e.courseId}` },
    { key: 'studentName', header: 'Student Name', isSortable: false, render: (e: Enrollment) => e.studentName || e.student?.name || `ID: ${e.studentId}` },
    { key: 'studentEmail', header: 'Student Email', isSortable: false, render: (e: Enrollment) => e.studentEmail || e.student?.email || '-' },
    { key: 'createdAt', header: 'Date Enrolled', isSortable: false, render: (e: Enrollment) => e.createdAt ? new Date(e.createdAt).toLocaleDateString() : 'N/A' },
    { key: 'actions', header: 'Actions', isSortable: false, render: (e: Enrollment, { FaTrash }: { FaTrash: IconType }) => (
      <button 
        onClick={() => props.handleDeleteEnrollment(e.id)} 
        className="text-red-600 hover:text-red-800 disabled:opacity-50"
        disabled={props.deleteEnrollmentMutation.isPending}
      >
        <FaTrash />
      </button>
    )},
  ], [props.handleDeleteEnrollment, props.deleteEnrollmentMutation.isPending]) as Column<Enrollment>[];


  // --- Render Switch ---
  switch (section) {
    case 'students':
      return (
        <>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><FaUserGraduate className="text-green-600" /> Manage Students</h2>
          <GenericTable<Student> 
            data={props.students}
            columns={studentColumns}
            isLoading={props.loadingStudents}
            
            totalItems={props.studentTotal}
            limit={props.studentLimit}
            page={props.studentPage}
            setPage={props.setStudentPage}
            search={props.studentSearch}
            // NO CASTING NEEDED due to ContentProps update
            setSearch={props.setStudentSearch} 
            searchPlaceholder="Search students by name or email..."

            sortField={props.studentSortField}
            sortOrder={props.studentSortOrder}
            handleSort={props.handleSortStudent}
            
            hasCreateButton={true}
            onCreate={() => props.setIsCreatingStudent(true)}
            createButtonLabel="Add Student"

            FaPlus={FaPlus} FaEdit={FaEdit} FaTrash={FaTrash}
          />
        </>
      );

    case 'courses':
      return (
        <>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><FaClipboardList className="text-purple-600" /> Manage Courses</h2>
          <GenericTable<Course> 
            data={props.courses}
            columns={courseColumns}
            isLoading={props.loadingCourses}
            
            totalItems={props.courseTotal}
            limit={props.courseLimit}
            page={props.coursePage}
            setPage={props.setCoursePage}
            search={props.courseSearch}
            // NO CASTING NEEDED due to ContentProps update
            setSearch={props.setCourseSearch}
            searchPlaceholder="Search courses by title or category..."

            sortField={props.courseSortField}
            sortOrder={props.courseSortOrder}
            handleSort={props.handleSortCourse}
            
            hasCreateButton={true}
            onCreate={() => props.setIsCreatingCourse(true)}
            createButtonLabel="Add Course"

            FaPlus={FaPlus} FaEdit={FaEdit} FaTrash={FaTrash}
          />
        </>
      );

    case 'enrollments':
      return (
        <>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2"><FaBookOpen className="text-blue-600" /> All Enrollments</h2>
          <GenericTable<Enrollment> 
            data={filteredEnrollments} 
            columns={enrollmentColumns}
            isLoading={props.loadingEnrollments}
            
            totalItems={filteredEnrollments.length} 
            page={1} limit={100} setPage={undefined}

            search={props.enrollmentSearch}
            // NO CASTING NEEDED due to ContentProps update
            setSearch={props.setEnrollmentSearch}
            searchPlaceholder="Search enrollments..."

            sortField={'id'} 
            sortOrder={'ASC'}
            handleSort={() => {}} 
            
            hasCreateButton={false}

            FaPlus={FaPlus} FaEdit={FaEdit} FaTrash={FaTrash}
            isActionPending={props.deleteEnrollmentMutation.isPending}
          />
        </>
      );

    case 'recent':
      return (
        <>
           <h2 className="text-3xl font-bold mb-6">Recent Activity Overview 📊</h2>

           { (recentStudents.length > 0 || recentCourses.length > 0) ? (
            <div className="mt-8 space-y-8">
              {recentStudents.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><FaUserGraduate className="text-green-500"/> Recently Added Students</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentStudents.map((student: Student) => (
                      <div key={student.id} className="bg-theme-secondary p-4 rounded-xl shadow-md">
                        <h4 className="text-lg font-semibold">{student.name}</h4>
                        <p className="text-theme-primary">{student.email}</p>
                        <p className="text-xs text-gray-400">{student.createdAt ? new Date(student.createdAt).toLocaleString() : "-"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recentCourses.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><FaClipboardList className="text-purple-500"/> Recently Added Courses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentCourses.map((course: Course) => (
                      <div key={course.id} className="bg-theme-secondary p-4 rounded-xl shadow-md">
                        <h4 className="text-lg font-semibold">{course.title}</h4>
                        <p className="text-theme-primary">{course.category}</p>
                        <p className="text-sm text-theme-primary/70">{course.duration} hrs</p>
                        <p className="text-xs text-gray-400">{course.createdAt ? new Date(course.createdAt).toLocaleString() : "-"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">No recent activity to display.</p>
          )}
        </>
      );

    default:
      return <div>Select a section from the sidebar.</div>;
  }
};

export default Content;