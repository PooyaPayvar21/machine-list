import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  FileDown,
} from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

// Form Section Component
const FormSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">
      {title}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {children}
    </div>
  </div>
);

// Input Field Component
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  options = null,
  className = "",
}) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {type === "select" ? (
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    ) : type === "textarea" ? (
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows="3"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
      />
    ) : (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
      />
    )}
  </div>
);

const SortIcon = ({ columnKey, sortConfig }) => {
  if (sortConfig.key !== columnKey)
    return <div className="w-4 h-4 ml-1 inline-block" />;
  return sortConfig.direction === "asc" ? (
    <ChevronUp className="w-4 h-4 ml-1 inline-block" />
  ) : (
    <ChevronDown className="w-4 h-4 ml-1 inline-block" />
  );
};

const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

const MachineList = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Initial state matching Django MachineRegistration model
  const initialFormState = {
    section: "",
    machine_name: "",
    machine_code: "",
    machine_model: "",
    machine_serial: "",
    manufacture_year: "",
    company_entry_date: "",
    installation_date: "",
    criticality_level: "medium",
    location_name: "",
    location_code: "",

    // Dimensions & Weight
    length_mm: "",
    width_mm: "",
    height_mm: "",
    weight_kg: "",

    // Technical
    foundation_type: "",
    automation_level: "",

    // Warranty & Guarantee
    has_guarantee: false,
    guarantee_expiry_date: "",
    has_warranty: false,
    warranty_expiry_date: "",

    // Electrical
    current_type: "AC",
    phase_count: "",
    nominal_voltage: "",
    nominal_power: "",
    nominal_current: "",
    electrical_technical_description: "",
    maximum_consumption: "",

    // Mechanical
    operating_pressure: "",
    lubricants: [], // Changed from single fields to array

    // Vendor
    supplier_company_name: "",
    supplier_phone: "",
    supplier_address: "",

    // Manufacturer
    manufacturer_company_name: "",
    manufacturer_phone: "",
    manufacturer_address: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  // Fetch Machines
  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      const response = await axios.get("/api/machines/", {
        withCredentials: true,
      });
      // Ensure response.data is an array
      if (Array.isArray(response.data)) {
        setMachines(response.data);
      } else if (response.data && Array.isArray(response.data.results)) {
        // Handle paginated response
        setMachines(response.data.results);
      } else {
        console.error("Unexpected API response format:", response.data);
        setMachines([]);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching machines:", error);
      setMachines([]); // Ensure machines is always an array
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleEdit = (machine) => {
    setFormData({
      ...initialFormState, // Reset first to ensure all fields exist
      ...machine,
      // Ensure booleans are booleans
      has_guarantee: Boolean(machine.has_guarantee),
      has_warranty: Boolean(machine.has_warranty),
      // Ensure nulls become empty strings for inputs
      length_mm: machine.length_mm || "",
      width_mm: machine.width_mm || "",
      height_mm: machine.height_mm || "",
      weight_kg: machine.weight_kg || "",
      operating_pressure: machine.operating_pressure || "",
      maximum_consumption: machine.maximum_consumption || "",
      guarantee_expiry_date: machine.guarantee_expiry_date || "",
      warranty_expiry_date: machine.warranty_expiry_date || "",
      installation_date: machine.installation_date || "",
      electrical_technical_description:
        machine.electrical_technical_description || "",
      lubricant_description: machine.lubricant_description || "",
      foundation_type: machine.foundation_type || "",
      automation_level: machine.automation_level || "",
      lubricant_type: machine.lubricant_type || "",
      alternative_lubricant_type: machine.alternative_lubricant_type || "",
    });
    setCurrentId(machine.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleNumericInput = (e) => {
    const { name, value } = e.target;
    // Allow empty string or numbers
    if (value === "" || !isNaN(value)) {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this machine?")) {
      const csrfToken = getCookie("csrftoken");
      try {
        await axios.delete(`/api/machines/${id}/`, {
          withCredentials: true,
          headers: {
            "X-CSRFToken": csrfToken,
          },
        });
        fetchMachines();
      } catch (error) {
        console.error("Error deleting machine:", error);
        alert("Failed to delete machine");
      }
    }
  };

  const openNewModal = () => {
    setFormData(initialFormState);
    setIsEditing(false);
    setCurrentId(null);
    setShowModal(true);
  };

  const handleLubricantChange = (index, field, value) => {
    const newLubricants = [...formData.lubricants];
    newLubricants[index][field] = value;
    setFormData({ ...formData, lubricants: newLubricants });
  };

  const addLubricant = () => {
    setFormData({
      ...formData,
      lubricants: [
        ...formData.lubricants,
        { lubricant_type: "", alternative_lubricant_type: "", description: "" },
      ],
    });
  };

  const removeLubricant = (index) => {
    const newLubricants = formData.lubricants.filter((_, i) => i !== index);
    setFormData({ ...formData, lubricants: newLubricants });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const csrfToken = getCookie("csrftoken");
    if (!csrfToken) {
      console.error("CSRF Token not found in cookies!");
      alert("Security token missing. Please refresh the page or log in again.");
      return;
    }
    const config = {
      withCredentials: true,
      headers: {
        "X-CSRFToken": csrfToken,
      },
    };

    try {
      if (isEditing) {
        await axios.put(`/api/machines/${currentId}/`, formData, config);
        alert("Machine updated successfully!");
      } else {
        await axios.post("/api/machines/", formData, config);
        alert("Machine registered successfully!");
      }
      setShowModal(false);
      fetchMachines();
      setFormData(initialFormState);
    } catch (error) {
      console.error("Error saving machine:", error);
      alert("Failed to save machine. Please check all required fields.");
    }
  };

  const handleExport = async (machine, type) => {
    if (type !== "docx" && type !== "pdf") {
      alert("Only DOCX and PDF exports are supported.");
      return;
    }
    try {
      const endpoint =
        type === "pdf"
          ? `/api/machines/${machine.id}/export_pdf/`
          : `/api/machines/${machine.id}/export/`;

      const response = await axios.get(endpoint, {
        responseType: "blob",
        withCredentials: true,
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Machine_${machine.machine_code}.${type}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error(`Error exporting machine as ${type}:`, error);
      alert(`Failed to export machine document as ${type}.`);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredMachines = machines
    .filter(
      (machine) =>
        (filterType === "All" || machine.machine_model === filterType) &&
        (machine.machine_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          machine.location_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });

  const uniqueTypes = [
    "All",
    ...new Set(machines.map((m) => m.machine_model).filter(Boolean)),
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Machine Registration
            </h1>
            <p className="text-gray-500 mt-1">
              Manage and register equipment inventory
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30"
          >
            <Plus size={20} className="mr-2" />
            Register New Machine
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by name or location..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={20} className="text-gray-400" />
            <select
              className="border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("machine_name")}
                  >
                    <div className="flex items-center">
                      Machine Name
                      <SortIcon
                        columnKey="machine_name"
                        sortConfig={sortConfig}
                      />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("section")}
                  >
                    <div className="flex items-center">
                      Section
                      <SortIcon columnKey="section" sortConfig={sortConfig} />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("machine_model")}
                  >
                    <div className="flex items-center">
                      Model / Serial
                      <SortIcon
                        columnKey="machine_model"
                        sortConfig={sortConfig}
                      />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("manufacturer_company_name")}
                  >
                    <div className="flex items-center">
                      Manufacturer
                      <SortIcon
                        columnKey="manufacturer_company_name"
                        sortConfig={sortConfig}
                      />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("location_name")}
                  >
                    <div className="flex items-center">
                      Location
                      <SortIcon
                        columnKey="location_name"
                        sortConfig={sortConfig}
                      />
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("criticality_level")}
                  >
                    <div className="flex items-center">
                      Criticality
                      <SortIcon
                        columnKey="criticality_level"
                        sortConfig={sortConfig}
                      />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Loading machines...
                    </td>
                  </tr>
                ) : filteredMachines.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No machines found
                    </td>
                  </tr>
                ) : (
                  filteredMachines.map((machine) => (
                    <motion.tr
                      key={machine.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            {machine.machine_name?.charAt(0) || "M"}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {machine.machine_name}
                            </div>
                            <div className="text-xs text-gray-500">
                              Code: {machine.machine_code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {machine.section}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>{machine.machine_model}</div>
                        <div className="text-xs text-gray-400">
                          SN: {machine.machine_serial}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {machine.manufacturer_company_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {machine.location_name}
                        <div className="text-xs text-gray-400">
                          {machine.location_code}
                        </div>
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
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleExport(machine, "docx")}
                            className="text-blue-600 hover:text-blue-800 transition-colors p-1 rounded hover:bg-blue-50"
                            title="Export to Word"
                          >
                            <FileDown size={18} />
                          </button>
                          <button
                            onClick={() => handleExport(machine, "pdf")}
                            className="text-red-600 hover:text-red-800 transition-colors p-1 rounded hover:bg-red-50"
                            title="Export to PDF"
                          >
                            <FileText size={18} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(machine)}
                          className="text-gray-400 hover:text-blue-600 mx-1"
                        >
                          <Edit size={18} />
                        </button>
                        <button className="text-gray-400 hover:text-red-600 mx-1">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Full Screen Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-5xl my-8 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {isEditing ? "Edit Machine" : "Register New Machine"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isEditing
                      ? "Update the details below to modify the machine."
                      : "Fill in the details below to add a new machine to the system."}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="p-8 overflow-y-auto flex-1">
                <form
                  id="machineForm"
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  {/* General Information */}
                  <FormSection title="General Information">
                    <InputField
                      label="Section"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Machine Name"
                      name="machine_name"
                      value={formData.machine_name}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Machine Code"
                      name="machine_code"
                      value={formData.machine_code}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Machine Model"
                      name="machine_model"
                      value={formData.machine_model}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Machine Serial"
                      name="machine_serial"
                      value={formData.machine_serial}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Manufacture Year"
                      name="manufacture_year"
                      type="number"
                      value={formData.manufacture_year}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Company Entry Date"
                      name="company_entry_date"
                      type="date"
                      value={formData.company_entry_date}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Installation Date"
                      name="installation_date"
                      type="date"
                      value={formData.installation_date}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Criticality Level"
                      name="criticality_level"
                      type="select"
                      required
                      value={formData.criticality_level}
                      onChange={handleInputChange}
                      options={[
                        { value: "low", label: "Low" },
                        { value: "medium", label: "Medium" },
                        { value: "high", label: "High" },
                        { value: "critical", label: "Critical" },
                      ]}
                    />
                    <InputField
                      label="Location Name"
                      name="location_name"
                      value={formData.location_name}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Location Code"
                      name="location_code"
                      value={formData.location_code}
                      onChange={handleInputChange}
                      required
                    />
                  </FormSection>

                  {/* Dimensions & Weight */}
                  <FormSection title="Dimensions & Weight">
                    <InputField
                      label="Length (mm)"
                      name="length_mm"
                      type="number"
                      value={formData.length_mm}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Width (mm)"
                      name="width_mm"
                      type="number"
                      value={formData.width_mm}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Height (mm)"
                      name="height_mm"
                      type="number"
                      value={formData.height_mm}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Weight (kg)"
                      name="weight_kg"
                      type="number"
                      value={formData.weight_kg}
                      onChange={handleInputChange}
                    />
                  </FormSection>

                  {/* Technical & Automation */}
                  <FormSection title="Technical & Automation">
                    <InputField
                      label="Foundation Type"
                      name="foundation_type"
                      type="select"
                      value={formData.foundation_type}
                      onChange={handleInputChange}
                      options={[
                        { value: "", label: "Select Foundation Type" },
                        { value: "فلزی", label: "فلزی" },
                        { value: "بتنی/فلزی", label: "بتنی" },
                        { value: "پیش ساخته", label: "پیش ساخته" },
                        { value: "ندارد", label: "ندارد" },
                      ]}
                    />
                    <InputField
                      label="Automation Level"
                      name="automation_level"
                      type="select"
                      value={formData.automation_level}
                      onChange={handleInputChange}
                      options={[
                        { value: "", label: "Select Automation Level" },
                        { value: "دستی", label: "دستی" },
                        { value: "نیمه اتوماتیک", label: "نیمه اتوماتیک" },
                        { value: "اتوماتیک", label: "اتوماتیک" },
                      ]}
                    />
                  </FormSection>

                  {/* Electrical Specifications */}
                  <FormSection title="Electrical Specifications">
                    <InputField
                      label="Current Type"
                      name="current_type"
                      type="select"
                      value={formData.current_type}
                      onChange={handleInputChange}
                      options={[
                        { value: "AC", label: "AC" },
                        { value: "DC", label: "DC" },
                      ]}
                    />
                    <InputField
                      label="Phase Count"
                      name="phase_count"
                      type="select"
                      value={formData.phase_count}
                      onChange={handleInputChange}
                      options={[
                        { value: "", label: "Select Phase Count" },
                        { value: "1", label: "تک فاز" },
                        { value: "3", label: "سه فاز" },
                      ]}
                    />
                    <InputField
                      label="Nominal Voltage (V)"
                      name="nominal_voltage"
                      type="number"
                      value={formData.nominal_voltage}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Nominal Power (kW)"
                      name="nominal_power"
                      type="number"
                      value={formData.nominal_power}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Nominal Current (A)"
                      name="nominal_current"
                      type="number"
                      value={formData.nominal_current}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Max Consumption"
                      name="maximum_consumption"
                      type="number"
                      value={formData.maximum_consumption}
                      onChange={handleInputChange}
                    />
                    <InputField
                      label="Electrical Description"
                      name="electrical_technical_description"
                      type="textarea"
                      value={formData.electrical_technical_description}
                      onChange={handleInputChange}
                      className="md:col-span-3"
                    />
                  </FormSection>

                  {/* Mechanical & Lubrication */}
                  <FormSection title="Mechanical & Lubrication">
                    <InputField
                      label="Operating Pressure (bar)"
                      name="operating_pressure"
                      type="number"
                      value={formData.operating_pressure}
                      onChange={handleInputChange}
                    />

                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lubricants
                      </label>
                      {formData.lubricants.map((lubricant, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 border p-4 rounded bg-gray-50"
                        >
                          <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-gray-500">
                              Type
                            </label>
                            <input
                              type="text"
                              value={lubricant.lubricant_type}
                              onChange={(e) =>
                                handleLubricantChange(
                                  index,
                                  "lubricant_type",
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-gray-500">
                              Alternative
                            </label>
                            <input
                              type="text"
                              value={lubricant.alternative_lubricant_type}
                              onChange={(e) =>
                                handleLubricantChange(
                                  index,
                                  "alternative_lubricant_type",
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div className="md:col-span-1">
                            <label className="block text-xs font-medium text-gray-500">
                              Description
                            </label>
                            <input
                              type="text"
                              value={lubricant.description}
                              onChange={(e) =>
                                handleLubricantChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                            />
                          </div>
                          <div className="md:col-span-1 flex items-end">
                            <button
                              type="button"
                              onClick={() => removeLubricant(index)}
                              className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addLubricant}
                        className="mt-2 bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
                      >
                        + Add Lubricant
                      </button>
                    </div>
                  </FormSection>

                  {/* Warranty & Guarantee */}
                  <FormSection title="Warranty & Guarantee">
                    <div className="flex items-center space-x-2 mt-8">
                      <input
                        type="checkbox"
                        id="has_guarantee"
                        name="has_guarantee"
                        checked={formData.has_guarantee}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="has_guarantee"
                        className="text-sm font-medium text-gray-700"
                      >
                        Has Guarantee
                      </label>
                    </div>
                    {formData.has_guarantee && (
                      <InputField
                        label="Guarantee Expiry Date"
                        name="guarantee_expiry_date"
                        type="date"
                        value={formData.guarantee_expiry_date}
                        onChange={handleInputChange}
                      />
                    )}

                    <div className="flex items-center space-x-2 mt-8">
                      <input
                        type="checkbox"
                        id="has_warranty"
                        name="has_warranty"
                        checked={formData.has_warranty}
                        onChange={handleInputChange}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="has_warranty"
                        className="text-sm font-medium text-gray-700"
                      >
                        Has Warranty
                      </label>
                    </div>
                    {formData.has_warranty && (
                      <InputField
                        label="Warranty Expiry Date"
                        name="warranty_expiry_date"
                        type="date"
                        value={formData.warranty_expiry_date}
                        onChange={handleInputChange}
                      />
                    )}
                  </FormSection>

                  {/* Vendor Information */}
                  <FormSection title="Supplier Information">
                    <InputField
                      label="Supplier Name"
                      name="supplier_company_name"
                      value={formData.supplier_company_name}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Supplier Phone"
                      name="supplier_phone"
                      value={formData.supplier_phone}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Supplier Address"
                      name="supplier_address"
                      type="textarea"
                      value={formData.supplier_address}
                      onChange={handleInputChange}
                      required
                    />
                  </FormSection>

                  {/* Manufacturer Information */}
                  <FormSection title="Manufacturer Information">
                    <InputField
                      label="Manufacturer Name"
                      name="manufacturer_company_name"
                      value={formData.manufacturer_company_name}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Manufacturer Phone"
                      name="manufacturer_phone"
                      value={formData.manufacturer_phone}
                      onChange={handleInputChange}
                      required
                    />
                    <InputField
                      label="Manufacturer Address"
                      name="manufacturer_address"
                      type="textarea"
                      value={formData.manufacturer_address}
                      onChange={handleInputChange}
                      required
                    />
                  </FormSection>
                </form>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="machineForm"
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 font-medium"
                >
                  Register Machine
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default MachineList;
