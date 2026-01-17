// src/components/PersonalDetails.jsx
import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  getProfiles,
  getUsers,
  addProfile,
  updateProfile,
  deleteProfile,
  getLatestPerformance, // new API function
} from "../api";
import { AuthContext } from "./AuthContext";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { motion } from "framer-motion";
import "../pages/css/global.css";

export default function PersonalDetails() {
  const { profile } = useContext(AuthContext);
  const userRole = profile?.role;
  const isAdmin = userRole === "admin" || userRole === "superuser";

  const [records, setRecords] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [performanceMap, setPerformanceMap] = useState({}); // { employeeId: [perfData] }

  const [formData, setFormData] = useState({
    user: "",
    name: "",
    address: "",
    phone: "",
    role: "",
  });

  const COLORS = ["#00C49F", "#0088FE", "#FFBB28"];

  // ---------------------- Fetch profiles, users & performance ----------------------
  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          // Admin: fetch all profiles and users
          const [empRes, userRes] = await Promise.all([getProfiles(profile), getUsers()]);
          const empArray = Array.isArray(empRes.data) ? empRes.data : empRes.data.results || [];
          const userArray = Array.isArray(userRes.data) ? userRes.data : userRes.data.results || [];
          setRecords(empArray);
          setUsers(userArray);

          // Fetch latest performance for all employees
          const perfMap = {};
          for (const emp of empArray) {
            try {
              const perfRes = await getLatestPerformance(profile, emp.id);
              perfMap[emp.id] = perfRes?.data || [
                { name: "Task Efficiency", value: 0 },
                { name: "Collaboration", value: 0 },
                { name: "Punctuality", value: 0 },
              ];
            } catch {
              perfMap[emp.id] = [
                { name: "Task Efficiency", value: 0 },
                { name: "Collaboration", value: 0 },
                { name: "Punctuality", value: 0 },
              ];
            }
          }
          setPerformanceMap(perfMap);

        } else {
          // Non-admin: only own profile
          const myProfileRes = await getProfiles(profile);
          const empData = Array.isArray(myProfileRes.data) ? myProfileRes.data : [myProfileRes.data];
          setRecords(empData);

          const emp = empData[0];
          if (emp) {
            setEditingId(emp.id);
            setFormData({
              name: emp.name || "",
              address: emp.address || "",
              phone: emp.phone || "",
              role: emp.role || "",
            });

            try {
              const perfRes = await getLatestPerformance(profile, emp.id);
              setPerformanceMap({
                [emp.id]: perfRes?.data || [
                  { name: "Task Efficiency", value: 0 },
                  { name: "Collaboration", value: 0 },
                  { name: "Punctuality", value: 0 },
                ],
              });
            } catch {
              setPerformanceMap({
                [emp.id]: [
                  { name: "Task Efficiency", value: 0 },
                  { name: "Collaboration", value: 0 },
                  { name: "Punctuality", value: 0 },
                ],
              });
            }
          }
        }
      } catch (err) {
        setError("❌ Failed to load records: " + (err.message || err));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [profile, isAdmin]);

  // ---------------------- Role Distribution Chart ----------------------
  const roleData = useMemo(
    () => [
      { name: "Employees", value: records.filter(r => r.role === "employee").length },
      { name: "Admins", value: records.filter(r => r.role === "admin").length },
      { name: "Superusers", value: records.filter(r => r.role === "superuser").length },
    ],
    [records]
  );

  // ---------------------- Form Handlers ----------------------
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleUserSelect = (role) => {
    setFormData({ user: "", name: "", address: "", phone: "", role });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let res;
      if (isAdmin) {
        if (!formData.role) {
          alert("❌ Please select a role.");
          return;
        }

        if (editingId) {
          res = await updateProfile(profile, editingId, formData);
          setRecords(prev => prev.map(r => (r.id === editingId ? res.data : r)));
          alert("✅ Employee updated!");
        } else {
          res = await addProfile(profile, formData);
          setRecords(prev => [...prev, res.data]);
          alert("✅ Employee added!");
        }
      } else {
        const empId = records[0]?.id;
        if (!empId) return;
        res = await updateProfile(profile, empId, formData);
        setRecords([res.data]);
        alert("✅ Details updated!");
      }

      setEditingId(null);
      setFormData({ user: "", name: "", address: "", phone: "", role: "" });
    } catch (err) {
      alert("❌ Operation failed: " + (err.message || err));
    }
  };

  const handleDelete = async (id) => {
    if (!isAdmin) return;
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await deleteProfile(profile, id);
      setRecords(prev => prev.filter(r => r.id !== id));
      setPerformanceMap(prev => {
        const newPerfMap = { ...prev };
        delete newPerfMap[id];
        return newPerfMap;
      });
    } catch (err) {
      alert("❌ Delete failed: " + (err.message || err));
    }
  };

  if (loading) return <p>⏳ Loading records...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // ---------------------- Render ----------------------
  return (
    <motion.div className="personal-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* HEADER */}
      <section className="hero">
        <div className="hero-overlay">
          <h1>👤 Employee Dashboard</h1>
          <p>Manage and analyze employee information.</p>
        </div>
      </section>

      {/* DASHBOARD: FORM + ROLE CHART */}
      <Box className="dashboard-container" sx={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
        {/* FORM */}
        <Card sx={{ flex: "1 1 350px" }}>
          <CardContent>
            <Typography variant="h6" align="center" gutterBottom>
              {isAdmin ? "Manage Employee Details" : "Update My Details"}
            </Typography>

            <form onSubmit={handleSubmit}>
              {isAdmin && (
                <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    onChange={(e) => handleUserSelect(e.target.value)}
                    required
                  >
                    <MenuItem value="">Select Role</MenuItem>
                    <MenuItem value="employee">Employee</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="superuser">Superuser</MenuItem>
                  </Select>
                </FormControl>
              )}

              <TextField
                label="Name"
                name="name"
                fullWidth
                margin="normal"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <TextField
                label="Address"
                name="address"
                fullWidth
                margin="normal"
                value={formData.address}
                onChange={handleChange}
                required
              />
              <TextField
                label="Phone"
                name="phone"
                fullWidth
                margin="normal"
                value={formData.phone}
                onChange={handleChange}
                required
              />

              <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
                {editingId ? "Update" : "Save"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ROLE DISTRIBUTION CHART */}
        <Box sx={{ flex: "2 1 700px", display: "flex", flexDirection: "column", gap: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" align="center">Role Distribution</Typography>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={roleData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {roleData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* EMPLOYEE TABLE WITH MINI PERFORMANCE CHARTS */}
      <Box sx={{ mt: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Employee Details</Typography>
            <table className="modern-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Phone</th>
                  <th>Performance</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 6 : 5}>No records found</td></tr>
                ) : (
                  records.map(r => (
                    <tr key={r.id}>
                      <td>{r.user?.username || "-"}</td>
                      <td>{r.name || "-"}</td>
                      <td>{r.address || "-"}</td>
                      <td>{r.phone || "-"}</td>
                      <td style={{ width: 150, height: 80 }}>
                        {performanceMap[r.id] && (
                          <ResponsiveContainer width="100%" height={80}>
                            <RadialBarChart
                              innerRadius="30%"
                              outerRadius="90%"
                              data={performanceMap[r.id]}
                              startAngle={180}
                              endAngle={0}
                            >
                              <RadialBar minAngle={15} background clockWise dataKey="value" />
                            </RadialBarChart>
                          </ResponsiveContainer>
                        )}
                      </td>
                      {isAdmin && (
                        <td>
                          <Button color="error" size="small" onClick={() => handleDelete(r.id)}>Delete</Button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </Box>
    </motion.div>
  );
}
