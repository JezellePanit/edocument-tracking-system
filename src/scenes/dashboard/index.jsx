import React, { useState } from 'react'; 
import { 
  Box, Typography, Card, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CssBaseline, useTheme, MenuItem, FormControl, Select
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

  // --- STATE ---
  const [docType, setDocType] = useState('All');

  // --- LOGIC: Filtered Docs ---
  const filteredDocs = docType === 'All' 
    ? SAMPLE_DOCS 
    : SAMPLE_DOCS.filter(doc => doc.type === docType);

  // --- LOGIC: Count people currently in LEAVE_DATA ---
  const totalOnLeave = LEAVE_DATA.length;

  return (
    <Box sx={{
      width: "100%",
      height: "calc(100vh - 40px)", 
      display: "flex",
      flexDirection: "column",
      p: "20px",
      gap: "20px",
      overflow: "hidden",
      bgcolor: theme.palette.background.default
    }}>
      <CssBaseline />
      
      {/* --- HEADER --- */}
      <Box>
        <Typography variant="h2" color={colors.grey[100]} fontWeight="bold">
          DASHBOARD
        </Typography>
        <Typography variant="h5" color={colors.greenAccent[400]}>
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
            borderRadius: '16px',
            backgroundImage: 'none',
            border: `1px solid ${colors.primary[500]}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}>
            <Box sx={{ 
              display: 'inline-flex', 
              px: 1.5, py: 0.5, 
              borderRadius: '10px', 
              bgcolor: `${stat.color}26`, 
              color: stat.color, 
              mb: 1, 
              fontSize: '0.75rem', 
              fontWeight: 700
            }}>
              {stat.label}
            </Box>
            <Typography variant="h2" fontWeight="800" color={colors.grey[100]}>
              {stat.value}
            </Typography>
            <Typography variant="caption" color={colors.greenAccent[500]}>
              Total Requests
            </Typography>
          </Card>
        ))}
      </Box>

      {/* --- MAIN BODY SECTION --- */}
      <Box sx={{ display: 'flex', flexGrow: 1, gap: '20px', minHeight: 0, width: '100%' }}>
        
        {/* LEFT CARD: Document Explorer */}
        <Card sx={{
          flex: 1.5, 
          p: 4,
          backgroundColor: colors.primary[400],
          borderRadius: '20px',
          backgroundImage: 'none',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight="700" color={colors.grey[100]}>
              Document Explorer
            </Typography>

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                sx={{
                  color: colors.grey[100],
                  bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[900],
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "& .MuiSvgIcon-root": { color: colors.grey[100] }
                }}
                MenuProps={{
                  PaperProps: {
                    sx: { bgcolor: colors.primary[400], backgroundImage: "none" }
                  }
                }}
              >
                <MenuItem value="All">All Documents</MenuItem>
                <MenuItem value="Memorandum">Memorandum</MenuItem>
                <MenuItem value="Office Order">Office Order</MenuItem>
                <MenuItem value="Notice">Notice</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ flexGrow: 1, overflow: 'auto', pr: 1 }}>
            {filteredDocs.map((doc) => (
              <Box 
                key={doc.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  mb: 1.5,
                  borderRadius: '12px',
                  bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : colors.grey[900],
                  border: `1px solid ${colors.primary[600]}`,
                  '&:hover': { 
                    bgcolor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[800],
                    cursor: 'pointer' 
                  }
                }}
              >
                <Avatar sx={{ bgcolor: colors.blueAccent[600], mr: 2 }}>
                  <DescriptionIcon sx={{ color: "#fff" }} />
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight="600" color={colors.grey[100]}>
                    {doc.title}
                  </Typography>
                  <Typography variant="caption" color={colors.greenAccent[400]}>
                    {doc.type} • Created {doc.date}
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
          borderRadius: '20px',
          backgroundImage: 'none',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* HEADER WITH DYNAMIC COUNT BADGE */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Typography variant="h5" fontWeight="700" color={colors.grey[100]}>
              Who's Out
            </Typography>
            <Box sx={{ 
              bgcolor: colors.blueAccent[600], 
              color: "#fff", 
              px: 1.2, 
              py: 0.2, 
              borderRadius: '50px', 
              fontSize: '0.85rem', 
              fontWeight: 'bold' 
            }}>
              {totalOnLeave}
            </Box>
          </Box>

          <Typography variant="caption" color={colors.greenAccent[400]} mb={2}>
            Recent Absences
          </Typography>
          
          <TableContainer sx={{ flexGrow: 1, overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: colors.primary[400], color: colors.grey[100], fontWeight: 'bold', borderBottom: `2px solid ${colors.primary[500]}` }}>Employee</TableCell>
                  <TableCell sx={{ bgcolor: colors.primary[400], color: colors.grey[100], fontWeight: 'bold', borderBottom: `2px solid ${colors.primary[500]}` }}>Dates</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {LEAVE_DATA.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell sx={{ py: 1.5, borderBottom: `1px solid ${colors.primary[500]}` }}>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ width: 28, height: 28, bgcolor: colors.blueAccent[400], fontSize: '0.8rem' }}>
                          {row.name.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" fontWeight="600" color={colors.grey[100]}>
                          {row.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ borderBottom: `1px solid ${colors.primary[500]}` }}>
                      <Typography variant="caption" color={colors.grey[100]}>
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