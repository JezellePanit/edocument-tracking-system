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

// ICONS (Updated to match your Admin/User categories)
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined"; // For Employees
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined"; // For Departments
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined"; // For Memorandums/Notices
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined"; // For Leave Management
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"; // For Document Management
import PolicyOutlinedIcon from '@mui/icons-material/PolicyOutlined';
import GavelOutlinedIcon from '@mui/icons-material/GavelOutlined';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ContactsOutlinedIcon from "@mui/icons-material/ContactsOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import MoveToInboxOutlinedIcon from '@mui/icons-material/MoveToInboxOutlined';
import OutboxOutlinedIcon from '@mui/icons-material/OutboxOutlined';
import FolderOpenOutlinedIcon from '@mui/icons-material/FolderOpenOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'; // CORRECT


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
  const [userRole, setUserRole] = useState(""); 
  const location = useLocation();

  const [userProfile, setUserProfile] = useState({
    username: "Loading...",
    email: "",
    jobTitle: "",
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
          
          // 🔥 DEBUG LINES MOVED HERE (Inside the check)
          console.log("Fetched Role from Firestore:", data.role); 
          
          setUserRole(data.role); 
          setUserProfile({
            username: data.username || "User",
            email: user.email,
            jobTitle: data.jobTitle || "",
            photoURL: data.photoURL || null,
          });
        } else {
          console.log("No such document in Firestore for this user!");
        }
      }
    });

    // Sync menu selection with current URL
    const path = location.pathname;
    if (path === "/dashboard") setSelected("Dashboard");
    else if (path === "/team") setSelected("Track Document");
    else if (path === "/contacts") setSelected("Archive");
    else if (path === "/mydocument") setSelected("My Document");
    else if (path === "/inbox") setSelected("Inbox");
    else if (path === "/outbox") setSelected("Outbox");
    else if (path === "/calendar") setSelected("Calendar");
    else if (path === "/faq") setSelected("FAQ Page");
    else if (path === "/bar") setSelected("Bar Chart");
    else if (path === "/pie") setSelected("Pie Chart");
    else if (path === "/line") setSelected("Line Chart");
    else if (path === "/home") setSelected("Home");
    else if (path === "/documentmanagement") setSelected("Document Management");
    else if (path === "/department") setSelected("Department");
    else if (path === "/line") setSelected("Line Chart");
    else if (path === "/leavemanagement") setSelected("Leave Management");
    else if (path === "/tracker") setSelected("Document Tracker");
    else if (path === "/leaverequest") setSelected("Leave Application");

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
        <Sidebar collapsed = {isCollapsed} backgroundColor = "transparent">
          <Menu>
            {/* LOGO & TOGGLE SECTION */}
            <Box mb = "20px" mt = "10px" sx = {{ width: "100%", minHeight: "50px" }}>
              {isCollapsed ? (

                <Box display = "flex" justifyContent = "center" width = "100%">
                  <IconButton onClick = {() => setIsCollapsed(!isCollapsed)}>
                    <MenuOutlinedIcon style = {{ color: colors.grey[100] }} />
                  </IconButton>
                </Box>

              ) : (
                <Box display = "flex" flexDirection = "row" alignItems = "center" justifyContent = "space-between" px = "15px">
                  <Box width = "40px" /> 
                  <img alt = "Logo" src = {Logo} style = {{ width: "60px", height: "60px", objectFit: "contain", cursor: "pointer" }} />
                  <IconButton onClick = {() => setIsCollapsed(!isCollapsed)}>
                    <MenuOutlinedIcon style = {{ color: colors.grey[100] }} />
                  </IconButton>
                </Box>
              )}
            </Box>

            {/* =============== USER PROFILE SECTION */}
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

                <Typography 
                  variant="h4" 
                  color={colors.grey[100]} 
                  fontWeight="bold" 
                  sx={{ m: "10px 0 0 0" }}>
                  {userProfile.username}
                </Typography>

                {/* Display the Job Title here */}
                <Typography variant="h6" color={colors.blueAccent[400]}>
                  {userProfile.jobTitle}
                </Typography>

                <Typography 
                  variant="h6" 
                  color={colors.greenAccent[500]} 
                  sx={{ fontSize: "11px" }}>
                  {userProfile.email}
                </Typography>

              </Box>
            )}

          {/* ROLE-BASED SIDE BAR */}
          <Box paddingLeft={isCollapsed ? undefined : "5%"}>
            
            {/* 1. ADMIN MENU - Added .toLowerCase() for safety */}
            {userRole?.toLowerCase() === "admin" && (
              <>
                <Typography variant="h6" color={colors.grey[300]} fontWeight="bold" sx={{ m: "15px 0 5px 20px" }}>
                  {isCollapsed ? "Main" : "Main"}
                </Typography>
                <Item title="Dashboard" to="/dashboard" icon={<HomeOutlinedIcon/>} selected={selected} setSelected={setSelected} />
                <Item title="Employees" to="/bar" icon={<PeopleOutlinedIcon/>} selected={selected} setSelected={setSelected} />
                <Item title="Departments" to="/department" icon={<BusinessOutlinedIcon />} selected={selected} setSelected={setSelected} />

                <Typography variant="h6" color={colors.grey[300]} fontWeight="bold" sx={{ m: "15px 0 5px 20px" }}>
                  {isCollapsed ? "Comms" : "Communications"}
                </Typography>
                <Item title="Communication Hub" to="/team" icon={<CampaignOutlinedIcon/>} selected={selected} setSelected={setSelected} />

                <Typography variant="h6" color={colors.grey[300]} fontWeight="bold" sx={{ m: "15px 0 5px 20px" }}>
                  {isCollapsed ? "Mgmt" : "Managment"}
                </Typography>
                <Item title="Leave Management" to="/leavemanagement" icon={<EventNoteOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="Document Management" to="/mydocument" icon={<DescriptionOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="Document Tracker" to="/tracker" icon={<DescriptionOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="Leave Management" to="/inbox" icon={<EventNoteOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="Document Management" to="/documentmanagement" icon={<DescriptionOutlinedIcon />} selected={selected} setSelected={setSelected} />

                <Typography variant="h6" color={colors.grey[300]} fontWeight="bold" sx={{ m: "15px 0 5px 20px" }}>
                  {isCollapsed ? "Lib" : "Library"}
                </Typography>
                <Item title="Archive" to="/contacts" icon={<ContactsOutlinedIcon />} selected={selected} setSelected={setSelected} />
              </>
            )}

            {/* 2. USER MENU - Added .toLowerCase() for safety */}
            {userRole?.toLowerCase() === "user" && (
              <>
                {/* a. User */}              
                <Typography variant="h6" color={colors.grey[300]} fontWeight="bold" sx={{ m: "15px 0 5px 20px" }}>
                  {isCollapsed ? "Main" : "Main"}
                </Typography>
                <Item title="Home" to="/home" icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} />

                {/* b. Operations) */}
                <Typography variant="h6" color={colors.grey[300]} fontWeight="bold" sx={{ m: "15px 0 5px 20px" }}>
                  {isCollapsed ? "Ops" : "Operations"}
                </Typography>
                <Item title="Leave Application" to="/leaverequest" icon={<CalendarTodayOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="My Documents" to="/mydocument" icon={<FileUploadOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="Leave Application" to="/leave-apply" icon={<CalendarTodayOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="My Documents" to="/mydocument" icon={<InsertDriveFileOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="Inbox" to="/inbox" icon={<MoveToInboxOutlinedIcon />} selected={selected} setSelected={setSelected} />   
                <Item title="Outbox" to="/outbox" icon={<OutboxOutlinedIcon />} selected={selected} setSelected={setSelected} />

                {/* c. Library */}
                <Typography variant="h6" color={colors.grey[300]} fontWeight="bold" sx={{ m: "15px 0 5px 20px" }}>
                  {isCollapsed ? "Lib" : "Library"}
                </Typography>
                <Item title="Archive" to="/contacts" icon={<FolderOpenOutlinedIcon />} selected={selected} setSelected={setSelected} />

                {/* d. Support */}
                <Typography variant="h6" color={colors.grey[300]} fontWeight="bold" sx={{ m: "15px 0 5px 20px" }}>
                  {isCollapsed ? "Terms" : "Terms & Policies"}
                </Typography>
                <Item title="Privacy Policy" to="/calendar" icon={<PolicyOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="Terms and Conditions" to="/faq" icon={<GavelOutlinedIcon />} selected={selected} setSelected={setSelected} />
              </>
            )}
          </Box>
          </Menu>
        </Sidebar>
      </ProSidebarProvider>
    </Box>
  );
};

export default TheSidebar;