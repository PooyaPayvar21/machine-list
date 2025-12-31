import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      <motion.main
        className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "ml-64" : "ml-20"
        }`}
        layout
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </motion.main>
    </div>
  );
};

export default Layout;
