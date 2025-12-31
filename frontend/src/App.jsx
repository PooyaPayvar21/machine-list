import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MachineList from "./pages/MachineList";
import RegisterUser from "./pages/RegisterUser";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/machine-list" element={<MachineList />} />
        <Route path="/register-user" element={<RegisterUser />} />
      </Routes>
    </>
  );
}

export default App;
