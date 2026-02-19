import React, { useState } from 'react';
import { 
  Box, TextField, Button, MenuItem, Stack, Typography, 
  Collapse, Autocomplete, Chip, Dialog, DialogTitle, 
  DialogContent, DialogActions, IconButton 
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const AdminUpload = ({ open, onClose, onUpload, colors }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Memorandum');
  
  // Data Options
  const departments = ["Accounting", "Human Resources", "Information Technology", "Operations", "Marketing", "Security", "Maintenance"];
  const systemUsers = ["admin@system.com", "user1@gmail.com", "manager@company.ph"];

  // States for different types
  const [schedule, setSchedule] = useState({ date: '', time: '', invitees: [], location: '' });
  const [orderDetail, setOrderDetail] = useState({ effectiveDate: '', targetDepartments: [], action: '' });
  const [memoDetail, setMemoDetail] = useState({ priority: 'Normal', referenceNo: '', signatory: '', requiresAcknowledgement: false });

  const resetForm = () => {
    setTitle('');
    setType('Memorandum');
    setSchedule({ date: '', time: '', invitees: [], location: '' });
    setOrderDetail({ effectiveDate: '', targetDepartments: [], action: '' });
    setMemoDetail({ priority: 'Normal', referenceNo: '', signatory: '', requiresAcknowledgement: false });
  };

  const handleSubmit = () => {
    if (!title) return alert("Lagyan mo ng title!");

    const newEntry = {
      id: Date.now(),
      title: title,
      type: type,
      origin: 'Headquarters',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      month: 'February',
      status: 'Pending',
      // Logic para makuha ang tamang details base sa type
      details: type === 'Advisory' ? schedule : (type === 'Office Order' ? orderDetail : memoDetail)
    };

    onUpload(newEntry);
    resetForm();
    onClose(); // Isasara ang modal pagkatapos mag-upload
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="sm"
      PaperProps={{
        sx: { borderRadius: "20px", padding: "8px" }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" fontWeight="800">New Communication</Typography>
        <IconButton onClick={onClose}><CloseIcon /></IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField 
            label="Document Title" size="small" fullWidth
            value={title} onChange={(e) => setTitle(e.target.value)}
          />
          
          <TextField
            select label="Communication Type" value={type} size="small" fullWidth
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem value="Memorandum">Memorandum</MenuItem>
            <MenuItem value="Office Order">Office Order</MenuItem>
            <MenuItem value="Advisory">Advisory</MenuItem>
          </TextField>

          {/* --- MEMORANDUM SECTION --- */}
          <Collapse in={type === 'Memorandum'}>
            <Box sx={{ p: 2, border: '1px solid #6366f1', borderRadius: '12px', bgcolor: 'rgba(99, 102, 241, 0.05)' }}>
              <Typography variant="subtitle2" color="#6366f1" mb={2} fontWeight="700">📄 Memorandum Details</Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <TextField label="Reference #" size="small" fullWidth value={memoDetail.referenceNo} onChange={(e) => setMemoDetail({...memoDetail, referenceNo: e.target.value})}/>
                  <TextField select label="Priority" size="small" sx={{ width: '200px' }} value={memoDetail.priority} onChange={(e) => setMemoDetail({...memoDetail, priority: e.target.value})}>
                    <MenuItem value="Normal">Normal</MenuItem>
                    <MenuItem value="Urgent">Urgent</MenuItem>
                    <MenuItem value="Confidential">Confidential</MenuItem>
                  </TextField>
                </Stack>
                <TextField label="Signatory" size="small" fullWidth value={memoDetail.signatory} onChange={(e) => setMemoDetail({...memoDetail, signatory: e.target.value})}/>
              </Stack>
            </Box>
          </Collapse>

          {/* --- OFFICE ORDER SECTION --- */}
          <Collapse in={type === 'Office Order'}>
            <Box sx={{ p: 2, border: '1px solid #10b981', borderRadius: '12px' }}>
              <Typography variant="subtitle2" color="#10b981" mb={2} fontWeight="700">📝 Target Departments</Typography>
              <Stack spacing={2}>
                <Autocomplete
                  multiple options={departments} value={orderDetail.targetDepartments}
                  onChange={(e, v) => setOrderDetail({ ...orderDetail, targetDepartments: v })}
                  renderTags={(v, p) => v.map((opt, i) => <Chip label={opt} {...p({ index: i })} sx={{ bgcolor: '#10b981', color: '#fff' }} size="small" />)}
                  renderInput={(p) => <TextField {...p} label="Select Departments" size="small" />}
                />
                <TextField label="Effectivity Date" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={orderDetail.effectiveDate} onChange={(e) => setOrderDetail({...orderDetail, effectiveDate: e.target.value})}/>
                <TextField label="Action Required" size="small" fullWidth multiline rows={2} value={orderDetail.action} onChange={(e) => setOrderDetail({...orderDetail, action: e.target.value})}/>
              </Stack>
            </Box>
          </Collapse>

          {/* --- ADVISORY SECTION --- */}
          <Collapse in={type === 'Advisory'}>
            <Box sx={{ p: 2, border: '1px solid #f59e0b', borderRadius: '12px' }}>
              <Typography variant="subtitle2" color="#f59e0b" mb={2} fontWeight="700">📅 Schedule & Invitees</Typography>
              <Stack spacing={2}>
                <Autocomplete
                  multiple options={systemUsers} value={schedule.invitees}
                  onChange={(e, v) => setSchedule({ ...schedule, invitees: v })}
                  renderTags={(v, p) => v.map((opt, i) => <Chip label={opt} {...p({ index: i })} color="warning" size="small" />)}
                  renderInput={(p) => <TextField {...p} label="Invite Emails" size="small" />}
                />
                <Stack direction="row" spacing={2}>
                  <TextField label="Date" type="date" size="small" fullWidth InputLabelProps={{ shrink: true }} value={schedule.date} onChange={(e) => setSchedule({...schedule, date: e.target.value})}/>
                  <TextField label="Time" type="time" size="small" fullWidth InputLabelProps={{ shrink: true }} value={schedule.time} onChange={(e) => setSchedule({...schedule, time: e.target.value})}/>
                </Stack>
                <TextField label="Location" size="small" fullWidth value={schedule.location} onChange={(e) => setSchedule({...schedule, location: e.target.value})}/>
              </Stack>
            </Box>
          </Collapse>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} color="inherit" sx={{ fontWeight: '700' }}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit} 
          sx={{ bgcolor: '#6366f1', fontWeight: '700', px: 4 }}
        >
          Post Communication
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminUpload;