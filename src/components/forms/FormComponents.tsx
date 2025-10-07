import React, { useState } from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  error?: string;
  [x: string]: any;
}
export const InputField = ({ label, type = "text", error, ...props }: InputFieldProps) => (
  <div className="mb-4">
    <label className="block text-gray-600 mb-1">{label}</label>
    <input 
      type={type} 
      className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded-lg px-4 py-2" 
      {...props} 
    />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

export const ModalButtons = ({ onCancel, saveText = "Save" }: { onCancel: () => void; saveText?: string }) => (
  <div className="flex justify-end gap-3 mt-4">
    <button type="button" onClick={onCancel} className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">
      Cancel
    </button>
    <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
      {saveText}
    </button>
  </div>
);

export const ChangePasswordField = ({
  register,
  errors,
}: {
  register: any;
  errors: any;
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-4">
      {!showPassword ? (
        <button
          type="button"
          onClick={() => setShowPassword(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 px-4 rounded"
        >
          Change Password
        </button>
      ) : (
        <InputField
          label="New Password"
          type="password"
          {...register("password")}
          error={errors.password?.message}
        />
      )}
    </div>
  );
};