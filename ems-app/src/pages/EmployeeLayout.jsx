// src/pages/EmployeeLayout.jsx
import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { setAuthToken, getMyProfile } from "../api";
import "./dashboard.css";

export default function EmployeeLayout() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const access = localStorage.getItem("access") || sessionStorage.getItem("access");

    if (!access) {
      setError("You are not authenticated. Please log in.");
      setLoading(false);
      navigate("/login", { replace: true });
      return;
    }

    setAuthToken(access);
    const controller = new AbortController();

    const fetchProfile = async () => {
      try {
        const res = await getMyProfile({ signal: controller.signal });
        const role = res.data.role;

        if (role !== "employee" && role !== "superuser") {
          // Redirect admins to admin dashboard
          navigate("/admin-dashboard/dashboard-home", { replace: true });
          return;
        }

        setProfile(res.data);
      } catch (err) {
        if (err.name === "CanceledError") return; // Request aborted
        if (err.response?.status === 401) {
          setError("Session expired. Please log in again.");
          localStorage.clear();
          sessionStorage.clear();
          setAuthToken(null);
          navigate("/login", { replace: true });
        } else {
          console.error("EmployeeLayout fetch error:", err);
          setError("❌ Failed to load profile. Try refreshing the page.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Cleanup fetch if component unmounts
    return () => controller.abort();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setAuthToken(null);
    navigate("/login", { replace: true });
  };

  if (loading) return <p className="loading">⏳ Loading dashboard...</p>;
  if (error) return <p className="error-text">{error}</p>;

  const sidebarLinks = [
    { path: "dashboard-home", label: "Dashboard Home" },
    { path: "attendance", label: "Attendance" },
    { path: "performance", label: "Performance" },
    { path: "details", label: "Personal Details" },
  ];

  return (
    <div className="employee-dashboard-container">
      <header className="dashboard-header">
        <h1>👋 Employee Dashboard</h1>
        <div className="header-right">
          <span className="user-info">
            👤 {profile?.username || profile?.email || "Employee"} ({profile?.role})
          </span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="dashboard-grid">
        <aside className="dashboard-sidebar">
          <nav>
            <h3>Employee Pages</h3>
            {sidebarLinks.map(link => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => isActive ? "active" : ""}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="dashboard-content">
          {/* Pass profile and role to child pages */}
          <Outlet context={{ profile, role: profile.role }} />
        </main>
      </div>
    </div>
  );
}
