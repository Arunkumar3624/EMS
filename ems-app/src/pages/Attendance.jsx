import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext";
import {
  getAttendance,
  addAttendance,
  updateAttendance,
  deleteAttendance,
  getProfiles,
} from "../api";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import styles from "./CSS/Attendance.module.css"; // ✅ Scoped CSS

export default function Attendance() {
  const { profile, loading: profileLoading, handleLogout } = useContext(AuthContext);
  const userRole = profile?.role;
  const isAdmin = userRole === "admin" || userRole === "superuser";

  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [status, setStatus] = useState("present");
  const [editingId, setEditingId] = useState(null);
  const [employeeId, setEmployeeId] = useState("");
  const [adminStatus, setAdminStatus] = useState("present");

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    const fetchData = async () => {
      try {
        if (isAdmin) {
          const [attRes, empRes] = await Promise.all([
            getAttendance(profile),
            getProfiles(profile),
          ]);
          setRecords(attRes.data.results || attRes.data);
          setEmployees(empRes.data.results || empRes.data);
        } else {
          const attRes = await getAttendance(profile);
          setRecords(attRes.data.results || attRes.data);
        }
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) handleLogout();
        else setError("❌ Failed to load attendance records.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile, isAdmin, handleLogout]);

  const handleEmployeeAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await addAttendance(profile, { date, status });
      setRecords((prev) => [...prev.filter((r) => r.date !== date), res.data]);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add attendance");
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (!employeeId) return alert("Select an employee first!");
    try {
      const payload = { employee: employeeId, date, status: adminStatus };
      let res;
      if (editingId) {
        res = await updateAttendance(profile, editingId, payload);
        setRecords((prev) => prev.map((r) => (r.id === editingId ? res.data : r)));
        setEditingId(null);
      } else {
        res = await addAttendance(profile, payload);
        setRecords((prev) => [...prev, res.data]);
      }
      setEmployeeId("");
      setAdminStatus("present");
    } catch (err) {
      console.error(err);
      alert("❌ Save failed");
    }
  };

  const handleEdit = (r) => {
    setEditingId(r.id);
    setEmployeeId(r.employee?.id || "");
    setAdminStatus(r.status);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteAttendance(profile, id);
      setRecords((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("❌ Delete failed");
    }
  };

  const getSummary = (empId) => {
    const empRecords = records.filter((r) => r.employee?.id === empId);
    const present = empRecords.filter((r) => r.status === "present").length;
    const absent = empRecords.filter((r) => r.status === "absent").length;
    return { present, absent };
  };

  if (profileLoading || loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <motion.div
      className={styles["attendance-page"]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles["hero-overlay"]}>
          <h1>📅 Attendance Dashboard</h1>
          <p>Manage daily attendance records efficiently and accurately.</p>
        </div>
      </section>

      {/* Main Container */}
      <section className={styles["attendance-container"]}>
        {isAdmin ? (
          <Card className={styles["floating-card"]}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {editingId ? "✏️ Edit Attendance" : "➕ Add Attendance"}
              </Typography>
              <form onSubmit={handleAdminSubmit}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Employee</InputLabel>
                  <Select
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    required
                  >
                    {employees.map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {emp.name || emp.user?.username}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{ mb: 2 }}
                />

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={adminStatus}
                    onChange={(e) => setAdminStatus(e.target.value)}
                  >
                    <MenuItem value="present">Present</MenuItem>
                    <MenuItem value="absent">Absent</MenuItem>
                  </Select>
                </FormControl>

                <Button variant="contained" color="primary" type="submit">
                  {editingId ? "Update" : "Add"} Record
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card className={styles["floating-card"]}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Mark Your Attendance
              </Typography>
              <form onSubmit={handleEmployeeAdd}>
                <TextField
                  fullWidth
                  type="date"
                  label="Date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="present">Present</MenuItem>
                    <MenuItem value="absent">Absent</MenuItem>
                  </Select>
                </FormControl>
                <Button variant="contained" color="success" type="submit">
                  {status === "present" ? "✅ Mark Present" : "❌ Mark Absent"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Summary Table */}
        <Card className={styles["floating-card"]}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              🧾 Attendance Summary
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Employee</strong></TableCell>
                    <TableCell><strong>Present</strong></TableCell>
                    <TableCell><strong>Absent</strong></TableCell>
                    {isAdmin && <TableCell><strong>Actions</strong></TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(isAdmin ? employees : records).map((item) => {
                    const empId = item.id || item.employee?.id;
                    const empName =
                      item.name ||
                      item.employee?.name ||
                      item.employee?.user?.username;
                    const { present, absent } = getSummary(empId);

                    return (
                      <TableRow key={empId}>
                        <TableCell>{empName}</TableCell>
                        <TableCell>{present}</TableCell>
                        <TableCell>{absent}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            {records
                              .filter((r) => r.employee?.id === empId)
                              .map((r) => (
                                <span key={r.id}>
                                  <IconButton
                                    color="primary"
                                    onClick={() => handleEdit(r)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    color="error"
                                    onClick={() => handleDelete(r.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </span>
                              ))}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </section>
    </motion.div>
  );
}
