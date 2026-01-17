// src/pages/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import api, { getToken, setAuthToken, logout, getMyProfile } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = getToken();
    if (!stored?.access) {
      setLoading(false);
      return;
    }

    setAuthToken(stored.access);

    getMyProfile()
      .then((res) => setProfile(res.data))
      .catch((err) => {
        console.error("❌ Failed to fetch profile:", err);
        logout(false);
        setProfile(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ profile, setProfile, loading, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
