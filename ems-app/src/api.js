// src/api.js
import axios from "axios";

// ----------------------
// Base URL
// ----------------------
export const API_BASE = "http://127.0.0.1:8000/api"; // no trailing slash

// ----------------------
// Axios Instance
// ----------------------
const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

const LOCAL_KEY = "ems_auth";

// ----------------------
// Storage Helpers
// ----------------------
const readStored = () => {
  try {
    const raw =
      localStorage.getItem(LOCAL_KEY) || sessionStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStored = (data, persistent = false) => {
  const raw = JSON.stringify({ ...data, persistent });
  if (persistent) {
    localStorage.setItem(LOCAL_KEY, raw);
    sessionStorage.removeItem(LOCAL_KEY);
  } else {
    sessionStorage.setItem(LOCAL_KEY, raw);
    localStorage.removeItem(LOCAL_KEY);
  }
};

const clearStored = () => {
  localStorage.removeItem(LOCAL_KEY);
  sessionStorage.removeItem(LOCAL_KEY);
};

// ----------------------
// Auth Token Management
// ----------------------
export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
};

export const getToken = () => {
  const s = readStored();
  return s
    ? { access: s.access, refresh: s.refresh, persistent: s.persistent }
    : null;
};

export const logout = () => {
  clearStored();
  setAuthToken(null);
  window.location.href = "/login";
};

// Initialize stored token if exists
(() => {
  const stored = readStored();
  if (stored?.access) setAuthToken(stored.access);
})();

// ----------------------
// Token Refresh
// ----------------------
export const refreshToken = async () => {
  const stored = readStored();
  if (!stored?.refresh) return false;

  try {
    const res = await api.post("token/refresh/", { refresh: stored.refresh });
    const newAccess = res.data.access;
    writeStored(
      { access: newAccess, refresh: stored.refresh },
      stored.persistent
    );
    setAuthToken(newAccess);
    return newAccess;
  } catch (err) {
    console.error("Token refresh failed:", err);
    logout();
    return false;
  }
};

// ----------------------
// Axios 401 Interceptor
// ----------------------
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newToken = await refreshToken();
      if (newToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

// ----------------------
// AUTH
// ----------------------
export const login = async (email, password) => {
  try {
    const res = await api.post("/login/", { email, password });
    const { access, refresh } = res.data;

    writeStored({ access, refresh }, true);
    setAuthToken(access);
    return res;
  } catch (err) {
    console.error("Login error:", err.response?.data || err.message);
    throw err;
  }
};

export const signup = async (data) => {
  try {
    const res = await api.post("/signup/", data);
    return res;
  } catch (err) {
    console.error("Signup error:", err.response?.data || err.message);
    throw err;
  }
};

export const getMyProfile = async () => {
  const res = await api.get("/my-profile/");
  return res;
};

// ----------------------
// Role Helpers
// ----------------------
const isAdmin = (profile) =>
  profile?.role === "admin" || profile?.role === "superuser";

const getEndpoint = (profile, type) => {
  if (!profile) throw new Error("Profile required");
  if (type === "attendance" || type === "performance") {
    return isAdmin(profile) ? `${type}/` : `employee-api/${type}/`;
  }
  return isAdmin(profile) ? `admin-api/${type}/` : `employee-api/${type}/`;
};

// ----------------------
// Attendance
// ----------------------
export const getAttendance = (profile) =>
  api.get(getEndpoint(profile, "attendance"));
export const addAttendance = (profile, payload) =>
  api.post(getEndpoint(profile, "attendance"), payload);
export const updateAttendance = (profile, id, payload) =>
  api.put(`${getEndpoint(profile, "attendance")}${id}/`, payload);
export const deleteAttendance = (profile, id) =>
  api.delete(`${getEndpoint(profile, "attendance")}${id}/`);
export const markTodayAttendance = () =>
  api.post("employee-api/attendance/mark-present/");

// ----------------------
// Performance
// ----------------------
export const getPerformanceById = (profile, id) =>
  api.get(`${getEndpoint(profile, "performance")}${id}/`);
export const getPerformance = (profile) =>
  api.get(getEndpoint(profile, "performance"));
export const addPerformance = (profile, payload) =>
  api.post(getEndpoint(profile, "performance"), payload);
export const updatePerformance = (profile, id, payload) =>
  api.put(`${getEndpoint(profile, "performance")}${id}/`, payload);
export const deletePerformance = (profile, id) =>
  api.delete(`${getEndpoint(profile, "performance")}${id}/`);

// ----------------------
// Profiles / Employees
// ----------------------
export const getProfiles = (profile) =>
  api.get(isAdmin(profile) ? "admin-api/employees/" : "employee-api/profile/");
export const addProfile = (profile, payload) =>
  api.post(
    isAdmin(profile) ? "admin-api/employees/" : "employee-api/profile/",
    payload
  );
export const updateProfile = (profile, id, payload) =>
  api.put(
    `${
      isAdmin(profile) ? "admin-api/employees/" : "employee-api/profile/"
    }${id}/`,
    payload
  );
export const deleteProfile = (profile, id) =>
  api.delete(
    `${
      isAdmin(profile) ? "admin-api/employees/" : "employee-api/profile/"
    }${id}/`
  );

// ----------------------
// Admin Users
// ----------------------
export const getUsers = () => api.get("admin-api/users/");

export default api;
