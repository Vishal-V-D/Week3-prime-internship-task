import { useContext, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import { SplitScreenLayout } from "./SplitScreenLayout";
import { FaEnvelope, FaLock, FaUserShield, FaEye, FaEyeSlash } from "react-icons/fa";


const loginSchema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  rememberMe: yup.boolean().optional(),
});

export default function Login() {
  const { login } = useContext(AuthContext)!;
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await login(data);
      showToast("✅ Welcome back! Logging you in...", "success");
    } catch (err: any) {
      const status = err.response?.status;
      let errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      if (status === 400 || status === 401) {
        errorMessage = "⚠️ Invalid email or password.";
      } else if (status === 500) {
        errorMessage = "🚨 Server error. Please try again later.";
      }
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <div className="w-full max-w-sm">
<h1 className="text-4xl font-extrabold mb-10 text-theme-primary text-center md:text-left flex items-center justify-center md:justify-start gap-3">
        Sign In
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="relative">
          <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-secondary-text opacity-70 transition duration-300" />
          <input
            type="email"
            placeholder="Username or Email"
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
            onClick={() => setShowPassword((p) => !p)}
            className="absolute inset-y-0 right-0 flex items-center px-4 text-theme-secondary-text hover:text-cyan-600 transition duration-300"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <div className="flex justify-between items-center text-sm mt-2">
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              {...register("rememberMe")}
              className="h-4 w-4 text-cyan-600 border-theme-border rounded focus:ring-cyan-500 transition duration-300"
            />
            <label htmlFor="remember-me" className="ml-2 text-theme-secondary-text">
              Remember me
            </label>
          </div>
          <Link to="" className="text-cyan-600 hover:text-cyan-700 transition duration-300 font-medium">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-cyan-600 text-white p-4 rounded-xl text-lg font-semibold hover:bg-cyan-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-4"
        >
          {loading ? (
            <>
              <FaUserShield className="animate-spin" /> Logging in...
            </>
          ) : (
            <>
              <FaUserShield /> Sign In
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-base text-theme-secondary-text">
        New here?
        <Link
          to="/register"
          className="text-cyan-600 font-medium hover:text-cyan-700 transition duration-300 ml-1"
        >
          Create an Account
        </Link>
      </p>
    </div>
  );

  return (
    <SplitScreenLayout formSide={formContent} isLogin={true} />
  );
}