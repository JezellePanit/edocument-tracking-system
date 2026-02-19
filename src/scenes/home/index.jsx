import React, { useState } from 'react'; // 1. Nag-add tayo ng useState
import { Box, CssBaseline, useTheme } from '@mui/material';
import { tokens } from "../../theme";
import CommunicationTimeline from '../../components/CommunicationTimeline';
import WeeklySchedule from '../../components/WeeklySchedule';
import Header from "../../components/Header";
// Import mo rin yung Admin component mo rito
// import AdminUpload from '../../components/AdminUpload'; 

const Home = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === 'dark';

  // 2. Dito natin ise-save ang data para "makita" ng lahat ng components
  const [timelineDocs, setTimelineDocs] = useState([
    { id: 'M-102', type: 'Memorandum', origin: 'Headquarters', title: 'Q1 Performance Review', date: 'Feb 15, 2026', month: 'February', status: 'Pending' },
    { id: 'O-55', type: 'Office Order', origin: 'Regional', title: 'Shift Rotation Update', date: 'Feb 12, 2026', month: 'February', status: 'Acknowledged' },
  ]);

  // 3. Function para dagdagan ang listahan (ipapasa ito sa Admin Page/Component)
  const handleAddDoc = (newDoc) => {
    setTimelineDocs((prev) => [newDoc, ...prev]);
  };

  return (
    <Box sx={{ 
      width: "100%", height: "100vh", display: "flex", flexDirection: "column",
      p: "24px", gap: "24px", overflow: "hidden",
      bgcolor: isDark ? colors.primary[500] : "#f4f7f9"
    }}>
      <CssBaseline />

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="HOME PAGE" subtitle="Hi Admin, Welcome to your Dashboard" />
      </Box>

      {/* 4. OPTIONAL: Dito mo pwedeng ilagay muna yung Admin Upload para ma-test mo */}
      {/* <AdminUpload onUpload={handleAddDoc} colors={colors} /> */}

      <Box sx={{ display: 'flex', flexGrow: 1, gap: '24px', minHeight: 0 }}>
        
        {/* 5. DAPAT MAY docs={timelineDocs} PARA HINDI MAG-ERROR */}
        <CommunicationTimeline 
          docs={timelineDocs} 
          colors={colors} 
          isDark={isDark} 
        />

        <WeeklySchedule colors={colors} isDark={isDark} />

      </Box>
    </Box>
  );
};

export default Home;