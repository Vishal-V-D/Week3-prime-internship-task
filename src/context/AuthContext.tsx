import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../api/userService";
import { logout as logoutUtil } from "../utils/authUtils";
import type { ReactNode } from "react";

interface LoginData {
  email: string;
  password: string;
  role: string;
}

interface AuthContextType {
  user: any;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 Checking authentication...");
      
      try {
        const res = await userService.getMe();
        console.log("✅ Auth successful:", res.data);
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (error: any) {
        console.log("❌ Auth failed:", error.response?.status, error.message);
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        console.log("✅ Loading complete");
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async ({ email, password, role }: LoginData) => {
    console.log("🔐 Logging in...");
    const res = await userService.login({ email, password, role });
    console.log("✅ Login successful:", res.data);
    
    setUser(res.data.user);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    if (res.data.user.role === "admin") navigate("/dashboard/admin");
    else if (res.data.user.role === "teacher") navigate("/dashboard/teacher");
    else navigate("/dashboard/student");
  };

  const logout = () => {
    console.log("🚪 Logging out...");
    setUser(null);
    localStorage.removeItem("user");
    logoutUtil();
    navigate("/login");
  };

  console.log("📊 Auth State:", { user: user?.email || "none", loading });

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};