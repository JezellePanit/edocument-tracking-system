import { Routes, Route, useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { ProSidebarProvider } from "react-pro-sidebar";
import React, { useState } from "react";

/* ===== PUBLIC SCENES ===== */
import LoginSignup from "./scenes/login/LoginSignup";
import Terms from "./scenes/policies/terms";
import PrivacyPolicy from "./scenes/policies/PrivacyPolicy";

/* ===== GLOBAL LAYOUT ===== */
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";

/* ===== PROTECTED SCENES ===== */
import Dashboard from "./scenes/dashboard";
// COMMENTED OUT OR REMOVE IF FILE IS GONE:
// import AddDocument from "./scenes/document/AddDocument"; 
import Team from "./scenes/team";
import MyDocument from "./scenes/mydocument";
import Contacts from "./scenes/contacts";
import Inbox from "./scenes/inbox";
import Outbox from "./scenes/outbox";
import Bar from "./scenes/bar";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Calendar from "./scenes/calendar";

function App() {
  const [theme, colorMode] = useMode();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Pages WITHOUT sidebar/topbar
  const isPublicPage =
    location.pathname === "/" ||
    location.pathname === "/policies/Terms" ||
    location.pathname === "/policies/PrivacyPolicy";

  return (
    <ProSidebarProvider>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />

          {isPublicPage ? (
            /* 🔓 PUBLIC ROUTES */
            <Routes>
              <Route path="/" element={<LoginSignup />} />
              <Route path="/policies/Terms" element={<Terms />} />
              <Route path="/policies/PrivacyPolicy" element={<PrivacyPolicy />} />
            </Routes>
          ) : (
            /* 🔐 PROTECTED LAYOUT */
            <div className="app" style={{ display: "flex", height: "100vh" }}>
              <Sidebar />
              <main className="content" style={{ flexGrow: 1, overflowY: "auto" }}>
                <Topbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/team" element={<Team searchTerm={searchTerm}/>} />
                  <Route path="/contacts" element={<Contacts searchTerm={searchTerm}/>} />
                  <Route path="/mydocument" element={<MyDocument searchTerm={searchTerm}/>} />
                  <Route path="/inbox" element={<Inbox searchTerm={searchTerm}/>} />
                  <Route path="/outbox" element={<Outbox searchTerm={searchTerm}/>} />
                  <Route path="/bar" element={<Bar searchTerm={searchTerm}/>} />
                  <Route path="/pie" element={<Pie searchTerm={searchTerm}/>} />
                  <Route path="/line" element={<Line searchTerm={searchTerm}/>} />
                  <Route path="/faq" element={<FAQ searchTerm={searchTerm}/>} />
                  <Route path="/calendar" element={<Calendar searchTerm={searchTerm}/>} />
                </Routes>
              </main>
            </div>
          )}

        </ThemeProvider>
      </ColorModeContext.Provider>
    </ProSidebarProvider>
  );
}

export default App;