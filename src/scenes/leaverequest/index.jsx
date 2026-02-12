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

import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip
} from "@mui/material";


const LeaveRequest = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

 const [history, setHistory] = useState([
  {
    id: 1,
    leaveType: "Vacation Leave",
    dateFrom: "Jan 10, 2026",
    dateTo: "Jan 12, 2026",
    days: 3,
    status: "Approved"
  },
  {
    id: 2,
    leaveType: "Sick Leave",
    dateFrom: "Feb 02, 2026",
    dateTo: "Feb 02, 2026",
    days: 1,
    status: "Approved"
  },
  {
    id: 3,
    leaveType: "Mandatory Leave",
    dateFrom: "Mar 15, 2026",
    dateTo: "Mar 19, 2026",
    days: 5,
    status: "Pending"
  },
  {
    id: 4,
    leaveType: "Special Privilege Leave",
    dateFrom: "Apr 05, 2026",
    dateTo: "Apr 06, 2026",
    days: 2,
    status: "Rejected"
  }
]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    leaveType: '',
    approver: 'Immediate Supervisor',
    startDate: dayjs('2023-06-03'),
    endDate: dayjs('2023-06-05'),
    reason: '',
    onlyTomorrow: false,
    cscForm: null
  });

  const handleTomorrowChange = (event) => {
  const isChecked = event.target.checked;
  const tomorrow = dayjs().add(1, 'day');

  setFormData({
    ...formData,
    onlyTomorrow: isChecked,
    // Kapag chineck, automatic set sa tomorrow. Kapag ni-uncheck, hayaan ang user.
    startDate: isChecked ? tomorrow : formData.startDate,
    endDate: isChecked ? tomorrow : formData.endDate,
  });
};

const [openConfirm, setOpenConfirm] = useState(false);

const handleOpenConfirm = () => setOpenConfirm(true);
const handleCloseConfirm = () => setOpenConfirm(false);

const handleSubmit = () => {
  // 1. Gawa ng bagong object para sa table
  const newRequest = {
    id: history.length + 1, // Simple ID generation
    leaveType: formData.leaveType || "Unspecified",
    dateFrom: formData.startDate.format('MMM DD, YYYY'),
    dateTo: formData.endDate.format('MMM DD, YYYY'),
    days: totalDays, // Ito yung auto-computed days mo kanina
    status: "Pending" // Default status
  };

  // 2. I-update ang history state (ilagay sa unahan para makita agad)
  setHistory([newRequest, ...history]);

  // 3. Isara ang confirmation dialog
  setOpenConfirm(false);

  // 4. (Optional) I-clear ang form para sa susunod na request
  setFormData({
    ...formData,
    leaveType: '',
    reason: '',
    onlyTomorrow: false,
    halfDay: false
  });
};
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
     <Box sx={{ p: 4, bgcolor: '#fafafa', minHeight: '100vh' }}>

        <Card 
          sx={{ p: 4,
          width: '50%',
          height: 'fit-content',
          borderRadius: 4, 
          boxShadow: '0px 4px 20px rgba(0,0,0,0.05)' 
          }}
        >
          <Box m = '20px' sx={{ 
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
              // I-paste dito ang link mula sa Google Drive
              href="https://docs.google.com/spreadsheets/d/1SL584EBJgJ0P9ftRGG_KTmTyIczXRLcK/edit?usp=sharing&ouid=108104218776702114912&rtpof=true&sd=true" 
              target="_blank" // Bubukas sa bagong tab para hindi mawala ang user sa app mo
              rel="noopener noreferrer"
              startIcon={<CloudUploadIcon sx={{ transform: 'rotate(180deg)' }} />}
              sx={{ 
                textTransform: 'none', 
                borderRadius: 2,
                color: 'white',
                backgroundColor: colors.greenAccent[400],
                fontWeight: 600,
                '&:hover': {
                  bgcolor: colors.grey[500],
                }
              }}
            >
              Download CSC Form 6
            </Button>
          </Box>
          
                
        {/* Checkboxes */}
        <Grid item xs={6}>
          <FormControlLabel
            control={
              <Checkbox 
                size="small" 
                checked={formData.onlyTomorrow}
                onChange={handleTomorrowChange}
                sx={{ color: '#1a237e', '&.Mui-checked': { color: '#1a237e' } }} 
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Only For Tomorrow</Typography>}
          />
        </Grid>
       

            {/* SEPARATE CONTAINER: Employee Info */}
        <Box sx={{ p: 3, bgcolor: '#f8f9fa', borderRadius: 3, mb: 3 }}>
          <Grid container spacing={3}>
            {/* First Name Input */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>First Name</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter First Name"
                // FIX: Dapat firstName ang gamit dito
                value={formData.firstName} 
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                sx={{ bgcolor: '#fff', '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>

           {/* Last Name Input */}
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>Last Name</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter Last Name"
                // FIX: Dapat lastName ang gamit dito
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
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
                <MenuItem value="Admin-HR" sx={{ pl: 4 }}> Human Resources</MenuItem>
                <MenuItem value="Admin-Supply" sx={{ pl: 4 }}> Supply Records</MenuItem>
                <MenuItem value="Admin-General" sx={{ pl: 4 }}> General Services</MenuItem>
              </TextField>
            </Grid>

             <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Leave Type
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={formData.leaveType}
                onChange={(e) =>
                  setFormData({ ...formData, leaveType: e.target.value })
                }
              >
                <MenuItem value="Vacation">Vacation Leave</MenuItem>
                <MenuItem value="Sick">Sick Leave</MenuItem>
                <MenuItem value="Maternity">Maternity/Paternity</MenuItem>
                <MenuItem value="Mandatory">Mandatory/Forced Leave</MenuItem>
                <MenuItem value="Study">Study Leave</MenuItem>
                <MenuItem value="Special">Special Privilege Leave</MenuItem>
                <MenuItem value="WithoutPay">Leave Without Pay</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Approver
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.approver}
                disabled
                sx={{ bgcolor: '#fdfdfd' }}
              />
            </Grid>

            {/* Date Range */}
            <Grid item xs={12} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                disabled={formData.onlyTomorrow} // Disable kung "Tomorrow Only"
                onChange={(val) => setFormData({...formData, startDate: val})}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
              <Typography variant="body2">To</Typography>
              <DatePicker
                label="End Date"
                value={formData.endDate}
                disabled={formData.onlyTomorrow} 
                onChange={(val) => setFormData({...formData, endDate: val})}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>
            {/* Reason */}
            <Grid item xs={12} width={'100%'}>
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
            <Grid item xs={12} width={'100%'}>
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

          </Grid>
        </Box>
          

          <Grid container spacing={3} display={'flex'} justifyContent={'flex-end'}>
            {/* Actions */}
            <Grid item xs={12} sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button 
                variant="contained" 
                sx={{ bgcolor: '#e0e0e0', color: '#616161', px: 4, borderRadius: 2, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#d5d5d5' } }}
              >
                Cancel
              </Button>
             <Button 
              variant="contained" 
              onClick={handleOpenConfirm} // Ito ang magbubukas ng Dialog
              sx={{ 
                bgcolor: '#4dd0e1', 
                color: '#fff', 
                px: 4, 
                borderRadius: 2, 
                textTransform: 'none', 
                boxShadow: 'none', 
                '&:hover': { bgcolor: '#26c6da' } 
              }}
            >
              Apply
            </Button>
            </Grid>
          </Grid>
           
        </Card>

       <Box
  sx={{
    width: "100%", // Gawing 100% para sakupin ang buong space ng Grid item
    display: "flex",
    justifyContent: "center",
    p: 1 // Binawasan ko ang padding para mas lumapad pa ang card
  }}
>
  <Card
    sx={{
      p: 4,
      width: "100%", // Dito mag-eexpand ang card
      minHeight: "500px", // minHeight gamitin imbis na fixed height para humahaba pag madaming rows
      borderRadius: 4,
      boxShadow: "0px 4px 20px rgba(0,0,0,0.05)"
    }}
  >
    <Typography variant="h4" fontWeight={600} mb={3}>
      My Leave History
    </Typography>

    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Leave Type</strong></TableCell>
            <TableCell><strong>From</strong></TableCell>
            <TableCell><strong>To</strong></TableCell>
            <TableCell><strong>Days</strong></TableCell>
            <TableCell><strong>Status</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
  {history.map((leave) => (
    <TableRow key={leave.id}>
      <TableCell>{leave.leaveType}</TableCell>
      <TableCell>{leave.dateFrom}</TableCell>
      <TableCell>{leave.dateTo}</TableCell>
      <TableCell>{leave.days}</TableCell>
      <TableCell>
        <Chip
          label={leave.status}
          color={
            leave.status === "Approved" ? "success" : 
            leave.status === "Pending" ? "warning" : "error"
          }
          size="small"
        />
      </TableCell>
    </TableRow>
  ))}
</TableBody>
      </Table>
    </TableContainer>
  </Card>
</Box>

     
      </Box>
      <Dialog
  open={openConfirm}
  onClose={handleCloseConfirm}
  PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
>
  <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
    Confirm Submission
  </DialogTitle>
  <DialogContent>
    <DialogContentText>
      Are you sure you want to apply for leave from <b>{formData.startDate?.format('MMM DD, YYYY')}</b> to <b>{formData.endDate?.format('MMM DD, YYYY')}</b>? Please ensure all details are correct.
    </DialogContentText>
  </DialogContent>
  <DialogActions sx={{ pb: 2, px: 3 }}>
    <Button onClick={handleCloseConfirm} sx={{ color: colors.grey[500], fontWeight: 600 }}>
      Cancel
    </Button>
    <Button 
      onClick={handleSubmit} 
      variant="contained"
      sx={{ bgcolor: '#4dd0e1', color: '#fff', borderRadius: 2, px: 3, '&:hover': { bgcolor: '#26c6da' } }}
    >
      Yes, Submit
    </Button>
  </DialogActions>
</Dialog>
    </LocalizationProvider>

    
    
    </Box>
  );
};

export default LeaveRequest;