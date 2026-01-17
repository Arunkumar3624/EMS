import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import api from "../api";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        const res = await api.post("login/", {
          username: form.username,
          password: form.password,
        });
        localStorage.setItem("token", JSON.stringify(res.data));
        window.location.href = "/";
      } else {
        await api.post("signup/", form);
        alert("Signup successful! You can now log in.");
        setIsLogin(true);
      }
    } catch (err) {
      console.error(err);
      setError("Authentication failed. Please check your details.");
    }
  };

  return (
    <Grid
      container
      sx={{
        height: "100vh",
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={12}
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: { xs: "90%", md: 900 },
          height: { xs: "auto", md: 520 },
          borderRadius: 6,
          overflow: "hidden",
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Left Form Section */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "rgba(255,255,255,0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            p: 4,
          }}
        >
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4 }}
                style={{ width: "100%", maxWidth: 320 }}
              >
                <Typography variant="h5" fontWeight={700} mb={3}>
                  Welcome Back 👋
                </Typography>
                <form onSubmit={handleSubmit}>
                  <TextField
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                  />
                  {error && (
                    <Typography color="error" variant="body2">
                      {error}
                    </Typography>
                  )}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                    type="submit"
                  >
                    Sign In
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4 }}
                style={{ width: "100%", maxWidth: 320 }}
              >
                <Typography variant="h5" fontWeight={700} mb={3}>
                  Create an Account 🚀
                </Typography>
                <form onSubmit={handleSubmit}>
                  <TextField
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                  />
                  <TextField
                    label="Password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    required
                  />
                  {error && (
                    <Typography color="error" variant="body2">
                      {error}
                    </Typography>
                  )}
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{
                      mt: 3,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                    type="submit"
                  >
                    Sign Up
                  </Button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </Box>

        {/* Right Visual Section */}
        <Box
          sx={{
            flex: 1,
            background: isLogin
              ? "url('https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=870&q=80') center/cover"
              : "url('https://images.unsplash.com/photo-1504805572947-34fad45aed93?auto=format&fit=crop&w=870&q=80') center/cover",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.5), rgba(0,0,0,0.2))",
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            style={{ zIndex: 1, width: "80%" }}
          >
            <Typography variant="h4" fontWeight={700} mb={2}>
              {isLogin ? "Hello, Friend!" : "Welcome Back!"}
            </Typography>
            <Typography mb={3}>
              {isLogin
                ? "Don’t have an account? Join us and explore the system."
                : "Already have an account? Log in and continue your journey."}
            </Typography>
            <Button
              variant="outlined"
              sx={{
                color: "#fff",
                borderColor: "#fff",
                "&:hover": { background: "rgba(255,255,255,0.2)" },
                textTransform: "none",
              }}
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Sign Up" : "Sign In"}
            </Button>
          </motion.div>
        </Box>
      </Paper>
    </Grid>
  );
}
