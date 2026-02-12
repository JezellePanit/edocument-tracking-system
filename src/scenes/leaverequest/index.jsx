import React, { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, Grid, TextField, MenuItem, 
  Button, Checkbox, FormControlLabel, IconButton, useTheme
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import dayjs from 'dayjs';
import Header from "../../components/Header";
import { tokens } from "../../theme";

const LeaveRequest = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [formData, setFormData] = useState({
    leaveType: '',
    approver: 'Immediate Supervisor',
    startDate: dayjs('2023-06-03'),
    endDate: dayjs('2023-06-05'),
    reason: '',
    onlyTomorrow: false,
    halfDay: false,
    cscForm: null
  });

  const [totalDays, setTotalDays] = useState(0);

  // Auto-compute Number of Days
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const diff = formData.endDate.diff(formData.startDate, 'day') + 1;
      setTotalDays(diff > 0 ? diff : 0);
    }
  }, [formData.startDate, formData.endDate]);

  return (
    <Box m = '20px'>
      <Header title="LEAVE APPLICATION" subtitle="Apply for leave and track your requests" />
      
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', bgcolor: '#fafafa', minHeight: '100vh' }}>
        <Card 
          sx={{ p: 4, 
          width: '50%',
          height: 'fit-content',
          borderRadius: 4, 
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' 
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 4 
          }}>
            <Typography variant="h4" sx={{ fontWeight: 700, letterSpacing: 1, color: colors.greenAccent[400] }}>
              APPLY LEAVE
            </Typography>

            {/* Download CSC Form 6 Button */}
            <Button
              variant="outlined"
              size="small"
              component="a"
              href="/path-to-your-assets/CSC_Form_6.pdf" // Update this path to your actual PDF file
              download="CSC_Form_6_Application_for_Leave.pdf"
              startIcon={<CloudUploadIcon sx={{ transform: 'rotate(180deg)' }} />} // Flips the icon to look like a download
              sx={{ 
                textTransform: 'none', 
                borderRadius: 2,
                color: 'white',
                backgroundColor: colors.greenAccent[400],
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#0d47a1',
                  bgcolor: colors.grey[500],
                }
              }}
            >
              Download CSC Form 6
            </Button>
          </Box>
          
          <Grid container spacing={3} justifyContent="flex-end">
          {/* Checkboxes */}
            <Grid item xs={6}>
              <FormControlLabel
                control={<Checkbox size="small" sx={{ color: '#1a237e', '&.Mui-checked': { color: '#1a237e' } }} />}
                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Only For Tomorrow</Typography>}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={<Checkbox size="small" sx={{ color: '#1a237e', '&.Mui-checked': { color: '#1a237e' } }} />}
                label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Half Day</Typography>}
              />
            </Grid>
          </Grid>

            {/* SEPARATE CONTAINER: Employee Info */}
        <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3, mb: 3 }}>
          <Grid container spacing={3}>
            {/* Name Input */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>First Name</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter First Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {/* Name Input */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Last Name</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter Last Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

            {/* Department Select Menu */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Department</Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                SelectProps={{ displayEmpty: true }}
              >
                <MenuItem value="" disabled>Select Department</MenuItem>
                <MenuItem value="EO">Executive Office</MenuItem>
                {/* <MenuItem value="Admin">Administrative Department</MenuItem> */}
                <MenuItem value="Finance">Finance</MenuItem>
                <MenuItem value="Prodcurement">Procurement</MenuItem>
                <MenuItem value="Trainer">Training Department</MenuItem>
                <MenuItem value="Assessor">Assessment Department</MenuItem>
                <MenuItem value="Legal">Legal Department</MenuItem>
                <MenuItem value="IT">IT Systems Administration</MenuItem>
                <Box sx={{ px: 2, py: 1, bgcolor: '#f0f7ff', fontWeight: 'bold', fontSize: '0.75rem', color: '#1a237e' }}>
                  ADMINISTRATION
                </Box>
                <MenuItem value="Admin-HR" sx={{ pl: 4 }}>— Human Resources</MenuItem>
                <MenuItem value="Admin-Supply" sx={{ pl: 4 }}>— Supply Records</MenuItem>
                <MenuItem value="Admin-General" sx={{ pl: 4 }}>— General Services</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
          

          <Grid container spacing={3}>
            {/* Leave Type & Approver */}

            
            <Box>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Leave Type</Typography>
              <TextField
                select
                width = "100%"
                size="small"
                value={formData.leaveType}
                onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                placeholder="Select Leave Type"
              >
                <MenuItem value="Vacation">Vacation Leave</MenuItem>
                <MenuItem value="Sick">Sick Leave</MenuItem>
                <MenuItem value="Maternity">Maternity/Paternity</MenuItem>
                <MenuItem value="Maternity">Mandatory/Forced Leave</MenuItem>
                <MenuItem value="Maternity">Study Leave</MenuItem>
                <MenuItem value="Maternity">Special Privilege Leave</MenuItem>
                <MenuItem value="Maternity">Leave Without Pay</MenuItem>
                
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>Approver</Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.approver}
                disabled
                sx={{ bgcolor: '#fdfdfd' }}
              />
            </Grid>
            </Box>


            {/* Date Range */}
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DatePicker
                value={formData.startDate}
                onChange={(val) => setFormData({...formData, startDate: val})}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <Typography variant="body2">To</Typography>
              <DatePicker
                value={formData.endDate}
                onChange={(val) => setFormData({...formData, endDate: val})}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>

            {/* Reason */}
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Reason for Leave</Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
            </Grid>

            {/* Hybrid Step: CSC Form 6 Upload */}
            <Grid item xs={12}>
              <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 3, textAlign: 'center', bgcolor: '#fcfcfc' }}>
                <Typography variant="caption" display="block" sx={{ mb: 1, color: 'text.secondary' }}>
                  Required: Attach completed and signed CSC Form 6 (PDF)
                </Typography>
                <Button
                  component="label"
                  variant="text"
                  startIcon={<CloudUploadIcon />}
                  sx={{ color: '#40c4ff', textTransform: 'none' }}
                >
                  {formData.cscForm ? formData.cscForm.name : "Upload official document"}
                  <input type="file" hidden accept=".pdf" onChange={(e) => setFormData({...formData, cscForm: e.target.files[0]})} />
                </Button>
              </Box>
            </Grid>

            {/* Actions */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button 
                variant="contained" 
                sx={{ bgcolor: '#e0e0e0', color: '#616161', px: 4, borderRadius: 2, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#d5d5d5' } }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                sx={{ bgcolor: '#4dd0e1', color: '#fff', px: 4, borderRadius: 2, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#26c6da' } }}
              >
                Apply
              </Button>
            </Grid>
          </Grid>
        </Card>
      </Box>
    </LocalizationProvider>
    </Box>
  );
};

export default LeaveRequest;