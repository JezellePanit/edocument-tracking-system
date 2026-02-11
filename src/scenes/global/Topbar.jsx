import { Box, IconButton, useTheme, Menu, MenuItem, Divider } from "@mui/material"; // Added Menu components
import { useContext, useState } from "react"; // Added useState
import { useNavigate } from "react-router-dom"; // Added for navigation
import { ColorModeContext, tokens } from "../../theme";
import { InputBase } from "@mui/material";
import { auth } from "../../firebaseConfig"; // Ensure you import auth for logout
import { signOut } from "firebase/auth";

// ================ ICONS ==========================
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SearchIcon from "@mui/icons-material/Search";
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';

const Topbar = ({ searchTerm, setSearchTerm }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();

  // --- STATE FOR DROPDOWN MENU ---
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

const handleLogout = async () => {
    try {
      // 1. Tell Firebase to end the session
      await signOut(auth);
      
      // 2. Redirect to LoginSignup and 'replace' the history entry
      // This ensures that clicking "Back" in the browser won't return to the dashboard
      navigate("/login", { replace: true }); 
      
    } catch (error) {
      console.error("Logout Error:", error);
    }
    handleCloseMenu();
  };

  const handleProfileClick = () => {
    navigate("/account"); // Directs to /src/scenes/account/index.jsx
    handleCloseMenu();
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      >
        <InputBase 
          sx={{ ml: 2, flex: 1 }} 
          placeholder="Search" 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <IconButton type="button" sx={{ p: 1 }}> <SearchIcon/> </IconButton>
      </Box>
      
      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === 'dark' ? ( <DarkModeOutlinedIcon/> ) : ( <LightModeOutlinedIcon/> )} 
        </IconButton>

        <IconButton> <NotificationsOutlinedIcon/> </IconButton>
        <IconButton> <SettingsOutlinedIcon/> </IconButton>
        
        {/* PERSON ICON WITH MENU */}
        <IconButton onClick={handleOpenMenu}> 
          <PersonOutlinedIcon/> 
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleCloseMenu}
          onClick={handleCloseMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{
            sx: {
              backgroundColor: colors.primary[400], // Matches your theme
              minWidth: "150px",
              marginTop: "10px",
              boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)"
            }
          }}
        >
          <MenuItem onClick={handleProfileClick} sx={{ gap: "10px" }}>
            <ManageAccountsOutlinedIcon fontSize="small" />
            Edit Profile
          </MenuItem>
          
          <Divider />

          <MenuItem onClick={handleLogout} sx={{ gap: "10px", color: theme.palette.error.main }}>
            <LogoutOutlinedIcon fontSize="small" />
            Logout
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Topbar;