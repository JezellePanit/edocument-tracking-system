import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, TextField, MenuItem, Button, Checkbox,
  FormControlLabel, Dialog, DialogActions, DialogContent,
  DialogTitle, Stack, useTheme, Divider, Paper, CircularProgress,
  Snackbar, Alert, LinearProgress
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
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

const LeaveRequestModal = ({ open, handleClose }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

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

  const departmentLabels = {
    executive: "Executive Office", administrative: "Administrative Section",
    records: "Records Section", procurement: "Procurement Department",
    finance: "Finance Department", training: "Training Section",
    assessment: "Assessment Section", it: "IT Department",
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
        } catch (error) { console.error("Error fetching user:", error); }
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

  const handleNotifyClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeInMB = file.size / (1024 * 1024);
    const maxSize = 5; 

    if (fileSizeInMB > maxSize) {
      setNotification({
        open: true,
        message: `File "${file.name}" is too large (${fileSizeInMB.toFixed(2)}MB). Max is ${maxSize}MB.`,
        severity: 'error'
      });
      e.target.value = null; 
      return;
    }
    setFormData({ ...formData, [field]: file });
  };

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
      firstName: '', lastName: '', department: formData.department, leaveType: '',
      startDate: dayjs(), endDate: dayjs(),
      reason: '', onlyTomorrow: false, cscForm: null, medCert: null
    });
    setUploadProgress(0);
    setIsSubmitting(false);
    handleClose();
  };

  const uploadFile = (file, folder) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null); // Return null if no file is selected
      const storageRef = ref(storage, `leaves/${folder}/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const internalSubmit = async () => {
    // UPDATED: Removed cscForm and medCert from the "required" check
    if (!formData.firstName || !formData.lastName || !formData.leaveType || !formData.reason) {
      setNotification({ open: true, message: 'Please complete all required text fields.', severity: 'error' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Process uploads only if files exist, otherwise return null
      const uploadPromises = [
        formData.cscForm ? uploadFile(formData.cscForm, 'csc_forms') : Promise.resolve(null),
        formData.medCert ? uploadFile(formData.medCert, 'medical_certs') : Promise.resolve(null)
      ];

      const [cscFormUrl, medCertUrl] = await Promise.all(uploadPromises);

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
        cscUrl: cscFormUrl || null, 
        medUrl: medCertUrl || null, 
        status: "Pending",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "leave_requests"), leaveRequestData);
      
      setNotification({ open: true, message: 'Application Submitted Successfully!', severity: 'success' });
      setTimeout(resetAndClose, 2000);

    } catch (error) {
      setNotification({ open: true, message: 'Submission Error: ' + error.message, severity: 'error' });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={isSubmitting ? null : resetAndClose} 
        maxWidth="md" 
        fullWidth 
        PaperProps={{ sx: { borderRadius: 3, backgroundImage: 'none', bgcolor: colors.primary[400] } }}
      >
        <DialogTitle sx={{ fontWeight: 800, bgcolor: colors.primary[400], color: colors.grey[100], p: 3 }}>
          LEAVE APPLICATION FORM
        </DialogTitle>
        
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={4} mt={1}>
            
            {isSubmitting && uploadProgress > 0 && (
              <Box sx={{ width: '100%', mb: 2 }}>
                <Typography variant="body2" color={colors.greenAccent[400]} fontWeight={700} gutterBottom>
                  {uploadProgress < 100 ? `UPLOADING ATTACHMENTS: ${Math.round(uploadProgress)}%` : "FINALIZING REQUEST..."}
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 10, borderRadius: 5, bgcolor: colors.primary[500], '& .MuiLinearProgress-bar': { bgcolor: colors.greenAccent[500] } }} />
              </Box>
            )}

            <Paper elevation={0} sx={{ p: 2, bgcolor: "rgba(255,255,255,0.05)", border: `1px solid ${colors.greenAccent[500]}60`, borderRadius: '12px' }}>
              <Grid container alignItems="center" spacing={2}>
                <Grid item xs={12} md={8}>
                  <Typography variant="subtitle2" fontWeight={700} color={colors.greenAccent[400]}>Official Template</Typography>
                  <Typography variant="caption" color={colors.grey[100]}>Download and fill out the editable CSC Form 6 (Optional).</Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Button variant="contained" fullWidth size="small" startIcon={<CloudDownloadIcon />} href="https://docs.google.com/spreadsheets/d/1dKrbiovbJ48ztUZKLmfT8EGbcIq825H2GdCFVkyLsMg/edit?gid=261177602#gid=261177602" target="_blank" sx={{ bgcolor: colors.greenAccent[600], fontWeight: 'bold', "&:hover": { bgcolor: colors.greenAccent[700] } }}>
                    DOWNLOAD FORM
                  </Button>
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
                  <TextField label="Department" fullWidth size="small" value={formData.department} disabled sx={{ "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: colors.grey[100] } }} />
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
                  <MenuItem value="Maternity/Paternity">Maternity/Paternity Leave</MenuItem>
                </TextField>
                
                <FormControlLabel
                  control={<Checkbox checked={formData.onlyTomorrow} onChange={handleTomorrowChange} color="secondary" size="small" disabled={isSubmitting} />}
                  label={<Typography variant="caption" fontWeight={700}>APPLYING FOR TOMORROW ONLY</Typography>}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <DatePicker label="Start Date" value={formData.startDate} disabled={formData.onlyTomorrow || isSubmitting} minDate={dayjs()} onChange={(v) => setFormData({ ...formData, startDate: v })} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                  <DatePicker label="End Date" value={formData.endDate} disabled={formData.onlyTomorrow || isSubmitting} minDate={formData.startDate || dayjs()} onChange={(v) => setFormData({ ...formData, endDate: v })} slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                </Box>
                <TextField fullWidth multiline rows={2} label="Reason / Specific Details" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} disabled={isSubmitting} />
              </Stack>
            </Box>

            <Divider />

            <Box pb={1}>
              <Typography variant="h6" color={colors.greenAccent[400]} mb={1} fontWeight={700}>3. Document Upload (Optional)</Typography>
              <Grid container spacing={2}>
                  <Grid item xs={12} sm={isSickLeave ? 6 : 12}>
                      <Typography variant="caption" color={colors.grey[300]} fontWeight={600}>CSC FORM 6 (Max 5MB)</Typography>
                      <Button component="label" variant="outlined" fullWidth size="small" startIcon={<CloudUploadIcon />} disabled={isSubmitting} sx={{ borderStyle: 'dashed', py: 1.5, mt: 0.5, color: colors.greenAccent[400], borderColor: colors.greenAccent[400] }}>
                          <Typography variant="caption" noWrap>{formData.cscForm ? formData.cscForm.name : "Upload PDF (Optional)"}</Typography>
                          <input type="file" hidden accept=".pdf" onChange={(e) => handleFileChange(e, 'cscForm')} />
                      </Button>
                  </Grid>
                  {isSickLeave && (
                      <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color={colors.grey[300]} fontWeight={600}>MEDICAL CERT (Max 5MB)</Typography>
                          <Button component="label" variant="outlined" fullWidth size="small" startIcon={<CloudUploadIcon />} disabled={isSubmitting}
                              sx={{ borderStyle: 'dashed', py: 1.5, mt: 0.5, color: colors.blueAccent[400], borderColor: colors.blueAccent[400] }}>
                              <Typography variant="caption" noWrap>{formData.medCert ? formData.medCert.name : "Upload PDF/JPG (Optional)"}</Typography>
                              <input type="file" hidden accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'medCert')} />
                          </Button>
                      </Grid>
                  )}
              </Grid>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, bgcolor: colors.primary[400], justifyContent: 'space-between', borderTop: `1px solid ${colors.primary[500]}` }}>
          <Typography variant="body2" color={colors.grey[100]} fontWeight={700} ml={1}>TOTAL DURATION: {totalDays} DAY(S)</Typography>
          <Box display="flex" alignItems="center" gap={1.5}>
              <Button onClick={resetAndClose} size="small" disabled={isSubmitting} sx={{ color: colors.grey[300] }}>Cancel</Button>
              <Button 
                  onClick={internalSubmit} 
                  variant="contained" 
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={14} color="inherit" /> : <SendIcon sx={{ fontSize: "14px !important" }} />} 
                  sx={{ bgcolor: colors.greenAccent[500], color: "#000", fontWeight: 800, px: 3, "&:hover": { bgcolor: colors.greenAccent[600] } }}
              >
                  {isSubmitting ? "SUBMITTING..." : "SUBMIT REQUEST"}
              </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleNotifyClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleNotifyClose} severity={notification.severity} variant="filled" sx={{ width: '100%', fontWeight: 600 }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LeaveRequestModal;