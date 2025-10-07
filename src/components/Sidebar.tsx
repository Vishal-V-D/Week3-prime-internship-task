import React, { useState } from "react";
import type { IconType } from "react-icons";
import { FaBoxes, FaBars, FaTimes } from "react-icons/fa";

type ActiveSection = string;

export interface NavItem {
  section: ActiveSection;
  label: string;
  Icon: IconType;
}

interface SidebarProps {
  role: "Student" | "Teacher" | "Admin";
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  navItems: NavItem[];
  FaBoxes: IconType;
}

const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeSection,
  setActiveSection,
  navItems,
  FaBoxes: LogoIcon,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  const roleColor =
    role === "Student"
      ? "from-blue-500 to-blue-700"
      : role === "Teacher"
      ? "from-purple-500 to-purple-700"
      : "from-emerald-500 to-emerald-700";

  const activeBg =
    role === "Student"
      ? "bg-blue-600"
      : role === "Teacher"
      ? "bg-purple-600"
      : "bg-emerald-600";

  return (
    <nav
      className={`${
        collapsed ? "w-20" : "w-64"
      } bg-theme-secondary text-theme-primary shadow-3xl flex flex-col h-screen sticky top-0 p-4 border-r border-theme transition-all duration-500 ease-in-out`}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <div
          className={`flex items-center gap-2 ${
            collapsed ? "justify-center w-full" : ""
          }`}
        >
          <LogoIcon
            className={`text-3xl ${
              role === "Student"
                ? "text-blue-500"
                : role === "Teacher"
                ? "text-purple-500"
                : "text-emerald-500"
            }`}
          />
          {!collapsed && (
            <h1
              className={`text-xl font-bold bg-gradient-to-r ${roleColor} text-transparent bg-clip-text`}
            >
              {role} Panel
            </h1>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition-all duration-300"
        >
          {collapsed ? <FaBars size={18} /> : <FaTimes size={18} />}
        </button>
      </div>

      {/* NAVIGATION */}
      <ul className="space-y-3 flex-1">
        {navItems.map(({ section, label, Icon: IconComponent }) => {
          const isActive = activeSection === section;
          return (
            <li key={section}>
              <button
                onClick={() => setActiveSection(section)}
                className={`flex items-center gap-3 w-full py-3 px-4 rounded-xl transition-all duration-300 ease-in-out ${
                  isActive
                    ? `${activeBg} text-white font-semibold shadow-lg scale-[1.02]`
                    : "hover:bg-gray-700/40 text-theme-secondary hover:shadow-md"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <IconComponent
                  className={`text-lg ${
                    isActive ? "scale-110" : "opacity-80 group-hover:opacity-100"
                  }`}
                />
                {!collapsed && <span>{label}</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {/* FOOTER */}
      <div
        className={`mt-auto pt-6 border-t border-theme ${
          collapsed ? "text-center" : ""
        }`}
      >
        {!collapsed ? (
          <p className="text-sm text-theme-secondary">
            Logged in as{" "}
            <span
              className={`font-semibold ${
                role === "Student"
                  ? "text-blue-400"
                  : role === "Teacher"
                  ? "text-purple-400"
                  : "text-emerald-400"
              }`}
            >
              {role}
            </span>
          </p>
        ) : (
          <p
            className={`text-xs ${
              role === "Student"
                ? "text-blue-400"
                : role === "Teacher"
                ? "text-purple-400"
                : "text-emerald-400"
            }`}
          >
            {role[0]}
          </p>
        )}
      </div>
    </nav>
  );
};

export default Sidebar;
