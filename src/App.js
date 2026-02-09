import { Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";

// Public Scenes
import LoginSignup from "./scenes/login/LoginSignup";
import Terms from "./scenes/policies/terms";
import PrivacyPolicy from "./scenes/policies/PrivacyPolicy";

// Protected Scenes
import Sidebar from "./scenes/global/Sidebar";
import Topbar from "./scenes/global/Topbar";
import Dashboard from "./scenes/dashboard/index"; // Ensure this points to your dashboard index
import AddDocument from "./scenes/document/AddDocument";

function App() {
  const [theme, colorMode] = useMode();
  const location = useLocation();

  // Define which paths should NOT have the Sidebar/Topbar
  const isPublicPage = 
    location.pathname === "/" || 
    location.pathname === "/policies/Terms" || 
    location.pathname === "/policies/PrivacyPolicy";

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {isPublicPage ? (
          /* 🔐 PUBLIC PAGES (Standalone screens) */
          <Routes>
            <Route path="/" element={<LoginSignup />} />
            <Route path="/policies/Terms" element={<Terms />} />
            <Route path="/policies/PrivacyPolicy" element={<PrivacyPolicy />} />
          </Routes>
        ) : (
          /* 📊 PROTECTED LAYOUT (Persistent Sidebar & Topbar) */
          <div className="app" style={{ display: "flex", height: "100vh" }}>
            <Sidebar />
            <main className="content" style={{ flexGrow: 1, overflowY: "auto" }}>
              <Topbar />
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/add-document" element={<AddDocument />} />
                {/* As you build more tabs, add their Routes here */}
              </Routes>
            </main>
          </div>
        )}

      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;