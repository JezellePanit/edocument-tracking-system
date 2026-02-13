import React, { useState, useEffect } from 'react';
import {
  Box, Card, Typography, Grid, TextField, MenuItem, Button, Checkbox,
  FormControlLabel, useTheme, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Divider, Stack
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SendIcon from '@mui/icons-material/Send';
import dayjs from 'dayjs';
import Header from "../../components/Header";
import { tokens } from "../../theme";

const LeaveRequest = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // --- STATE MANAGEMENT ---
  const [history, setHistory] = useState([
    { id: 1, leaveType: "Vacation Leave", dateFrom: "Jan 10, 2026", dateTo: "Jan 12, 2026", days: 3, status: "Approved" },
    { id: 2, leaveType: "Sick Leave", dateFrom: "Feb 02, 2026", dateTo: "Feb 02, 2026", days: 1, status: "Approved" },
  ]);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', department: '', leaveType: '',
    approver: 'Immediate Supervisor', startDate: dayjs(), endDate: dayjs(),
    reason: '', onlyTomorrow: false, cscForm: null
  });

  const [totalDays, setTotalDays] = useState(0);
  const [openConfirm, setOpenConfirm] = useState(false);

  // --- LOGIC / EFFECTS ---
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const diff = formData.endDate.diff(formData.startDate, 'day') + 1;
      setTotalDays(diff > 0 ? diff : 0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleTomorrowChange = (event) => {
    const isChecked = event.target.checked;
    const tomorrow = dayjs().add(1, 'day');
    setFormData({
      ...formData,
      onlyTomorrow: isChecked,
      startDate: isChecked ? tomorrow : formData.startDate,
      endDate: isChecked ? tomorrow : formData.endDate,
    });
  };

  const handleOpenConfirm = () => {
    if (!formData.leaveType || !formData.reason) {
      alert("Please fill in Leave Type and Reason");
      return;
    }
    setOpenConfirm(true);
  };

  const handleCancel = () => {
    setFormData({
      firstName: '', lastName: '', department: '', leaveType: '',
      approver: 'Immediate Supervisor', startDate: dayjs(), endDate: dayjs(),
      reason: '', onlyTomorrow: false, cscForm: null
    });
  };

  const handleSubmit = () => {
    const newRequest = {
      id: Date.now(),
      leaveType: formData.leaveType || "Unspecified",
      dateFrom: formData.startDate.format('MMM DD, YYYY'),
      dateTo: formData.endDate.format('MMM DD, YYYY'),
      days: totalDays,
      status: "Pending"
    };
    setHistory([newRequest, ...history]);
    setOpenConfirm(false);
    handleCancel();
  };

  return (
    <Box m="20px">
      <Header title="LEAVE APPLICATION" subtitle="Submit your request and upload documentation" />

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        
        {/* MAIN APPLICATION CARD */}
        <Card sx={{ p: 3, borderRadius: 4, boxShadow: '0px 4px 20px rgba(0,0,0,0.05)', mb: 4 }}>
          <Grid container spacing={4}>
            
            {/* LEFT SECTION (3/4): COMBINED DETAILS */}
            <Grid item xs={12} md={9}>
              <Grid container spacing={3}>
                {/* 1. Who is Applying? */}
                <Grid item xs={12} sm={6}>
                  <Typography variant="h5" fontWeight={700} color={colors.greenAccent[400]} mb={2}>
                    1. Applicant Information
                  </Typography>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="caption" fontWeight={700}>FIRST NAME</Typography>
                      <TextField fullWidth size="small" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                    </Box>
                    <Box>
                      <Typography variant="caption" fontWeight={700}>LAST NAME</Typography>
                      <TextField fullWidth size="small" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                    </Box>
                    <Box>
                      <Typography variant="caption" fontWeight={700}>DEPARTMENT</Typography>
                      <TextField select fullWidth size="small" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} SelectProps={{ displayEmpty: true }}>
                        <MenuItem value="" disabled>Select Department</MenuItem>
                        <MenuItem value="EO">Executive Office</MenuItem>
                        <MenuItem value="Finance">Finance</MenuItem>
                        <MenuItem value="IT">IT Systems</MenuItem>
                        <MenuItem value="HR">Human Resources</MenuItem>
                      </TextField>
                    </Box>
                  </Stack>
                </Grid>

                {/* 2. Leave Information */}
                <Grid item xs={12} sm={6}>
                  <Box sx={{ pl: { sm: 3 }, borderLeft: { sm: `1px solid ${colors.grey[700]}` } }}>
                    <Typography variant="h5" fontWeight={700} color={colors.greenAccent[400]} mb={2}>
                      2. Leave Details
                    </Typography>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="caption" fontWeight={700}>LEAVE TYPE</Typography>
                        <TextField select fullWidth size="small" value={formData.leaveType} onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}>
                          <MenuItem value="Vacation">Vacation Leave</MenuItem>
                          <MenuItem value="Sick">Sick Leave</MenuItem>
                          <MenuItem value="Mandatory">Mandatory Leave</MenuItem>
                          <MenuItem value="Special">Special Privilege</MenuItem>
                        </TextField>
                      </Box>
                      
                      <FormControlLabel
                        control={<Checkbox checked={formData.onlyTomorrow} onChange={handleTomorrowChange} size="small" color="secondary" />}
                        label={<Typography variant="caption" fontWeight={700}>ONLY FOR TOMORROW</Typography>}
                      />

                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <DatePicker label="Start" value={formData.startDate} disabled={formData.onlyTomorrow} onChange={(v) => setFormData({ ...formData, startDate: v })} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                        </Grid>
                        <Grid item xs={6}>
                          <DatePicker label="End" value={formData.endDate} disabled={formData.onlyTomorrow} onChange={(v) => setFormData({ ...formData, endDate: v })} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                        </Grid>
                      </Grid>

                      <Box>
                        <Typography variant="caption" fontWeight={700}>REASON / REMARKS</Typography>
                        <TextField fullWidth multiline rows={2} placeholder="Brief reason..." value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
                      </Box>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            {/* RIGHT SECTION (1/4): DOCUMENTATION & ACTIONS */}
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: colors.primary[400], borderRadius: 3 }}>
                <Typography variant="h5" fontWeight={700} color={colors.greenAccent[400]} mb={2}>
                  3. Documents
                </Typography>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" mb={2} sx={{ opacity: 0.8, fontSize: '0.8rem' }}>
                    Please attach your signed CSC Form 6.
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    startIcon={<CloudDownloadIcon />}
                    href="https://docs.google.com/spreadsheets/d/1SL584EBJgJ0P9ftRGG_KTmTyIczXRLcK/edit?usp=sharing"
                    target="_blank"
                    sx={{ mb: 2, color: colors.grey[100], borderColor: colors.grey[400], textTransform: 'none' }}
                  >
                    Download Form
                  </Button>

                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    startIcon={<CloudUploadIcon />}
                    sx={{ 
                      py: 3, 
                      flexDirection: 'column', 
                      gap: 1, 
                      borderStyle: 'dashed', 
                      borderColor: colors.greenAccent[400],
                      color: colors.greenAccent[400],
                      '&:hover': { borderStyle: 'dashed', bgcolor: 'rgba(76, 175, 80, 0.04)' }
                    }}
                  >
                    <Typography variant="caption" align="center" sx={{ textTransform: 'none', fontWeight: 600 }}>
                      {formData.cscForm ? formData.cscForm.name : "Upload Signed PDF"}
                    </Typography>
                    <input type="file" hidden accept=".pdf" onChange={(e) => setFormData({ ...formData, cscForm: e.target.files[0] })} />
                  </Button>
                </Box>

                <Stack spacing={1.5} mt={3}>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    startIcon={<SendIcon />}
                    onClick={handleOpenConfirm}
                    sx={{ bgcolor: colors.greenAccent[500], color: "#fff", fontWeight: 700, py: 1 }}
                  >
                    Apply Now
                  </Button>
                  <Button variant="text" size="small" fullWidth onClick={handleCancel} sx={{ color: colors.grey[300] }}>
                    Reset Form
                  </Button>
                </Stack>
              </Box>
            </Grid>

          </Grid>
        </Card>

        {/* HISTORY TABLE */}
        <Card sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="h5" fontWeight={600} mb={2}>Recent Leave Requests</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: colors.primary[400] }}>
                  <TableCell><strong>Leave Type</strong></TableCell>
                  <TableCell><strong>Duration</strong></TableCell>
                  <TableCell align="center"><strong>Days</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>{leave.dateFrom} - {leave.dateTo}</TableCell>
                    <TableCell align="center">{leave.days}</TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.status} 
                        size="small" 
                        sx={{ 
                          fontWeight: 600,
                          bgcolor: leave.status === "Approved" ? colors.greenAccent[700] : colors.redAccent[700],
                          color: "#fff"
                        }} 
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* CONFIRMATION DIALOG */}
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 700 }}>Confirm Submission</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to apply for <strong>{totalDays} day(s)</strong> of {formData.leaveType}?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setOpenConfirm(false)} color="inherit">Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: colors.greenAccent[500] }}>
              Confirm & Submit
            </Button>
          </DialogActions>
        </Dialog>

      </LocalizationProvider>
    </Box>
  );
};

export default LeaveRequest;