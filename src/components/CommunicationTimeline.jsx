import React, { useState } from 'react';
import { 
  Box, Typography, Card, Avatar, Stack, 
  Chip, Tabs, Tab, MenuItem, Select, FormControl 
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import FilterListIcon from '@mui/icons-material/FilterList';

// Tanggapin ang 'docs', 'colors', at 'isDark' bilang PROPS mula sa parent
const CommunicationTimeline = ({ docs, colors, isDark }) => {
  const [currentTypeTab, setCurrentTypeTab] = useState('All');
  const [currentOriginTab, setCurrentOriginTab] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');

  // Ito ang filter logic gamit ang 'docs' na galing sa Admin/Parent
  const filteredDocs = docs.filter(doc => {
    const matchType = currentTypeTab === 'All' || doc.type === currentTypeTab;
    const matchOrigin = currentOriginTab === 'All' || doc.origin === currentOriginTab;
    const matchMonth = selectedMonth === 'All' || doc.month === selectedMonth;
    return matchType && matchOrigin && matchMonth;
  });

  return (
    <Card sx={{ 
      flex: 1.8, p: 3, backgroundColor: colors.primary[400], borderRadius: '28px', 
      display: 'flex', flexDirection: 'column', boxShadow: "0 10px 30px rgba(0,0,0,0.1)" 
    }}>
      {/* --- HEADER & MONTH FILTER --- */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight="800">Communication Timeline</Typography>
        
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
      
      {/* --- TYPE TABS --- */}
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

      {/* --- ORIGIN TABS --- */}
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
      
      {/* --- RENDER DOCUMENTS --- */}
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
  );
};

export default CommunicationTimeline;