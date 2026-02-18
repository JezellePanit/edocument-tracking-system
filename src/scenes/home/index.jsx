import React, { useState } from 'react';
import { 
  Box, Typography, Card, Avatar, Stack, CssBaseline, useTheme, 
  Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, Chip, Divider, Tabs, Tab, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ListAltIcon from '@mui/icons-material/ListAlt';
import FilterListIcon from '@mui/icons-material/FilterList';
import { tokens } from "../../theme";

// --- UPDATED TIMELINE DATA ---
const TIMELINE_DOCS = [
  { id: 'M-102', type: 'Memorandum', origin: 'Headquarters', title: 'Q1 Performance Review', date: 'Feb 15, 2026', month: 'February', status: 'Pending' },
  { id: 'O-55', type: 'Office Order', origin: 'Regional', title: 'Shift Rotation Update', date: 'Feb 12, 2026', month: 'February', status: 'Acknowledged' },
  { id: 'A-10', type: 'Advisory', origin: 'CSite Main', title: 'Water Maintenance Notice', date: 'Feb 11, 2026', month: 'February', status: 'Read' },
  { id: 'N-22', type: 'Notice', origin: 'Headquarters', title: 'Emergency Drill Schedule', date: 'Feb 10, 2026', month: 'February', status: 'Read' },
  { id: 'M-101', type: 'Memorandum', origin: 'Regional', title: 'Health Protocol Update', date: 'Jan 28, 2026', month: 'January', status: 'Acknowledged' },
];

const WEEKLY_SCHEDULE = [
  { id: 1, time: '09:00 AM', day: 'Today', title: 'Department Sync', details: 'Conference Room B / Zoom', tasks: ['Present weekly report', 'Discuss budget allocation'], color: '#6366f1' },
  { id: 2, time: '02:30 PM', day: 'Tomorrow', title: 'Project Alpha Review', details: 'Focus on UI/UX deliverables', tasks: ['Review Figma mockups', 'Finalize color palette'], color: '#10b981' },
];

const Home = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === 'dark';

  const [currentTypeTab, setCurrentTypeTab] = useState('All');
  const [currentOriginTab, setCurrentOriginTab] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  // --- MULTI-FILTER LOGIC ---
  const filteredDocs = TIMELINE_DOCS.filter(doc => {
    const matchType = currentTypeTab === 'All' || doc.type === currentTypeTab;
    const matchOrigin = currentOriginTab === 'All' || doc.origin === currentOriginTab;
    const matchMonth = selectedMonth === 'All' || doc.month === selectedMonth;
    return matchType && matchOrigin && matchMonth;
  });

  return (
    <Box sx={{
      width: "100%", height: "100vh", display: "flex", flexDirection: "column",
      p: "24px", gap: "24px", overflow: "hidden",
      bgcolor: isDark ? colors.primary[500] : "#f4f7f9"
    }}>
      <CssBaseline />

      {/* --- HEADER --- */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h2" color={colors.grey[100]} fontWeight="800">HOMEPAGE</Typography>
          <Typography variant="h5" color={colors.greenAccent[400]}>Communications & Schedule</Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexGrow: 1, gap: '24px', minHeight: 0 }}>
        
        {/* --- 1. COMMUNICATION TIMELINE WITH ADDITIONAL FILTERS --- */}
        <Card sx={{ 
          flex: 1.8, p: 3, backgroundColor: colors.primary[400], borderRadius: '28px', 
          display: 'flex', flexDirection: 'column', boxShadow: "0 10px 30px rgba(0,0,0,0.1)" 
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h4" fontWeight="800">Communication Timeline</Typography>
            
            {/* MONTH FILTER */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                displayEmpty
                startAdornment={<FilterListIcon sx={{ mr: 1, fontSize: '1.2rem', color: colors.greenAccent[400] }} />}
                sx={{ borderRadius: '10px', bgcolor: isDark ? colors.primary[500] : "#fff" }}
              >
                <MenuItem value="All">All Months</MenuItem>
                <MenuItem value="January">January</MenuItem>
                <MenuItem value="February">February</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          
          {/* CATEGORY FILTER (Memo, Order, etc) */}
          <Tabs 
            value={currentTypeTab} onChange={(e, v) => setCurrentTypeTab(v)}
            textColor="secondary" indicatorColor="secondary"
            sx={{ mb: 1, '& .MuiTab-root': { textTransform: 'none', fontWeight: 700 } }}
          >
            <Tab label="All Types" value="All" />
            <Tab label="Memorandum" value="Memorandum" />
            <Tab label="Office Order" value="Office Order" />
            <Tab label="Advisory" value="Advisory" />
          </Tabs>

          {/* ORIGIN FILTER (Headquarters, Regional, etc) */}
          <Tabs 
            value={currentOriginTab} onChange={(e, v) => setCurrentOriginTab(v)}
            variant="scrollable"
            sx={{ 
                mb: 3, minHeight: '32px',
                '& .MuiTabs-indicator': { display: 'none' },
                '& .MuiTab-root': { 
                    textTransform: 'none', minHeight: '32px', borderRadius: '20px', mr: 1, 
                    bgcolor: isDark ? 'rgba(255,255,255,0.05)' : '#eee', padding: '4px 16px'
                },
                '& .Mui-selected': { bgcolor: colors.blueAccent[600], color: '#fff !important' }
            }}
          >
            <Tab label="All Origins" value="All" />
            <Tab label="Headquarters" value="Headquarters" />
            <Tab label="Regional" value="Regional" />
            <Tab label="CSite Main" value="CSite Main" />
          </Tabs>
          
          <Box sx={{ flexGrow: 1, overflow: 'auto', pr: 1 }}>
            {filteredDocs.length > 0 ? filteredDocs.map((doc, index) => (
              <Box key={doc.id} sx={{ display: 'flex', gap: 2, mb: 3, position: 'relative' }}>
                {index !== filteredDocs.length - 1 && (
                  <Box sx={{ position: 'absolute', left: 20, top: 40, bottom: -20, width: '2px', bgcolor: colors.grey[700], opacity: 0.5 }} />
                )}
                <Avatar sx={{ bgcolor: colors.primary[500], zIndex: 1, border: `2px solid ${colors.grey[700]}` }}>
                  <DescriptionIcon sx={{ color: doc.status === 'Pending' ? colors.redAccent[500] : colors.grey[100] }} />
                </Avatar>
                <Box sx={{ 
                  flexGrow: 1, p: 2, borderRadius: '16px', bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#fff",
                  border: `1px solid ${doc.status === 'Pending' ? colors.redAccent[500] : "transparent"}`
                }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="h6" fontWeight="700">{doc.title}</Typography>
                      <Stack direction="row" spacing={1} alignItems="center">
                         <Typography variant="caption" sx={{ color: colors.blueAccent[400], fontWeight: 700 }}>{doc.type.toUpperCase()}</Typography>
                         <Typography variant="caption" color={colors.grey[500]}>•</Typography>
                         <Typography variant="caption" sx={{ color: colors.greenAccent[400], fontWeight: 700 }}>{doc.origin}</Typography>
                         <Typography variant="caption" color={colors.grey[500]}>• {doc.date}</Typography>
                      </Stack>
                    </Box>
                    <Chip label={doc.status} size="small" sx={{ fontWeight: 800, fontSize: '0.6rem', bgcolor: doc.status === 'Acknowledged' ? colors.greenAccent[700] : doc.status === 'Pending' ? colors.redAccent[600] : colors.grey[600], color: "#fff" }} />
                  </Stack>
                </Box>
              </Box>
            )) : (
                <Typography sx={{ textAlign: 'center', mt: 4, color: colors.grey[400] }}>No documents match your filters.</Typography>
            )}
          </Box>
        </Card>

        {/* --- 2. WEEKLY TASK & MEETING TRACKER --- */}
        <Card sx={{ 
          flex: 1, p: 3, backgroundColor: colors.primary[400], borderRadius: '28px',
          display: 'flex', flexDirection: 'column', boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
        }}>
          <Typography variant="h4" fontWeight="800" mb={1}>Weekly Schedule</Typography>
          <Typography variant="body2" color={colors.grey[400]} mb={3}>Meetings & tasks</Typography>

          <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {WEEKLY_SCHEDULE.map((item) => (
              <Box key={item.id} sx={{ p: 2, mb: 3, borderRadius: '20px', bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#fcfcfc", border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#eee"}` }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                  <Chip label={item.day} size="small" sx={{ bgcolor: item.color, color: "#fff", fontWeight: 900, fontSize: '0.6rem' }} />
                  <Typography variant="caption" fontWeight="700" color={colors.grey[300]}>{item.time}</Typography>
                </Stack>
                <Typography variant="h6" fontWeight="800">{item.title}</Typography>
                <Typography variant="caption" display="block" color={colors.greenAccent[400]} mb={1.5}>{item.details}</Typography>
                <Divider sx={{ mb: 1.5, opacity: 0.1 }} />
                <Stack spacing={0.5}>
                  {item.tasks.map((task, idx) => (
                    <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: item.color }} />
                      <Typography variant="body2" color={colors.grey[200]} sx={{ fontSize: '0.75rem' }}>{task}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>
    </Box>
  );
};

export default Home;