import { Routes, Route, useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import { ProSidebarProvider } from "react-pro-sidebar";

/* ===== PUBLIC SCENES ===== */
import LoginSignup from "./scenes/login/LoginSignup";
import Terms from "./scenes/policies/terms";
import PrivacyPolicy from "./scenes/policies/PrivacyPolicy";

/* ===== GLOBAL LAYOUT ===== */
import Topbar from "./scenes/global/Topbar";
import Sidebar from "./scenes/global/Sidebar";

/* ===== PROTECTED SCENES ===== */
import Dashboard from "./scenes/dashboard";
import AddDocument from "./scenes/document/AddDocument";
import Team from "./scenes/team";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import Form from "./scenes/form";
import Bar from "./scenes/bar";
import Line from "./scenes/line";
import Pie from "./scenes/pie";
import FAQ from "./scenes/faq";
import Calendar from "./scenes/calendar";

function App() {
  const [theme, colorMode] = useMode();
  const location = useLocation();

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
                <Topbar />
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/add-document" element={<AddDocument />} />
                  <Route path="/team" element={<Team />} />
                  <Route path="/contacts" element={<Contacts />} />
                  <Route path="/invoices" element={<Invoices />} />
                  <Route path="/form" element={<Form />} />
                  <Route path="/bar" element={<Bar />} />
                  <Route path="/pie" element={<Pie />} />
                  <Route path="/line" element={<Line />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/calendar" element={<Calendar />} />
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
