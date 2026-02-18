import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, TextField, MenuItem, Button, Checkbox,
  FormControlLabel, Dialog, DialogActions, DialogContent,
  DialogTitle, Stack, useTheme, Divider, Paper, CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SendIcon from '@mui/icons-material/Send';
import dayjs from 'dayjs';
import { tokens } from "../../theme";

// Firebase Imports
import { db, storage, auth } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const LeaveRequestModal = ({ open, handleClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    leaveType: '',
    startDate: dayjs(),
    endDate: dayjs(),
    reason: '',
    onlyTomorrow: false,
    cscForm: null,
    medCert: null
  });

  const [totalDays, setTotalDays] = useState(1);
  const isSickLeave = formData.leaveType === "Sick Leave";
  const medCertRequired = isSickLeave && totalDays >= 3;

  const departmentLabels = {
    executive: "Executive Office",
    administrative: "Administrative Section",
    records: "Records Section",
    procurement: "Procurement Department",
    finance: "Finance Department",
    training: "Training Section",
    assessment: "Assessment Section",
    it: "IT Department",
  };

  useEffect(() => {
    const fetchUserDept = async () => {
      if (open && auth.currentUser) {
        try {
          const userDocRef = doc(db, "users", auth.currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setFormData(prev => ({
              ...prev,
              department: departmentLabels[data.department] || data.department || ''
            }));
          }
        } catch (error) {
          console.error("Error fetching department:", error);
        }
      }
    };
    fetchUserDept();
  }, [open]);

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
      startDate: isChecked ? tomorrow : dayjs(),
      endDate: isChecked ? tomorrow : dayjs(),
    });
  };

  const resetAndClose = () => {
    setFormData({
      firstName: '', lastName: '', department: '', leaveType: '',
      startDate: dayjs(), endDate: dayjs(),
      reason: '', onlyTomorrow: false, cscForm: null, medCert: null
    });
    setIsSubmitting(false);
    handleClose();
  };

  const uploadFile = async (file, folder) => {
    if (!file) return null; // Gracefully return null if no file selected
    const storageRef = ref(storage, `leaves/${folder}/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const internalSubmit = async () => {
    // Basic validation for text fields only
    if (!formData.firstName || !formData.lastName || !formData.leaveType || !formData.reason) {
      alert("Please enter your name and leave details.");
      return;
    }

    setIsSubmitting(true);
    try {
      // These will now return null if empty instead of crashing or stopping the process
      const cscFormUrl = await uploadFile(formData.cscForm, 'csc_forms');
      const medCertUrl = await uploadFile(formData.medCert, 'medical_certs');

      const leaveRequestData = {
        userId: auth.currentUser?.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        fullName: `${formData.firstName} ${formData.lastName}`,
        department: formData.department,
        leaveType: formData.leaveType,
        startDate: formData.startDate.format('YYYY-MM-DD'),
        endDate: formData.endDate.format('YYYY-MM-DD'),
        totalDays: totalDays,
        reason: formData.reason,
        cscUrl: cscFormUrl, 
        medUrl: medCertUrl, 
        status: "Pending",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "leave_requests"), leaveRequestData);
      alert("Application Submitted Successfully!");
      resetAndClose();
    } catch (error) {
      console.error("Submission Error:", error);
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={isSubmitting ? null : resetAndClose} 
      maxWidth="md" 
      fullWidth 
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 800, bgcolor: colors.primary[400], color: colors.grey[100], p: 3 }}>
        LEAVE APPLICATION FORM
      </DialogTitle>
      
      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={4} mt={1}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: colors.primary[400], border: `1px solid ${colors.greenAccent[500]}60`, borderRadius: '12px' }}>
            <Grid container alignItems="center" spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="subtitle2" fontWeight={700} color={colors.greenAccent[400]}>Official Template</Typography>
                <Typography variant="caption" color={colors.grey[100]}>Download CSC Form 6 if you need a copy to fill out.</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Button variant="contained" fullWidth size="small" startIcon={<CloudDownloadIcon />} href="#" target="_blank" sx={{ bgcolor: colors.greenAccent[600], fontWeight: 'bold' }}>DOWNLOAD FORM</Button>
              </Grid>
            </Grid>
          </Paper>

          <Box>
            <Typography variant="h6" color={colors.greenAccent[400]} mb={2} fontWeight={700}>1. Applicant Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField label="First Name" fullWidth size="small" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} disabled={isSubmitting} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Last Name" fullWidth size="small" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} disabled={isSubmitting} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Department" fullWidth size="small" value={formData.department} disabled InputProps={{ readOnly: true }} sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: colors.grey[100] } }} />
              </Grid>
            </Grid>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" color={colors.greenAccent[400]} mb={2} fontWeight={700}>2. Leave Details</Typography>
            <Stack spacing={2}>
              <TextField select label="Type of Leave" fullWidth size="small" value={formData.leaveType} onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })} disabled={isSubmitting}>
                <MenuItem value="Vacation Leave">Vacation Leave</MenuItem>
                <MenuItem value="Sick Leave">Sick Leave</MenuItem>
                <MenuItem value="Mandatory Leave">Mandatory Leave</MenuItem>
              </TextField>

              <FormControlLabel
                control={<Checkbox checked={formData.onlyTomorrow} onChange={handleTomorrowChange} color="secondary" size="small" disabled={isSubmitting} />}
                label={<Typography variant="caption" fontWeight={700}>ONLY FOR TOMORROW</Typography>}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <DatePicker label="Start Date" value={formData.startDate} disabled={formData.onlyTomorrow || isSubmitting} minDate={dayjs()} onChange={(v) => setFormData({ ...formData, startDate: v })} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                <DatePicker label="End Date" value={formData.endDate} disabled={formData.onlyTomorrow || isSubmitting} minDate={formData.startDate || dayjs()} onChange={(v) => setFormData({ ...formData, endDate: v })} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
              </Box>

              <TextField fullWidth multiline rows={2} label="Reason / Remarks" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} disabled={isSubmitting} />
            </Stack>
          </Box>

          <Divider />

          <Box pb={1}>
            <Typography variant="h6" color={colors.greenAccent[400]} mb={1} fontWeight={700}>3. Documents (Optional)</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={isSickLeave ? 6 : 12}>
                    <Typography variant="caption" color={colors.grey[300]} fontWeight={600}>CSC FORM 6</Typography>
                    <Button component="label" variant="outlined" fullWidth size="small" startIcon={<CloudUploadIcon />} disabled={isSubmitting} sx={{ borderStyle: 'dashed', py: 1.5, mt: 0.5, color: colors.greenAccent[400], borderColor: colors.greenAccent[400] }}>
                        <Typography variant="caption" noWrap>{formData.cscForm ? formData.cscForm.name : "Upload PDF (Optional)"}</Typography>
                        <input type="file" hidden accept=".pdf" onChange={(e) => setFormData({ ...formData, cscForm: e.target.files[0] })} />
                    </Button>
                </Grid>

                {isSickLeave && (
                    <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color={colors.grey[300]} fontWeight={600}>MEDICAL CERT</Typography>
                        <Button component="label" variant="outlined" fullWidth size="small" startIcon={<CloudUploadIcon />} disabled={isSubmitting}
                            sx={{ borderStyle: 'dashed', py: 1.5, mt: 0.5, color: colors.blueAccent[400], borderColor: colors.blueAccent[400] }}>
                            <Typography variant="caption" noWrap>{formData.medCert ? formData.medCert.name : "Upload PDF/JPG (Optional)"}</Typography>
                            <input type="file" hidden accept=".pdf,image/*" onChange={(e) => setFormData({ ...formData, medCert: e.target.files[0] })} />
                        </Button>
                    </Grid>
                )}
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: colors.primary[400], justifyContent: 'space-between', borderTop: `1px solid ${colors.primary[500]}` }}>
        <Typography variant="body2" color={colors.grey[100]} fontWeight={700} ml={1}>TOTAL: {totalDays} DAY(S)</Typography>
        <Box display="flex" alignItems="center" gap={1.5}>
            <Button onClick={resetAndClose} size="small" disabled={isSubmitting} sx={{ color: colors.grey[300] }}>Cancel</Button>
            <Button 
                onClick={internalSubmit} 
                variant="contained" 
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : <SendIcon sx={{ fontSize: "14px !important" }} />} 
                sx={{ bgcolor: colors.greenAccent[500], color: "#000", fontWeight: 800 }}
            >
                {isSubmitting ? "PROCESSING..." : "SUBMIT REQUEST"}
            </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default LeaveRequestModal;