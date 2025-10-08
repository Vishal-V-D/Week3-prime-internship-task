import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { Link, useLocation } from "react-router-dom";
import {
  FaSun,
  FaMoon,
  FaTachometerAlt,
  FaSignOutAlt,
  FaSignInAlt,
  FaUserPlus,
  FaEnvelope,
  FaChevronDown
} from "react-icons/fa";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext)!;
  const { theme, toggleTheme } = useContext(ThemeContext);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide navbar on login/register pages
  if (location.pathname === "/login" || location.pathname === "/register") return null;

  const getDashboardPath = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/dashboard/admin";
    if (user.role === "teacher") return "/dashboard/teacher";
    return "/dashboard/student";
  };


  const navItems = user
    ? [
        { label: "Dashboard", to: getDashboardPath(), icon: FaTachometerAlt },
        { label: "Contact", to: "/contact", icon: FaEnvelope },
        { label: "Logout", onClick: logout, icon: FaSignOutAlt },
      ]
    : [
        { label: "Login", to: "/login", icon: FaSignInAlt },
        { label: "Sign Up", to: "/register", icon: FaUserPlus },
        { label: "Contact", to: "/contact", icon: FaEnvelope },
      ];

  return (
    <nav className="sticky top-0 z-50 bg-theme-secondary shadow-md transition-colors duration-500 text-theme-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
      
          <Link
            to="/"
            className="text-2xl font-extrabold text-cyan-600 hover:text-cyan-500 transition-colors duration-300"
          >
            SmartLearn
          </Link>

    
          <div className="flex items-center space-x-4">
          
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-cyan-100 dark:bg-gray-700 hover:bg-cyan-200 dark:hover:bg-gray-600 transition duration-300 text-cyan-600 dark:text-gray-200"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>

         
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item, index) =>
                item.to ? (
                  <Link
                    key={index}
                    to={item.to}
                    className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium hover:bg-cyan-600 hover:text-white transition-colors duration-300"
                  >
                    <item.icon /> {item.label}
                  </Link>
                ) : (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="flex items-center gap-1 px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors duration-300"
                  >
                    <item.icon /> {item.label}
                  </button>
                )
              )}
            </div>

         
            <div className="md:hidden relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors duration-300"
              >
                Explore <FaChevronDown className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <ul className="absolute right-0 mt-2 w-40 bg-theme-secondary border border-gray-300 dark:border-gray-700 rounded-md shadow-lg overflow-hidden z-50">
                  {navItems.map((item, index) => (
                    <li key={index}>
                      {item.to ? (
                        <Link
                          to={item.to}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-theme-primary hover:bg-gray-200 dark:hover:bg-gray-400"
                        >
                          <item.icon /> {item.label}
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            item.onClick?.();
                            setMenuOpen(false);
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-theme-primary hover:bg-gray-200 dark:hover:bg-gray-700 w-full text-left"
                        >
                          <item.icon /> {item.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
