import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Wrench,
  ArrowUpRight,
  Activity,
  Layers,
  Factory,
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const Dashboard = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await axios.get("/api/machines/", {
        withCredentials: true,
      });
      setMachines(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching machines:", error);
      setLoading(false);
    }
  };

  // Calculate KPIs
  const totalMachines = machines.length;
  const criticalMachines = machines.filter(
    (m) => m.criticality_level === "critical"
  ).length;
  const highPriorityMachines = machines.filter(
    (m) => m.criticality_level === "high"
  ).length;
  const sectionsCount = new Set(machines.map((m) => m.section)).size;

  const kpiData = [
    {
      title: "Total Machines",
      value: totalMachines,
      change: "Active",
      icon: Wrench,
      color: "bg-blue-500",
    },
    {
      title: "Critical Machines",
      value: criticalMachines,
      change: "Attention",
      icon: AlertCircle,
      color: "bg-red-500",
    },
    {
      title: "High Priority",
      value: highPriorityMachines,
      change: "Monitor",
      icon: Clock,
      color: "bg-amber-500",
    },
    {
      title: "Total Sections",
      value: sectionsCount,
      change: "Operational",
      icon: Layers,
      color: "bg-green-500",
    },
  ];

  // Prepare Chart Data

  // 1. Machines per Section (Bar Chart)
  const machinesPerSection = machines.reduce((acc, curr) => {
    const section = curr.section || "Unknown";
    acc[section] = (acc[section] || 0) + 1;
    return acc;
  }, {});

  const barChartData = Object.keys(machinesPerSection)
    .map((key) => ({
      name: key,
      count: machinesPerSection[key],
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 sections

  // 2. Criticality Distribution (Pie Chart)
  const criticalityData = [
    { name: "Critical", value: criticalMachines },
    { name: "High", value: highPriorityMachines },
    {
      name: "Medium",
      value: machines.filter((m) => m.criticality_level === "medium").length,
    },
    {
      name: "Low",
      value: machines.filter((m) => m.criticality_level === "low").length,
    },
  ].filter((item) => item.value > 0);

  const COLORS = ["#EF4444", "#F59E0B", "#3B82F6", "#10B981"];
  const PIE_COLORS = {
    Critical: "#EF4444", // Red
    High: "#F59E0B", // Amber
    Medium: "#3B82F6", // Blue
    Low: "#10B981", // Green
  };

  // Recently Added Machines (Top 5)
  // Assuming ID is incremental or using created_at if available, but simple sort by ID desc works for now
  // Or if created_at is available in API response. Assuming it is based on models.py
  const recentMachines = [...machines]
    .sort((a, b) => {
      return new Date(b.created_at) - new Date(a.created_at);
    })
    .slice(0, 5);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Dashboard Overview
            </h1>
            <p className="text-gray-500 mt-1">
              Real-time insights from machine inventory
            </p>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpiData.map((kpi, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-sm font-medium">
                    {kpi.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-2">
                    {kpi.value}
                  </h3>
                </div>
                <div className={`p-3 rounded-lg ${kpi.color} bg-opacity-10`}>
                  <kpi.icon
                    className={`w-6 h-6 ${kpi.color.replace("bg-", "text-")}`}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-gray-500 font-medium">{kpi.change}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart: Machines per Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              Machines per Section
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280" }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6B7280" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    cursor={{ fill: "#F3F4F6" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    fill="#3B82F6"
                    radius={[4, 4, 0, 0]}
                    name="Machines"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Side Panel: Criticality Distribution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-bold text-gray-800 mb-6">
              Criticality Distribution
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={criticalityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {criticalityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          PIE_COLORS[entry.name] ||
                          COLORS[index % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4 flex-wrap">
                {criticalityData.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center text-xs text-gray-600"
                  >
                    <span
                      className="w-2 h-2 rounded-full mr-1"
                      style={{
                        backgroundColor:
                          PIE_COLORS[entry.name] ||
                          COLORS[index % COLORS.length],
                      }}
                    ></span>
                    {entry.name}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Machines List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">
              Recently Registered Machines
            </h2>
            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Machine Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criticality
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added On
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentMachines.map((machine) => (
                  <tr
                    key={machine.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {machine.machine_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {machine.section}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {machine.machine_model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full 
                        ${
                          machine.criticality_level === "critical"
                            ? "bg-red-100 text-red-700"
                            : machine.criticality_level === "high"
                            ? "bg-orange-100 text-orange-700"
                            : machine.criticality_level === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {machine.criticality_level?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(machine.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {recentMachines.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-4 text-center text-gray-500"
                    >
                      No machines registered yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Dashboard;
