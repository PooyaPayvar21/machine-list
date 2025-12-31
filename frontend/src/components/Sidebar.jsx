import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  List,
  Settings,
  LogOut,
  Menu,
  X,
  UserPlus,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
  }, []);

  const menuItems = [
    { path: "/dashboard", name: "Dashboard", icon: LayoutDashboard },
    { path: "/machine-list", name: "Machine Registration List", icon: List },
  ];

  if (user && user.role === "admin") {
    menuItems.push({
      path: "/register-user",
      name: "Register User",
      icon: UserPlus,
    });
  }

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout/");
      localStorage.removeItem("user");
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if API fails, clear local state and redirect
      localStorage.removeItem("user");
      navigate("/");
    }
  };

  return (
    <motion.div
      className={`fixed left-0 top-0 h-full bg-gray-900 text-white shadow-xl z-50 ${
        isOpen ? "w-64" : "w-20"
      } hidden md:block transition-all duration-300 ease-in-out`}
      initial={false}
      animate={{ width: isOpen ? 256 : 80 }}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 h-16">
          {isOpen && (
            <h1 className="text-xl font-bold text-blue-400 truncate">
              CMMS System
            </h1>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded hover:bg-gray-800 transition-colors"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 space-y-2 px-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center p-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <item.icon size={24} className="min-w-6" />
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="ml-3 whitespace-nowrap overflow-hidden"
                >
                  {item.name}
                </motion.span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
          >
            <LogOut size={24} />
            {isOpen && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
