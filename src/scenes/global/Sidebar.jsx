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
import UserLight from "../../assets/user1.png"; 
import UserDark from "../../assets/user2.png";
import Logo from "../../assets/CSITE_Logo.png";

// ICONS
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import ReceiptOutlinedIcon from "@mui/icons-material/ReceiptOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import HelpOutlinedIcon from "@mui/icons-material/HelpOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import PieChartOutlinedIcon from "@mui/icons-material/PieChartOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";

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

  const [userProfile, setUserProfile] = useState({
    username: "Loading...",
    email: "",
    photoURL: null,
  });

  // Handle Auth and Sync Highlight with URL
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

    // Auto-select menu item based on current URL
    const path = location.pathname;
    if (path === "/dashboard") setSelected("Dashboard");
    else if (path === "/team") setSelected("Track Data");
    else if (path === "/contacts") setSelected("Contacts Information");
    else if (path === "/mydocument") setSelected("My Document");
    else if (path === "/receive-document") setSelected("Inbox (Receive)");
    else if (path === "/form") setSelected("Profile Form");
    else if (path === "/calendar") setSelected("Calendar");
    else if (path === "/faq") setSelected("FAQ Page");
    else if (path === "/bar") setSelected("Bar Chart");
    else if (path === "/pie") setSelected("Pie Chart");
    else if (path === "/line") setSelected("Line Chart");

    return () => unsubscribe();
  }, [location.pathname]);

  const highlightBg = theme.palette.mode === "dark" 
      ? colors.primary[400] 
      : "#92b3d7";

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
        "& .ps-menu-button": {
          padding: isCollapsed ? "5px 20px !important" : "5px 35px 5px 20px !important",
          backgroundColor: "transparent !important",
        },
        "& .ps-menu-button:hover": {
          color: `${colors.blueAccent[400]} !important`,
          backgroundColor: `${highlightBg} !important`,
        },
        "& .ps-active .ps-menu-button": {
          color: `${colors.blueAccent[500]} !important`,
          backgroundColor: `${highlightBg} !important`,
        },
      }}
    >
      <ProSidebarProvider>
        <Sidebar collapsed={isCollapsed} backgroundColor="transparent">
          <Menu>
            {/* LOGO & TOGGLE SECTION */}
            <Box mb="20px" mt="10px" sx={{ width: "100%", minHeight: "50px" }}>
              {isCollapsed ? (
                <Box display="flex" justifyContent="center" width="100%">
                  <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                    <MenuOutlinedIcon style={{ color: colors.grey[100] }} />
                  </IconButton>
                </Box>
              ) : (
                <Box display="flex" flexDirection="row" alignItems="center" justifyContent="space-between" px="15px">
                  <Box width="40px" /> 
                  <img alt="Logo" src={Logo} style={{ width: "60px", height: "60px", objectFit: "contain", cursor: "pointer" }} />
                  <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
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
                    src={userProfile.photoURL ? userProfile.photoURL : defaultImage}
                    style={{ cursor: "pointer", borderRadius: "50%", objectFit: "cover" }}
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

            <Box paddingLeft={isCollapsed ? undefined : "5%"}>
              {/* DASHBOARD LINK */}
              <Item 
                title="Dashboard" 
                to="/dashboard" 
                icon={<HomeOutlinedIcon />} 
                selected={selected} 
                setSelected={setSelected} 
              />

              {/* OPERATIONS SECTION */}
              <Typography variant="h6" color={colors.grey[300]} fontWeight="bold" sx={{ m: "15px 0 5px 20px" }}>
                {isCollapsed ? "Ops" : "Operations"}
              </Typography>
              <Item title="Track Data" to="/team" icon={<PeopleOutlinedIcon />} selected={selected} setSelected={setSelected} />
              <Item title="Contacts Information" to="/contacts" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
              <Item title="My Document" to="/mydocument" icon={<ReceiptOutlinedIcon />} selected={selected} setSelected={setSelected} />
              <Item title="Inbox (Receive)" to="/received" icon={<MoveToInboxOutlinedIcon />} selected={selected} setSelected={setSelected} />
              <Item title="Profile Form" to="/form" icon={<PersonOutlinedIcon />} selected={selected} setSelected={setSelected} />

              {/* PAGES SECTION */}
              <Typography variant="h6" color={colors.grey[300]} fontWeight="bold" sx={{ m: "15px 0 5px 20px" }}>
                {isCollapsed ? "Pages" : "Pages"}
              </Typography>
              <Item title="Calendar" to="/calendar" icon={<CalendarTodayOutlinedIcon />} selected={selected} setSelected={setSelected} />
              <Item title="FAQ Page" to="/faq" icon={<HelpOutlinedIcon />} selected={selected} setSelected={setSelected} />

              {/* CHARTS SECTION */}
              <Typography variant="h6" color={colors.grey[300]} fontWeight="bold" sx={{ m: "15px 0 5px 20px" }}>
                {isCollapsed ? "Charts" : "Charts"}
              </Typography>
              <Item title="Bar Chart" to="/bar" icon={<BarChartOutlinedIcon />} selected={selected} setSelected={setSelected} />
              <Item title="Pie Chart" to="/pie" icon={<PieChartOutlinedIcon />} selected={selected} setSelected={setSelected} />
              <Item title="Line Chart" to="/line" icon={<TimelineOutlinedIcon />} selected={selected} setSelected={setSelected} />
            </Box>
          </Menu>
        </Sidebar>
      </ProSidebarProvider>
    </Box>
  );
};

export default TheSidebar;