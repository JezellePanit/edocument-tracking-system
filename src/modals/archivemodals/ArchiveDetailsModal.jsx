import React from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box, Divider 
} from "@mui/material";
import HistoryIcon from '@mui/icons-material/History';

const ArchiveDetailsModal = ({ open, onClose, docData }) => {
  if (!docData) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon /> Document Audit Trail: {docData.id}
      </DialogTitle>
      
      <DialogContent dividers>
        <Box mb={3}>
          <Typography variant="h6" color="secondary">{docData.title}</Typography>
          <Typography variant="body2" color="textSecondary">
            Category: {docData.categoryName} | Origin: {docData.originDepartment}
          </Typography>
        </Box>

        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          Tracking History
        </Typography>
        
        <Box sx={{ mt: 2 }}>
          {docData.history.map((step, index) => (
            <Box key={index} sx={{ mb: 2, borderLeft: '2px solid #ccc', pl: 2, position: 'relative' }}>
              {/* This circle creates the 'timeline' look */}
              <Box sx={{ 
                width: 12, height: 12, borderRadius: '50%', 
                bgcolor: 'primary.main', position: 'absolute', 
                left: -7, top: 5 
              }} />
              
              <Typography variant="caption" color="textSecondary">
                {step.date}
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {step.action}
              </Typography>
              <Typography variant="body2">
                By: <strong>{step.user}</strong> ({step.dept})
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2" color="textSecondary">
          Final Remarks:
        </Typography>
        <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
          "{docData.remarks}"
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close Record
        </Button>
        <Button variant="contained" color="primary" onClick={() => window.print()}>
          Print Certificate of Completion
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ArchiveDetailsModal;