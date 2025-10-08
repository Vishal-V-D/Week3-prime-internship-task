import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { userService } from "../api/userService";
import { showToast } from "../utils/toast";
import { SplitScreenLayout } from "./SplitScreenLayout";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserPlus } from "react-icons/fa";

const registerSchema = yup.object({
  name: yup.string().min(3, "Name must be at least 3 characters").required("Full name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .required("Password is required"),
});

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await userService.registerStudent(data);
      showToast("Account created successfully! Redirecting to login...", "success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Registration failed. Please try again.";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div className="w-full max-w-sm">
     <h1 className="text-4xl font-extrabold mb-10 text-theme-primary text-center md:text-left flex items-center justify-center md:justify-start gap-3">
        Create Account
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="relative">
          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary-text opacity-70 transition duration-300" />
          <input
            type="text"
            placeholder="Full Name"
            {...register("name")}
            className="w-full p-4 pl-14 border-2 border-theme-border rounded-xl bg-theme-secondary text-theme-primary focus:border-cyan-600 transition duration-300"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary-text opacity-70 transition duration-300" />
          <input
            type="email"
            placeholder="Email Address"
            {...register("email")}
            className="w-full p-4 pl-14 border-2 border-theme-border rounded-xl bg-theme-secondary text-theme-primary focus:border-cyan-600 transition duration-300"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="relative">
          <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary-text opacity-70 transition duration-300" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            {...register("password")}
            className="w-full p-4 pl-14 pr-14 border-2 border-theme-border rounded-xl bg-theme-secondary text-theme-primary focus:border-cyan-600 transition duration-300"
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-theme-secondary-text hover:text-cyan-600 transition duration-300"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-600 text-white p-4 rounded-xl text-lg font-semibold hover:bg-cyan-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
        >
          {loading ? (
            <>
              <FaUserPlus className="animate-spin" /> Creating Account...
            </>
          ) : (
            <>
              <FaUserPlus /> Register
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-base text-theme-secondary-text">
        Already have an account?
        <Link
          to="/login"
          className="text-cyan-600 font-medium hover:text-cyan-700 transition duration-300 ml-1"
        >
          Login
        </Link>
      </p>
    </div>
  );

  return (
    <SplitScreenLayout formSide={formContent} isLogin={false} />
  );
}