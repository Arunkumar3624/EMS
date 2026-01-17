import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  getPerformance,
  addPerformance,
  updatePerformance,
  deletePerformance,
  getProfiles,
} from "../api";
import { AuthContext } from "./AuthContext";
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
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import "../pages/css/global.css";

const Performance = () => {
  const { profile } = useContext(AuthContext); // use profile instead of user for consistency
  const [performances, setPerformances] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [formData, setFormData] = useState({
    id: null, // track performance ID for updates
    userId: "",
    score: "",
    remarks: "",
  });

  const isAdmin = profile?.role === "admin" || profile?.role === "superuser";

  // ---------------------- Fetch performances & profiles ----------------------
  useEffect(() => {
    if (!profile) return;

    const fetchData = async () => {
      try {
        // Admin fetches all profiles & performances, non-admin fetches only own
        const [perfRes, profileRes] = await Promise.all([
          getPerformance(profile),
          isAdmin ? getProfiles(profile) : Promise.resolve({ data: [profile] }),
        ]);

        setPerformances(perfRes.data || perfRes);
        setProfiles(profileRes.data || profileRes);
      } catch (err) {
        console.error("Data fetch error:", err);
        alert("❌ Failed to load performance data.");
      }
    };

    fetchData();
  }, [profile, isAdmin]);

  // ---------------------- Profile map for fast lookup ----------------------
  const profileMap = useMemo(
    () =>
      profiles.reduce((acc, p) => {
        acc[p.id] = p.name || p.username || "N/A";
        return acc;
      }, {}),
    [profiles]
  );

  // ---------------------- Form handlers ----------------------
  const handleChange = (e, isNumber = false) => {
    const value = isNumber ? parseInt(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const mapFormToAPI = (data) => ({
    employee_id: data.userId || null,
    rating: Number(data.score) || 0,
    remarks: data.remarks || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submitData = mapFormToAPI(formData);

    try {
      if (formData.id) {
        // Update existing performance
        await updatePerformance(formData.id, submitData);
      } else {
        // Add new performance
        await addPerformance(submitData);
      }

      // Refresh performance list
      const updated = await getPerformance(profile);
      setPerformances(updated.data || updated);

      // Reset form
      setFormData({ id: null, userId: "", score: "", remarks: "" });
    } catch (err) {
      console.error("Error submitting performance:", err);
      alert("❌ Failed to save performance.");
    }
  };

  const handleEdit = (perf) => {
    setFormData({
      id: perf.id,
      userId: perf.userId,
      score: perf.score,
      remarks: perf.remarks,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this performance?")) return;

    try {
      await deletePerformance(id);
      setPerformances((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("❌ Failed to delete performance.");
    }
  };

  // ---------------------- Render ----------------------
  return (
    <Box className="performance-page" sx={{ padding: "20px", minWidth: "1200px" }}>
      {/* HERO HEADER */}
      <Box sx={{ marginBottom: "30px", textAlign: "center" }}>
        <Typography variant="h3">Performance Dashboard</Typography>
        <Typography variant="subtitle1">
          Track and manage employee performance scores
        </Typography>
      </Box>

      {/* GRID: FORM + CHARTS */}
      <Box sx={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
        {/* FORM CARD */}
        <Card sx={{ flex: "1 1 300px", minWidth: "350px" }}>
          <CardContent>
            <Typography variant="h5" align="center" gutterBottom>
              {isAdmin ? "Add / Update Performance" : "My Performance"}
            </Typography>

            <form onSubmit={handleSubmit}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="employee-label">Employee</InputLabel>
                <Select
                  labelId="employee-label"
                  name="userId"
                  value={formData.userId || ""}
                  onChange={(e) => handleChange(e, true)}
                  disabled={!isAdmin}
                  required
                >
                  <MenuItem value="">Select Employee</MenuItem>
                  {profiles.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.name || p.username}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Performance Score"
                name="score"
                type="number"
                fullWidth
                margin="normal"
                value={formData.score}
                onChange={handleChange}
                inputProps={{ min: 0, max: 100 }}
                required
              />

              <TextField
                label="Remarks"
                name="remarks"
                fullWidth
                margin="normal"
                value={formData.remarks}
                onChange={handleChange}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                {formData.id ? "Update" : "Add"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* CHARTS PLACEHOLDER */}
        <Box sx={{ flex: "2 1 700px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" align="center">
                Performance Overview (Chart 1)
              </Typography>
              <Box sx={{ textAlign: "center", mt: 2 }}>[Insert Pie or Bar Chart]</Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" align="center">
                Score Distribution (Chart 2)
              </Typography>
              <Box sx={{ textAlign: "center", mt: 2 }}>[Insert Radial or Line Chart]</Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* PERFORMANCE TABLE */}
      <Box sx={{ mt: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Performance Records
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Employee</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Remarks</TableCell>
                    {isAdmin && <TableCell>Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {performances.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 5 : 4} align="center">
                        No performance records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    performances.map((perf) => (
                      <TableRow key={perf.id}>
                        <TableCell>{perf.id}</TableCell>
                        <TableCell>{profileMap[perf.userId] || "N/A"}</TableCell>
                        <TableCell>{perf.score}</TableCell>
                        <TableCell>{perf.remarks}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Button color="primary" onClick={() => handleEdit(perf)}>
                              Edit
                            </Button>
                            <Button color="error" onClick={() => handleDelete(perf.id)}>
                              Delete
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Performance;
