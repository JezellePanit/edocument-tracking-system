import { Box, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import InputBase from "@mui/material/InputBase";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";

// FIREBASE & NAVIGATION
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to login page after logout
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <Box 
      display="flex" 
      justifyContent="space-between" 
      p={2} 
      /* Ensures Topbar background matches sidebar theme logic */
      backgroundColor={theme.palette.mode === "dark" ? "transparent" : "#fcfcfc"}
      borderBottom={theme.palette.mode === "dark" ? "none" : `1px solid ${colors.grey[800]}`}
    >
      {/* SEARCH BAR */}
    <Box 
    display="flex" 
    backgroundColor={theme.palette.mode === "dark" ? colors.primary[400] : colors.grey[900]} 
    borderRadius="8px"
    border={theme.palette.mode === "light" ? `1px solid ${colors.grey[800]}` : "none"}
    >
    <InputBase sx={{ ml: 2, flex: 1 }} placeholder="Search" />
    <IconButton type="button" sx={{ p: 1 }}>
        <SearchIcon />
    </IconButton>
    </Box>
    
      {/* ICONS */}
      <Box display="flex">
        {/* Toggle Theme */}
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>

        {/* Settings */}
        <IconButton>
          <SettingsOutlinedIcon />
        </IconButton>

        {/* Profile / Logout */}
        <IconButton onClick={handleLogout} title="Logout">
          <PersonOutlinedIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

export default Topbar;