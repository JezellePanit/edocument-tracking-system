import React, { useState } from 'react';
import { Box, Button, CssBaseline, useTheme } from '@mui/material';
import { tokens } from "../../theme";
import AddIcon from '@mui/icons-material/Add';
import Header from "../../components/Header";
import AdminUpload from '../../components/AdminUpload'; 
import CommunicationTimeline from '../../components/CommunicationTimeline';
import WeeklySchedule from '../../components/WeeklySchedule';

const Posting = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === 'dark';
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. Dito mase-save ang mga in-upload ni Admin
  const [timelineDocs, setTimelineDocs] = useState([
    { 
      id: 'M-102', 
      type: 'Memorandum', 
      origin: 'Headquarters', 
      title: 'Initial Dashboard Setup', 
      date: 'Feb 19, 2026', 
      month: 'February', 
      status: 'Pending' 
    },
  ]);

  // 2. Ang function na tatawagin ng AdminUpload Modal
  const handleAddDoc = (newDoc) => {
    setTimelineDocs((prevDocs) => [newDoc, ...prevDocs]);
  };

  return (
    <Box sx={{ p: "24px", height: "100vh", overflow: "auto" }}>
      <CssBaseline />
      
      {/* HEADER SECTION */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Header title="POSTING BOARD" subtitle="Manage and monitor office communications" />
        
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{ 
            bgcolor: colors.blueAccent[600], 
            padding: "10px 20px", 
            borderRadius: "10px",
            fontWeight: "bold",
            "&:hover": { bgcolor: colors.blueAccent[700] }
          }}
        >
          New Communication
        </Button>
      </Box>

      {/* MODAL COMPONENT */}
      {/* Pag click ng 'Upload Now' sa loob nito, tatakbo ang handleAddDoc */}
      <AdminUpload 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onUpload={handleAddDoc} 
        colors={colors} 
      />

      {/* MAIN CONTENT AREA */}
      <Box sx={{ display: 'flex', flexGrow: 1, gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Timeline (Dito lalabas ang mga in-upload) */}
        <CommunicationTimeline 
          docs={timelineDocs} 
          colors={colors} 
          isDark={isDark} 
        />

        {/* Schedule (Right side) */}
        <WeeklySchedule colors={colors} isDark={isDark} />
        
      </Box>
    </Box>
  );
};

export default Posting;