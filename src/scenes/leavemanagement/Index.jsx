import React, { useState, useEffect } from 'react';
import { 
  Box, Card, CardContent, Typography, Grid, MenuItem, 
  Button, Select, Breadcrumbs, Link, CircularProgress, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, useTheme, Stack
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

// THEME & FIREBASE
import { tokens } from "../../theme";
import { db } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";
import dayjs from 'dayjs';

const LeaveManagement = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({ employee: '', status: 'PENDING', startDate: null, endDate: null });

  // Custom colors for status chips (Keep these semi-consistent but adjust for dark mode)
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    const q = query(collection(db, "leave_requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    const docRef = doc(db, "leave_requests", id);
    await updateDoc(docRef, { status: newStatus });
  };

  const handleSubmit = async (e) => {
    if (!formData.employee || !formData.startDate || !formData.endDate) return;
    setLoading(true);
    await addDoc(collection(db, "leave_requests"), {
      employeeName: formData.employee,
      status: formData.status,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate.toISOString(),
      createdAt: serverTimestamp(),
    });
    setFormData({ employee: '', status: 'PENDING', startDate: null, endDate: null });
    setLoading(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100vh - 64px)', // Adjusting for Topbar height
        overflow: 'hidden',
        bgcolor: colors.primary[400], // Theme-based background
        p: 3
      }}>
        
        {/* Header */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: colors.grey[100] }}>
            Leave Management
          </Typography>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{color: colors.grey[100]}} />}>
            <Link underline="hover" sx={{color: colors.greenAccent[500], cursor: 'pointer'}}>Dashboard</Link>
            <Typography sx={{color: colors.grey[100]}}>Leaves</Typography>
          </Breadcrumbs>
        </Box>

        {/* Layout Grid */}
        <Grid container spacing={3} sx={{ flexGrow: 1, minHeight: 0 }}>
          
          {/* LEFT: FORM */}
          <Grid item xs={12} md={4}>
            <Card sx={{ 
              borderRadius: '16px', 
              bgcolor: colors.primary[400], 
              backgroundImage: 'none', // Removes MUI default dark mode overlay
              border: `1px solid ${colors.grey[800]}`,
              boxShadow: isDark ? 'none' : '0 4px 20px rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: colors.grey[100] }}>New Request</Typography>
                <Stack spacing={2}>
                   <Typography variant="body2" sx={{fontWeight: 600, color: colors.grey[200]}}>Employee</Typography>
                   <Select 
                    fullWidth size="small" 
                    value={formData.employee} 
                    onChange={(e) => setFormData({...formData, employee: e.target.value})}
                    sx={{ bgcolor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[800], borderRadius: '8px' }}
                   >
                      <MenuItem value="Admin">Admin</MenuItem>
                      <MenuItem value="John Doe">John Doe</MenuItem>
                   </Select>
                   
                   <Typography variant="body2" sx={{fontWeight: 600, color: colors.grey[200]}}>Start Date</Typography>
                   <DatePicker 
                    slotProps={{ textField: { size: 'small', fullWidth: true, sx: { bgcolor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[800], borderRadius: '8px' } } }} 
                    value={formData.startDate} 
                    onChange={(v) => setFormData({...formData, startDate: v})} 
                   />
                   
                   <Typography variant="body2" sx={{fontWeight: 600, color: colors.grey[200]}}>End Date</Typography>
                   <DatePicker 
                    slotProps={{ textField: { size: 'small', fullWidth: true, sx: { bgcolor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[800], borderRadius: '8px' } } }} 
                    value={formData.endDate} 
                    onChange={(v) => setFormData({...formData, endDate: v})} 
                   />
                   
                   <Button 
                    fullWidth variant="contained" 
                    onClick={handleSubmit} 
                    disabled={loading} 
                    sx={{ 
                      bgcolor: colors.blueAccent[700], 
                      color: colors.grey[100],
                      py: 1.5, mt: 2,
                      fontWeight: 700,
                      "&:hover": { bgcolor: colors.blueAccent[800] }
                    }}
                   >
                      {loading ? 'Processing...' : 'Submit Request'}
                   </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* RIGHT: TABLE */}
          <Grid item xs={12} md={8} sx={{ height: '100%', display: 'flex' }}>
            <Card sx={{ 
              borderRadius: '16px', 
              flexGrow: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              bgcolor: colors.primary[400],
              backgroundImage: 'none',
              border: `1px solid ${colors.grey[800]}` 
            }}>
              <Box sx={{ p: 2, borderBottom: `1px solid ${colors.grey[800]}`, bgcolor: colors.primary[400] }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: colors.grey[100] }}>All Applications</Typography>
              </Box>

              <TableContainer sx={{ flexGrow: 1, overflowY: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, bgcolor: colors.primary[400], color: colors.grey[100] }}>Employee Details</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: colors.primary[400], color: colors.grey[100] }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700, bgcolor: colors.primary[400], color: colors.grey[100] }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.grey[800]}` }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: colors.grey[100] }}>{row.employeeName}</Typography>
                          <Typography variant="caption" sx={{ color: colors.grey[300] }}>
                            {dayjs(row.startDate).format('DD MMM')} - {dayjs(row.endDate).format('DD MMM')}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.grey[800]}` }}>
                          <Chip 
                            label={row.status} 
                            size="small" 
                            sx={{ 
                             fontWeight: 700,
                             bgcolor: row.status === 'APPROVED' ? colors.greenAccent[700] : row.status === 'REJECTED' ? colors.redAccent[700] : colors.blueAccent[700],
                             color: colors.grey[100]
                          }} />
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${colors.grey[800]}` }}>
                          <Select 
                            size="small" 
                            value={row.status} 
                            onChange={(e) => handleUpdateStatus(row.id, e.target.value)} 
                            sx={{ borderRadius: '8px', height: '30px', bgcolor: theme.palette.mode === 'dark' ? colors.primary[600] : colors.grey[800], }}
                          >
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="APPROVED">Approve</MenuItem>
                            <MenuItem value="REJECTED">Reject</MenuItem>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default LeaveManagement;