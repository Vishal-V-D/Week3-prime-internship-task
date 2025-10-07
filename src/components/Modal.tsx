import React from 'react';
import type { UseFormRegister, UseFormHandleSubmit, FieldErrors } from "react-hook-form";

interface Student {
  id: number;
  name: string;
  email: string;
}
interface Course {
  id: number;
  title: string;
  description: string;
  duration: number;
  category: string;
}
interface StudentFormValues {
  name: string;
  email: string;
  password?: string;
}
interface CourseFormValues {
  title: string;
  description: string;
  duration: number;
  category: string;
}

interface ModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
export const ModalWrapper: React.FC<ModalWrapperProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b p-5">
          <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl leading-none">&times;</button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};


interface ModalsProps {
  isCreatingStudent: boolean;
  setIsCreatingStudent: (isCreating: boolean) => void;
  isEditingStudent: boolean;
  setIsEditingStudent: (isEditing: boolean) => void;
  currentStudent: Student | null;
  createRegisterStudent: UseFormRegister<StudentFormValues>;
  handleCreateSubmitStudent: UseFormHandleSubmit<StudentFormValues>;
  createErrorsStudent: FieldErrors<StudentFormValues>;
  createStudentMutation: { isPending: boolean };
  editRegisterStudent: UseFormRegister<StudentFormValues>;
  handleEditSubmitStudent: UseFormHandleSubmit<StudentFormValues>;
  editErrorsStudent: FieldErrors<StudentFormValues>;
  updateStudentMutation: { isPending: boolean };
  handleCreateStudentSubmit: (data: StudentFormValues) => void;
  handleEditStudentSubmit: (data: StudentFormValues) => void;
  
  isCreatingCourse: boolean;
  setIsCreatingCourse: (isCreating: boolean) => void;
  isEditingCourse: boolean;
  setIsEditingCourse: (isEditing: boolean) => void;
  currentCourse: Course | null;
  createRegisterCourse: UseFormRegister<CourseFormValues>;
  handleCreateSubmitCourse: UseFormHandleSubmit<CourseFormValues>;
  createErrorsCourse: FieldErrors<CourseFormValues>;
  createCourseMutation: { isPending: boolean };
  editRegisterCourse: UseFormRegister<CourseFormValues>;
  handleEditSubmitCourse: UseFormHandleSubmit<CourseFormValues>;
  editErrorsCourse: FieldErrors<CourseFormValues>;
  updateCourseMutation: { isPending: boolean };
  handleCreateCourseSubmit: (data: CourseFormValues) => void;
  handleEditCourseSubmit: (data: CourseFormValues) => void;
}


const CreateStudentModal: React.FC<ModalsProps> = (props) => (
  <ModalWrapper isOpen={props.isCreatingStudent} onClose={() => props.setIsCreatingStudent(false)} title="Create New Student">
    <form onSubmit={props.handleCreateSubmitStudent(props.handleCreateStudentSubmit)}>
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Name</label>
        <input type="text" {...props.createRegisterStudent("name")} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" />
        <p className="text-red-500 text-sm">{props.createErrorsStudent.name?.message}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Email</label>
        <input type="email" {...props.createRegisterStudent("email")} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" />
        <p className="text-red-500 text-sm">{props.createErrorsStudent.email?.message}</p>
      </div>
      <div className="mb-6">
        <label className="block text-gray-600 mb-1">Password</label>
        <input type="password" {...props.createRegisterStudent("password")} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" />
        <p className="text-red-500 text-sm">{props.createErrorsStudent.password?.message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => props.setIsCreatingStudent(false)} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Cancel</button>
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded" disabled={props.createStudentMutation.isPending}>
          {props.createStudentMutation.isPending ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  </ModalWrapper>
);

const EditStudentModal: React.FC<ModalsProps> = (props) => (
  <ModalWrapper isOpen={props.isEditingStudent} onClose={() => props.setIsEditingStudent(false)} title={`Edit Student: ${props.currentStudent?.name}`}>
    <form onSubmit={props.handleEditSubmitStudent(props.handleEditStudentSubmit)}>
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Name</label>
        <input type="text" {...props.editRegisterStudent("name")} defaultValue={props.currentStudent?.name || ''} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" />
        <p className="text-red-500 text-sm">{props.editErrorsStudent.name?.message}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Email</label>
        <input type="email" {...props.editRegisterStudent("email")} defaultValue={props.currentStudent?.email || ''} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" />
        <p className="text-red-500 text-sm">{props.editErrorsStudent.email?.message}</p>
      </div>
      <div className="mb-6">
        <label className="block text-gray-600 mb-1">New Password (Leave blank to keep old)</label>
        <input type="password" {...props.editRegisterStudent("password")} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" />
        <p className="text-red-500 text-sm">{props.editErrorsStudent.password?.message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => props.setIsEditingStudent(false)} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Cancel</button>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded" disabled={props.updateStudentMutation.isPending}>
          {props.updateStudentMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </ModalWrapper>
);

const CreateCourseModal: React.FC<ModalsProps> = (props) => (
  <ModalWrapper isOpen={props.isCreatingCourse} onClose={() => props.setIsCreatingCourse(false)} title="Create New Course">
    <form onSubmit={props.handleCreateSubmitCourse(props.handleCreateCourseSubmit)}>
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Title</label>
        <input type="text" {...props.createRegisterCourse("title")} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" />
        <p className="text-red-500 text-sm">{props.createErrorsCourse.title?.message}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Description</label>
        <textarea {...props.createRegisterCourse("description")} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" rows={3}></textarea>
        <p className="text-red-500 text-sm">{props.createErrorsCourse.description?.message}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Duration (hrs)</label>
        <input type="number" {...props.createRegisterCourse("duration")} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" />
        <p className="text-red-500 text-sm">{props.createErrorsCourse.duration?.message}</p>
      </div>
      <div className="mb-6">
        <label className="block text-gray-600 mb-1">Category</label>
        <input type="text" {...props.createRegisterCourse("category")} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" />
        <p className="text-red-500 text-sm">{props.createErrorsCourse.category?.message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => props.setIsCreatingCourse(false)} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Cancel</button>
        <button type="submit" className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded" disabled={props.createCourseMutation.isPending}>
          {props.createCourseMutation.isPending ? 'Creating...' : 'Create'}
        </button>
      </div>
    </form>
  </ModalWrapper>
);

const EditCourseModal: React.FC<ModalsProps> = (props) => (
  <ModalWrapper isOpen={props.isEditingCourse} onClose={() => props.setIsEditingCourse(false)} title={`Edit Course: ${props.currentCourse?.title}`}>
    <form onSubmit={props.handleEditSubmitCourse(props.handleEditCourseSubmit)}>
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Title</label>
        <input type="text" {...props.editRegisterCourse("title")} defaultValue={props.currentCourse?.title || ''} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" />
        <p className="text-red-500 text-sm">{props.editErrorsCourse.title?.message}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Description</label>
        <textarea {...props.editRegisterCourse("description")} defaultValue={props.currentCourse?.description || ''} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" rows={3}></textarea>
        <p className="text-red-500 text-sm">{props.editErrorsCourse.description?.message}</p>
      </div>
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Duration (hrs)</label>
        <input type="number" {...props.editRegisterCourse("duration")} defaultValue={props.currentCourse?.duration || 0} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" />
        <p className="text-red-500 text-sm">{props.editErrorsCourse.duration?.message}</p>
      </div>
      <div className="mb-6">
        <label className="block text-gray-600 mb-1">Category</label>
        <input type="text" {...props.editRegisterCourse("category")} defaultValue={props.currentCourse?.category || ''} className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" />
        <p className="text-red-500 text-sm">{props.editErrorsCourse.category?.message}</p>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => props.setIsEditingCourse(false)} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">Cancel</button>
        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded" disabled={props.updateCourseMutation.isPending}>
          {props.updateCourseMutation.isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  </ModalWrapper>
);


const Modals: React.FC<ModalsProps> = (props) => {
  return (
    <>
      <CreateStudentModal {...props} />
      <EditStudentModal {...props} />
      <CreateCourseModal {...props} />
      <EditCourseModal {...props} />
    </>
  );
};

export default Modals;