import React, { useContext, Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Header from "./components/Header";
import { AuthContext, AuthProvider } from "./pages/AuthContext";
import "./app.css";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Services = lazy(() => import("./pages/Service"));
const Aboutus = lazy(() => import("./pages/Aboutus"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Attendance = lazy(() => import("./pages/Attendance"));
const Performance = lazy(() => import("./pages/Performance"));
const PersonalDetails = lazy(() => import("./pages/PersonalDetails"));

function ProtectedRoute({ children, allowedRoles }) {
  const { profile, loading } = useContext(AuthContext);
  if (loading) return <FullPageLoader />;
  if (!profile) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(profile.role)) return <Navigate to="/" replace />;
  return children;
}

function RedirectIfAuth({ children }) {
  const { profile, loading } = useContext(AuthContext);
  if (loading) return <FullPageLoader />;
  if (profile) return <Navigate to="/" replace />;
  return children;
}

function FullPageLoader() {
  return (
    <div style={{ textAlign: "center", padding: "5rem", fontSize: "1.5rem" }}>
      ⏳ Loading...
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const hideHeaderPaths = ["/login", "/signup"];

  return (
    <AuthProvider>
      {!hideHeaderPaths.includes(location.pathname) && <Header />}

      <Suspense fallback={<FullPageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about-us" element={<Aboutus />} />
          <Route path="/contact" element={<Contact />} />

          <Route
            path="/login"
            element={
              <RedirectIfAuth>
                <Login />
              </RedirectIfAuth>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={["employee", "admin", "superuser"]}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/performance"
            element={
              <ProtectedRoute allowedRoles={["employee", "admin", "superuser"]}>
                <Performance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/personal-details"
            element={
              <ProtectedRoute allowedRoles={["employee", "admin", "superuser"]}>
                <PersonalDetails />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}
