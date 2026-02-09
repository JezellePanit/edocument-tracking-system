import React, { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem, ProSidebarProvider } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { tokens } from "../../theme";

// FIREBASE IMPORTS
import { auth, db } from "../../firebaseConfig"; 
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// ASSETS
import UserLight from "../../assets/user1.png"; // Your default image
import UserDark from "../../assets/user2.png";
import Logo from "../../assets/CSITE_Logo.png";

// ICONS
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";
import OutboxOutlinedIcon from "@mui/icons-material/OutboxOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined"; 
import ArchiveIcon from "@mui/icons-material/ArchiveOutlined"; 
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined"; 
import PrivacyTipOutlinedIcon from "@mui/icons-material/PrivacyTipOutlined"; 

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={icon}
      component={<Link to={to} />}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const TheSidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");
  const location = useLocation();

  // --- UPDATED USER STATE ---
  const [userProfile, setUserProfile] = useState({
    username: "Loading...",
    email: "",
    photoURL: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserProfile({
            username: data.username || "User",
            email: user.email,
            photoURL: data.photoURL || null,
          });
        }
      } else {
        setUserProfile({ username: "Guest", email: "", photoURL: null });
      }
    });

    // Syncing the highlight with the current URL
    const path = location.pathname;
    const segments = {
      "/dashboard": "Dashboard",
      "/notifications": "Notifications",
      "/track-document": "Track Document",
      "/add-document": "Add Document",
      "/receive-document": "Receive Document",
      "/release-document": "Release Document",
      "/archives": "Archives",
      "/terms": "Terms and Conditions",
      "/privacy": "Privacy Policy",
    };
    setSelected(segments[path] || "Dashboard");

    return () => unsubscribe(); 
  }, [location.pathname]);

    // Define the highlight color once to ensure consistency
  const highlightBg = theme.palette.mode === "dark" 
      ? colors.primary[400] 
      : "#92b3d7"; // Use your soft blue hex for the highlight row

  const defaultImage = theme.palette.mode === "dark" ? UserDark : UserLight;
  
  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 100,
        "& .ps-sidebar-root": { height: "100% !important", border: "none" },
        "& .ps-sidebar-container": {
          height: "100vh !important",
          background: theme.palette.mode === "dark" 
            ? `${colors.primary[500]} !important` 
            : `#f2f2f2 !important`, 
          borderRight: theme.palette.mode === "dark" ? "none" : `1px solid ${colors.grey[800]}`,
        },
        /* FULL ROW CLICKABLE AREA */
        "& .ps-menu-button": {
          padding: isCollapsed ? "5px 20px !important" : "5px 35px 5px 20px !important",
          backgroundColor: "transparent !important",
        },
        /* HOVER STATE */
        "& .ps-menu-button:hover": {
          color: `${colors.blueAccent[400]} !important`,
          backgroundColor: `${highlightBg} !important`,
        },
        /* ACTIVE STATE */
        "& .ps-active .ps-menu-button": {
          color: `${colors.blueAccent[500]} !important`,
          backgroundColor: `${highlightBg} !important`,
        },
        /* PREVENT DOUBLE-DARKENING ON RE-CLICK/HOVER */
        "& .ps-active .ps-menu-button:hover": {
          backgroundColor: `${highlightBg} !important`,
        }
      }}
    >
      <ProSidebarProvider>
        <Sidebar collapsed={isCollapsed} backgroundColor="transparent">
<Menu>
  {/* LOGO & TOGGLE SECTION */}
  <Box
    mb="20px"
    mt="10px"
    sx={{
      width: "100%",
      minHeight: "50px",
    }}
  >
    {isCollapsed ? (
      /* 1. COLLAPSED VIEW: Just the icon centered */
      <Box display="flex" justifyContent="center" width="100%">
        <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
          <MenuOutlinedIcon style={{ color: colors.grey[100] }} />
        </IconButton>
      </Box>
    ) : (
      /* 2. EXPANDED VIEW: Logo centered and Icon on the same line */
      <Box 
        display="flex" 
        flexDirection="row" 
        alignItems="center"
        justifyContent="space-between" // Pushes the items apart
        px="15px"
        sx={{
          "& img:hover": {
            transform: "scale(1.1)", 
            filter: `drop-shadow(0 0 12px ${colors.blueAccent[400]})`,
          },
          "& img": {
            transition: "all 0.3s ease-in-out",
          }
        }}
      >
        {/* Invisible Spacer - Ensures the logo stays dead-center */}
        <Box width="40px" /> 

        {/* Logo in the middle */}
        <img
          alt="CSITE Logo"
          src={Logo}
          style={{ 
            width: "60px",
            height: "60px", 
            objectFit: "contain",
            cursor: "pointer",
          }}
        />

        {/* Toggle Button on the right */}
        <IconButton onClick={() => setIsCollapsed(!isCollapsed)} style={{ width: "40px" }}>
          <MenuOutlinedIcon style={{ color: colors.grey[100] }} />
        </IconButton>
      </Box>
    )}
  </Box>

            {/* USER PROFILE SECTION */}
            {!isCollapsed && (
              <Box mb="25px" textAlign="center">
                <Box display="flex" justifyContent="center" alignItems="center">
                  <img
                    alt="profile-user"
                    width="80px"
                    height="80px"
                    /* Logic: 
                      1. Use userProfile.photoURL if the user uploaded one.
                      2. Otherwise, use 'defaultImage' (which switches between UserDark and UserLight).
                    */
                    src={userProfile.photoURL ? userProfile.photoURL : defaultImage}
                    style={{ 
                        cursor: "pointer", 
                        borderRadius: "50%", 
                        objectFit: "cover"
                    }}
                  />
                </Box>
                <Typography variant="h4" color={colors.grey[100]} fontWeight="bold" sx={{ m: "10px 0 0 0" }}>
                  {userProfile.username}
                </Typography>
                <Typography variant="h6" color={colors.greenAccent[500]} sx={{ fontSize: "11px" }}>
                  {userProfile.email}
                </Typography>
              </Box>
            )}

            <Box>

              {/* MAIN */}
              <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 0", textAlign: isCollapsed ? "center" : "left", pl: isCollapsed ? 0 : "20px" }}>
                {isCollapsed ? "Main" : "Main"}
              </Typography>
              <Item title="Dashboard" to="/dashboard" icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} />
              <Item title={isCollapsed ? "Notif" : "Notifications"} to="/notifications" icon={<NotificationsOutlinedIcon />} selected={selected} setSelected={setSelected} />

              {/* OPERATIONS */}
              <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 0", textAlign: isCollapsed ? "center" : "left", pl: isCollapsed ? 0 : "20px" }}>
                {isCollapsed ? "Ops" : "Operations"}
              </Typography>
              <Item title={isCollapsed ? "Track" : "Track Document"} to="/track-document" icon={<LocationOnOutlinedIcon />} selected={selected} setSelected={setSelected} />
              <Item title={isCollapsed ? "Add" : "Add Document"} to="/add-document" icon={<AddBoxOutlinedIcon />} selected={selected} setSelected={setSelected} />
              <Item title={isCollapsed ? "In" : "Inbox (Receive)"} to="/receive-document" icon={<MoveToInboxOutlinedIcon />} selected={selected} setSelected={setSelected} />
              <Item title={isCollapsed ? "Out" : "Outbox (Release)"} to="/release-document" icon={<OutboxOutlinedIcon />} selected={selected} setSelected={setSelected} />

              {/* MANAGEMENT */}
              <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 0", textAlign: isCollapsed ? "center" : "left", pl: isCollapsed ? 0 : "20px" }}>
                {isCollapsed ? "Mgmt" : "Management"}
              </Typography>
              <Item title={isCollapsed ? "Arch" : "Archives"} to="/archives" icon={<ArchiveIcon />} selected={selected} setSelected={setSelected} />

              {/* SYSTEM */}
              <Typography variant="h6" color={colors.grey[300]} sx={{ m: "15px 0 5px 0", textAlign: isCollapsed ? "center" : "left", pl: isCollapsed ? 0 : "20px" }}>
                {isCollapsed ? "Sys" : "System"}
              </Typography>
              <Item title={isCollapsed ? "Terms" : "Terms and Conditions"} to="/terms" icon={<GavelOutlinedIcon />} selected={selected} setSelected={setSelected} />
              <Item title={isCollapsed ? "Privacy" : "Privacy Policy"} to="/privacy" icon={<PrivacyTipOutlinedIcon />} selected={selected} setSelected={setSelected} />            
            </Box>
          </Menu>
        </Sidebar>
      </ProSidebarProvider>
    </Box>
  );
};

export default TheSidebar;