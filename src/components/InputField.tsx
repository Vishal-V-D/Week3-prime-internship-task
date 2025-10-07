import React from "react";

interface InputFieldProps {
  label: string;
  type?: string;
  error?: string;
  [x: string]: any;
}

const InputField: React.FC<InputFieldProps> = ({ label, type = "text", error, ...props }) => {
  return (
    <div className="mb-4">
      <label className="block text-theme-secondary mb-1">{label}</label>
      <input
        type={type}
        className="w-full bg-theme-primary text-theme-primary border border-theme rounded-lg px-4 py-2"
        {...props}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};

export default InputField;
