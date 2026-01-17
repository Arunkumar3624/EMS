// src/components/Header.jsx
import React, { useContext, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../pages/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Container,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  CircularProgress,
  useScrollTrigger,
  Slide,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

/* 🔹 Hide AppBar when scrolling down */
function HideOnScroll({ children }) {
  const trigger = useScrollTrigger();
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading, handleLogout } = useContext(AuthContext);

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLoggedIn = !!profile;

  /* 🔹 Define public and protected routes */
  const publicLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "About Us", path: "/about-us" },
    { name: "Contact", path: "/contact" },
  ];

  const protectedLinks = [
    { name: "Personal Details", path: "/personal-details", roles: ["employee", "admin", "superuser"] },
    { name: "Attendance", path: "/attendance", roles: ["employee", "admin", "superuser"] },
    { name: "Performance", path: "/performance", roles: ["employee", "admin", "superuser"] },
  ];

  /* 🔹 Merge filtered links */
  const filteredLinks = [
    ...publicLinks,
    ...(isLoggedIn
      ? protectedLinks.filter((link) => link.roles.includes(profile?.role))
      : []),
  ];

  const isActive = (path) => location.pathname === path;
  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  /* 🔹 Drawer Menu (Mobile) */
  const drawer = (
    <Box sx={{ width: 260, p: 1 }} role="presentation" onClick={toggleDrawer}>
      <List>
        {filteredLinks.map((link) => (
          <ListItem key={link.name} disablePadding>
            <ListItemButton onClick={() => navigate(link.path)}>
              <ListItemText
                primary={link.name}
                primaryTypographyProps={{
                  fontWeight: isActive(link.path) ? 600 : 400,
                  color: isActive(link.path) ? "primary.main" : "text.primary",
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />
      {isLoggedIn && (
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemText
                primary="Logout"
                primaryTypographyProps={{ color: "error.main", fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </Box>
  );

  /* 🔹 Main Return */
  return (
    <HideOnScroll>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backdropFilter: "blur(14px)",
          backgroundColor: "rgba(15, 25, 45, 0.7)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          borderBottom: "1px solid rgba(255,255,255,0.15)",
          transition: "background-color 0.3s ease",
          zIndex: 1300,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: 70,
              gap: 2,
            }}
          >
            {/* 🔹 Brand Logo */}
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                letterSpacing: ".15rem",
                fontFamily: "Poppins, sans-serif",
                background: "linear-gradient(90deg, #00C9FF, #92FE9D)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                cursor: "pointer",
                userSelect: "none",
              }}
              onClick={() => navigate("/")}
            >
              EZYEMS
            </Typography>

            {/* 🔹 Desktop Navigation */}
            <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
              {filteredLinks.map((link) => (
                <Button
                  key={link.name}
                  onClick={() => navigate(link.path)}
                  sx={{
                    color: isActive(link.path)
                      ? "#fff"
                      : "rgba(255,255,255,0.8)",
                    fontWeight: isActive(link.path) ? 600 : 400,
                    textTransform: "none",
                    borderBottom: isActive(link.path)
                      ? "2px solid #92FE9D"
                      : "2px solid transparent",
                    borderRadius: 0,
                    fontSize: "0.95rem",
                    "&:hover": {
                      borderBottom: "2px solid #00C9FF",
                      color: "#fff",
                    },
                  }}
                >
                  {link.name}
                </Button>
              ))}
            </Box>

            {/* 🔹 Mobile Menu Button */}
            <Box sx={{ display: { xs: "flex", md: "none" } }}>
              <IconButton color="inherit" onClick={toggleDrawer}>
                <MenuIcon />
              </IconButton>
            </Box>

            {/* 🔹 Right Section (Avatar / Auth) */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : !isLoggedIn ? (
                <Button
                  onClick={() => navigate("/login")}
                  sx={{
                    border: "1px solid rgba(255,255,255,0.7)",
                    color: "white",
                    borderRadius: "8px",
                    textTransform: "none",
                    px: 2,
                    fontSize: "0.9rem",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.1)",
                    },
                  }}
                >
                  Login / Signup
                </Button>
              ) : (
                <>
                  <Tooltip title={profile?.username || "User"}>
                    <IconButton
                      onClick={(e) => setAnchorElUser(e.currentTarget)}
                      sx={{ p: 0 }}
                    >
                      <Avatar
                        alt={profile?.username || "User"}
                        src={profile?.avatar || "/static/images/avatar/1.jpg"}
                      />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorElUser}
                    open={Boolean(anchorElUser)}
                    onClose={() => setAnchorElUser(null)}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    sx={{ mt: 1 }}
                  >
                    <MenuItem
                      onClick={() => {
                        navigate("/personal-details");
                        setAnchorElUser(null);
                      }}
                    >
                      Personal Details
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        handleLogout();
                        setAnchorElUser(null);
                      }}
                      sx={{ color: "error.main" }}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>

        {/* 🔹 Drawer (Mobile Navigation) */}
        <Drawer
          anchor="left"
          open={mobileOpen}
          onClose={toggleDrawer}
          PaperProps={{
            sx: {
              backgroundColor: "rgba(20, 30, 60, 0.95)",
              backdropFilter: "blur(10px)",
              color: "#fff",
            },
          }}
        >
          {drawer}
        </Drawer>
      </AppBar>
    </HideOnScroll>
  );
}
