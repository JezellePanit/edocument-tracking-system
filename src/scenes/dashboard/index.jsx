import React, { useState } from 'react'; 
import { 
  Box, Typography, Card, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CssBaseline, useTheme, MenuItem, FormControl, Select, Stack,
  Chip // Added missing import to fix ESLint error
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import { tokens } from "../../theme"; 

// 1. STATS DATA
const DASHBOARD_STATS = [
  { id: 1, value: "9", label: "Pending", color: "#f59e0b" },
  { id: 2, value: "3", label: "Approved", color: "#10b981" }, 
  { id: 3, value: "6", label: "Rejected", color: "#ef4444" },
  { id: 4, value: "1", label: "Review", color: "#6366f1" },
];

// 2. LEAVE DATA
const LEAVE_DATA = [
  { id: 1, name: 'Emily Davis', from: '16 Nov', to: '17 Nov' },
  { id: 2, name: 'Sarah Johnson', from: '15 Nov', to: '19 Nov' },
  { id: 3, name: 'Michael Anderson', from: '17 Nov', to: '20 Nov' },
  { id: 4, name: 'John Doe', from: '18 Nov', to: '21 Nov' },
  { id: 5, name: 'Jane Smith', from: '20 Nov', to: '22 Nov' },
];

// 3. SAMPLE DOCUMENTS DATA
const SAMPLE_DOCS = [
  { id: 'M-1', type: 'Memorandum', title: 'Holiday Schedule 2024', date: 'Oct 10' },
  { id: 'O-1', type: 'Office Order', title: 'New Work-from-Home Policy', date: 'Oct 12' },
  { id: 'N-1', type: 'Notice', title: 'System Maintenance Alert', date: 'Oct 14' },
  { id: 'M-2', type: 'Memorandum', title: 'Annual Performance Review', date: 'Oct 15' },
  { id: 'O-2', type: 'Office Order', title: 'Security Protocol Update', date: 'Oct 18' },
];

const AttendanceDashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === 'dark';

  // --- STATE ---
  const [docType, setDocType] = useState('All');

  // --- LOGIC ---
  const filteredDocs = docType === 'All' 
    ? SAMPLE_DOCS 
    : SAMPLE_DOCS.filter(doc => doc.type === docType);

  const totalOnLeave = LEAVE_DATA.length;

  return (
    <Box sx={{
      width: "100%",
      height: "100vh", 
      display: "flex",
      flexDirection: "column",
      p: "24px",
      gap: "24px",
      overflow: "hidden",
      bgcolor: isDark ? colors.primary[500] : "#f4f7f9"
    }}>
      <CssBaseline />
      
      {/* --- HEADER --- */}
      <Box>
        <Typography variant="h2" color={colors.grey[100]} fontWeight="800" sx={{ letterSpacing: "-1px" }}>
          DASHBOARD
        </Typography>
        <Typography variant="h5" color={colors.greenAccent[400]} fontWeight="500">
          Document Overview & Attendance
        </Typography>
      </Box>

      {/* --- STATS SECTION --- */}
      <Box sx={{ display: 'flex', gap: '20px', width: '100%' }}>
        {DASHBOARD_STATS.map((stat) => (
          <Card key={stat.id} sx={{
            flex: 1,
            p: 3,
            backgroundColor: colors.primary[400],
            borderRadius: '24px',
            backgroundImage: 'none',
            border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
            boxShadow: isDark ? "0 10px 30px rgba(0,0,0,0.3)" : "0 4px 12px rgba(0,0,0,0.05)",
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <Box sx={{ 
              display: 'inline-flex', px: 2, py: 0.5, borderRadius: '8px', 
              bgcolor: `${stat.color}15`, color: stat.color, 
              mb: 1.5, fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase'
            }}>
              {stat.label}
            </Box>
            <Typography variant="h1" fontWeight="800" color={colors.grey[100]}>
              {stat.value}
            </Typography>
            <Typography variant="caption" color={colors.grey[400]} sx={{ fontWeight: 500 }}>
              Current Status
            </Typography>
          </Card>
        ))}
      </Box>

      {/* --- MAIN BODY SECTION --- */}
      <Box sx={{ display: 'flex', flexGrow: 1, gap: '24px', minHeight: 0, width: '100%' }}>
        
        {/* LEFT CARD: Document Explorer */}
        <Card sx={{
          flex: 1.5, 
          p: 3,
          backgroundColor: colors.primary[400],
          borderRadius: '28px',
          backgroundImage: 'none',
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDark ? "0 15px 40px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.05)"
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} px={1}>
            <Typography variant="h4" fontWeight="800" color={colors.grey[100]}>
              Document Explorer
            </Typography>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                sx={{
                  color: colors.grey[100],
                  bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                  borderRadius: "12px",
                  fontWeight: 600,
                  "& .MuiOutlinedInput-notchedOutline": { border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #eee" },
                  "& .MuiSvgIcon-root": { color: colors.grey[100] }
                }}
              >
                <MenuItem value="All">All Documents</MenuItem>
                <MenuItem value="Memorandum">Memorandum</MenuItem>
                <MenuItem value="Office Order">Office Order</MenuItem>
                <MenuItem value="Notice">Notice</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          
          <Box sx={{ flexGrow: 1, overflow: 'auto', pr: 1 }}>
            {filteredDocs.map((doc) => (
              <Box 
                key={doc.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  mb: 1.5,
                  borderRadius: '16px',
                  bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#fff",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#f0f0f0"}`,
                  transition: "all 0.2s ease",
                  '&:hover': { 
                    bgcolor: isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0,0,0,0.02)",
                    transform: "translateX(6px)",
                    cursor: 'pointer',
                    borderColor: colors.blueAccent[500]
                  }
                }}
              >
                <Avatar sx={{ 
                  bgcolor: isDark ? `${colors.blueAccent[600]}33` : colors.blueAccent[100], 
                  mr: 2, 
                  border: `1px solid ${colors.blueAccent[500]}66` 
                }}>
                  <DescriptionIcon sx={{ color: colors.blueAccent[400] }} />
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="700" color={colors.grey[100]}>
                    {doc.title}
                  </Typography>
                  <Typography variant="caption" color={colors.grey[400]}>
                    <span style={{ color: colors.greenAccent[400], fontWeight: 700 }}>{doc.type}</span> • Created {doc.date}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Card>

        {/* RIGHT CARD: Who's Out */}
        <Card sx={{
          flex: 1, 
          p: 3,
          backgroundColor: colors.primary[400],
          borderRadius: '28px',
          backgroundImage: 'none',
          border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isDark ? "0 15px 40px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.05)"
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Typography variant="h4" fontWeight="800" color={colors.grey[100]}>
              Who's Out
            </Typography>
            <Chip 
              label={totalOnLeave} 
              size="small" 
              sx={{ 
                bgcolor: colors.blueAccent[600], 
                color: "#fff", 
                fontWeight: 900, 
                borderRadius: '8px' 
              }} 
            />
          </Box>
          
          <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: colors.primary[400], color: colors.grey[400], fontWeight: 800, fontSize: '0.7rem', borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#eee"}` }}>EMPLOYEE</TableCell>
                  <TableCell sx={{ bgcolor: colors.primary[400], color: colors.grey[400], fontWeight: 800, fontSize: '0.7rem', borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#eee"}` }}>PERIOD</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {LEAVE_DATA.map((row) => (
                  <TableRow 
                    key={row.id}
                    sx={{ 
                      transition: "background-color 0.2s ease",
                      '&:hover': { bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)" }
                    }}
                  >
                    <TableCell sx={{ py: 2, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "#f5f5f5"}` }}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: colors.blueAccent[400], fontSize: '0.8rem', fontWeight: 700 }}>
                          {row.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight="700" color={colors.grey[100]}>
                          {row.name}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "#f5f5f5"}` }}>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          bgcolor: isDark ? "rgba(0,0,0,0.2)" : "#f0f0f0", 
                          px: 1, py: 0.5, 
                          borderRadius: '6px', 
                          color: colors.grey[100], 
                          fontWeight: 600 
                        }}
                      >
                        {row.from} - {row.to}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Box>
    </Box>
  );
};

export default AttendanceDashboard;