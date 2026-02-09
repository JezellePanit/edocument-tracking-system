import { useState } from "react";
import { Sidebar, Menu, MenuItem, ProSidebarProvider } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";

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


const Item = ({ title, to, icon , selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100],}}
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

  return (
    <Box
      sx = {{
        "& .ps-sidebar-container": {
          background: `${colors.primary[400]} !important`, },
        "& .ps-menu-button:hover": {
          color: "#868dfb !important",
          backgroundColor: "transparent !important", },
        "& .ps-active": { color: "6870fa !important", },
      }}
    >

    <ProSidebarProvider>
      {/* color of the sidebar */}
      <Sidebar collapsed = { isCollapsed} backgroundColor="transparent" style={{ border: "none"}}> 
        <Menu>
          {/* LOGO AND MENU ICON */}
          <MenuItem
           onClick={() => setIsCollapsed(!isCollapsed)}
           icon={isCollapsed ? <MenuOutlinedIcon/> : undefined}
           style={{ margin: "10px 0 20px 0", color: colors.grey[100]}}
          >
            {!isCollapsed && (
              <Box
                display = "flex"
                justifyContent = "space-between"
                alignItems = "center"
                ml = "15px"
              >
                <Typography variant = "h3" color = {colors.grey[100]}> CSITE </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}> <MenuOutlinedIcon/> </IconButton>
              </Box>
            )}
          </MenuItem>

            {/* USER */}
            {!isCollapsed && (
              <Box mb="25px">
                {/* USER PHOTO */}
                <Box display="flex" justifyContent="center" alignItems="center">
                  <img
                    alt = "profile-user"
                    width = "40px"
                    height= "40px"
                    src = {`../../assets/user.png`}
                    style = {{ cursor: "pointer", borderRadius: "50%"}}
                  />
                </Box>

                {/* USER INFO */}
                <Box textAlign="center">
                  <Typography
                    variant = "h4"
                    color = {colors.grey[100]}
                    fontWeight="bold"
                    sx = {{ m: "10px 0 0 0"}}
                  > Juan Dela Cruz </Typography>
                  <Typography variant = "h5" color = {colors.grey[100]}> HR Admin </Typography>
                </Box>
              </Box>
            )}

              <Box paddingLeft={isCollapsed ? undefined : "10%"}>
                <Item
                  title = "Dashboard"
                  to = "/"
                  icon = {<HomeOutlinedIcon/>}
                  selected = {selected}
                  setSelected = {setSelected}
                />

                <Typography
                  variant = "h6"
                  color = {colors.grey[300]}
                  fontWeight="bold"
                  sx = {{ m: "15px 0 5px 20px"}}
                > Data </Typography>

                <Item
                  title = "Manage Team"
                  to = "/team"
                  icon = {<PeopleOutlinedIcon/>}
                  selected = {selected}
                  setSelected = {setSelected}
                />

                <Item
                  title = "Contacts Information"
                  to = "/contacts"
                  icon = {<ContactsOutlinedIcon/>}
                  selected = {selected}
                  setSelected = {setSelected}
                />

                <Item
                  title = "Invoices Balances"
                  to = "/invoices"
                  icon = {<ReceiptOutlinedIcon/>}
                  selected = {selected}
                  setSelected = {setSelected}
                />

                <Typography
                  variant = "h6"
                  color = {colors.grey[300]}
                  fontWeight="bold"
                  sx = {{ m: "15px 0 5px 20px"}}
                > Pages </Typography>

                <Item
                  title = "Profile form"
                  to = "/form"
                  icon = {<PersonOutlinedIcon/>}
                  selected = {selected}
                  setSelected = {setSelected}
                />

                <Item
                  title = "Calendar"
                  to = "/calendar"
                  icon = {<CalendarTodayOutlinedIcon/>}
                  selected = {selected}
                  setSelected = {setSelected}
                />

                <Item
                  title = "FAQ Page"
                  to = "/faq"
                  icon = {<HelpOutlinedIcon/>}
                  selected = {selected}
                  setSelected = {setSelected}
                />

                <Typography
                  variant = "h6"
                  color = {colors.grey[300]}
                  fontWeight="bold"
                  sx = {{ m: "15px 0 5px 20px"}}
                > Charts </Typography>

                <Item
                  title = "Bar Chart"
                  to = "/bar"
                  icon = {<BarChartOutlinedIcon/>}
                  selected = {selected}
                  setSelected = {setSelected}
                />

                <Item
                  title = "Pie Chart"
                  to = "/pie"
                  icon = {<PieChartOutlinedIcon/>}
                  selected = {selected}
                  setSelected = {setSelected}
                />

                <Item
                  title = "Line Chart"
                  to = "/line"
                  icon = {<TimelineOutlinedIcon/>}
                  selected = {selected}
                  setSelected = {setSelected}
                />
              </Box>
          </Menu>
        </Sidebar>
      </ProSidebarProvider>
    </Box>
  );
};

export default TheSidebar;