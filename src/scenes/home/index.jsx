import React, { useState } from 'react';
import { Box, Container, Typography, Button, Card, Paper, Checkbox, Dialog, DialogTitle, DialogContent, Stack } from '@mui/material';

// We are NOT importing icons here to avoid "Module Not Found" errors
const Home = () => {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [showModal, setShowModal] = useState(true);
  const [checked, setChecked] = useState(false);

  return (
    <Box sx={{ bgcolor: '#f0f2f5', minHeight: '100vh', p: 4 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Test Dashboard
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3 }}>
            Status: **{isClockedIn ? "Clocked In" : "Clocked Out"}**
          </Typography>

          <Button 
            variant="contained" 
            fullWidth 
            color={isClockedIn ? "error" : "primary"}
            onClick={() => setIsClockedIn(!isClockedIn)}
          >
            {isClockedIn ? "Stop Work" : "Start Work"}
          </Button>
        </Paper>
      </Container>

      {/* Basic Modal */}
      <Dialog open={showModal}>
        <DialogTitle>System Check</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>Is the system working?</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
              <Typography>Yes, I see this modal.</Typography>
            </Box>
            <Button 
              disabled={!checked} 
              variant="contained" 
              onClick={() => setShowModal(false)}
            >
              Close and View Dashboard
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Home;