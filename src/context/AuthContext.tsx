import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../api/userService";
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
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await userService.getMe();
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch {
        setUser(null);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async ({ email, password, role }: LoginData) => {
    const res = await userService.login({ email, password, role });
    setUser(res.data.user);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    if (res.data.user.role === "admin") navigate("/dashboard/admin");
    else if (res.data.user.role === "teacher") navigate("/dashboard/teacher");
    else navigate("/dashboard/student");
  };

  const logout = async () => {
    try {
      await userService.logout();
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
