import React, { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, MenuItem, Button, Select, Breadcrumbs, Link, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, useTheme, Stack, CssBaseline, TextField, Modal, Backdrop, Fade, IconButton 
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// THEME & FIREBASE
import { tokens } from "../../theme";
import { db } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp, onSnapshot, doc, updateDoc, query, orderBy } from "firebase/firestore";
import dayjs from 'dayjs';

const LeaveManagement = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [formData, setFormData] = useState({ employee: '', status: 'PENDING', startDate: null, endDate: null });
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [adminComment, setAdminComment] = useState("");

  useEffect(() => {
    const q = query(collection(db, "leave_requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleOpenReview = (row) => {
    setSelectedRow(row);
    setAdminComment(row.adminReason || "");
    setOpenModal(true);
  };

  const handleFinalSubmit = async (newStatus) => {
    setLoading(true);
    const docRef = doc(db, "leave_requests", selectedRow.id);
    await updateDoc(docRef, { 
      status: newStatus,
      adminReason: adminComment,
      reviewedAt: serverTimestamp()
    });
    setLoading(false);
    setOpenModal(false);
    setAdminComment("");
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
      documentUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
    });
    setFormData({ employee: '', status: 'PENDING', startDate: null, endDate: null });
    setLoading(false);
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'APPROVED': return { bgcolor: isDark ? "rgba(76, 175, 80, 0.15)" : "#e8f5e9", color: isDark ? "#81c784" : "#2e7d32" };
      case 'REJECTED': return { bgcolor: isDark ? "rgba(244, 67, 54, 0.15)" : "#ffebee", color: isDark ? "#e57373" : "#d32f2f" };
      default: return { bgcolor: isDark ? "rgba(33, 150, 243, 0.15)" : "#e3f2fd", color: isDark ? "#64b5f6" : "#1976d2" };
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ 
        display: 'flex', flexDirection: 'column', height: '100vh', 
        bgcolor: isDark ? colors.primary[500] : "#f4f7f9", 
        p: "24px", gap: "24px" 
      }}>
        <CssBaseline />
        
        {/* --- HEADER --- */}
        <Box>
          <Typography variant="h2" sx={{ fontWeight: "800", color: colors.grey[100], letterSpacing: "-0.5px" }}>
            Leave Management
          </Typography>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" sx={{color: colors.grey[300]}} />}>
            <Link underline="hover" sx={{color: colors.greenAccent[500], fontWeight: 500, cursor: 'pointer'}}>Dashboard</Link>
            <Typography sx={{color: colors.grey[300]}}>Requests</Typography>
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: 'flex', flexGrow: 1, gap: '24px', minHeight: 0 }}>
          
          {/* LEFT: FORM CARD */}
<Card sx={{ 
  flex: 0.8, p: 3, borderRadius: '24px', 
  bgcolor: colors.primary[400], 
  backgroundImage: "none",
  boxShadow: isDark ? "0 10px 40px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.05)",
  border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`
}}>
  <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, color: colors.grey[100] }}>Apply for Leave</Typography>
  <Stack spacing={3}>
    <Box>
      <Typography variant="caption" sx={{ color: colors.grey[400], mb: 1, display: 'block', ml: 1, fontWeight: 600 }}>EMPLOYEE</Typography>
      <Select 
        fullWidth size="small" 
        value={formData.employee} 
        onChange={(e) => setFormData({...formData, employee: e.target.value})}
        sx={{ bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#fff", borderRadius: '12px' }}
      >
        <MenuItem value="John Doe">John Doe</MenuItem>
        <MenuItem value="Sarah Johnson">Sarah Johnson</MenuItem>
      </Select>
    </Box>
    
    <Stack direction="row" spacing={2}>
      <DatePicker 
        label="Start Date" 
        value={formData.startDate} 
        onChange={(v) => setFormData({...formData, startDate: v})} 
        slotProps={{ textField: { size: 'small', fullWidth: true, sx: { bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#fff", borderRadius: '12px' } } }} 
      />
      
      {/* RE-ADDED END DATE HERE */}
      <DatePicker 
        label="End Date" 
        value={formData.endDate} 
        onChange={(v) => setFormData({...formData, endDate: v})} 
        slotProps={{ textField: { size: 'small', fullWidth: true, sx: { bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#fff", borderRadius: '12px' } } }} 
      />
    </Stack>
    
    <Button 
      fullWidth variant="contained" 
      onClick={handleSubmit} 
      disabled={loading} 
      sx={{ 
        background: `linear-gradient(45deg, ${colors.blueAccent[700]} 30%, ${colors.blueAccent[600]} 90%)`,
        color: "white", py: 1.8, borderRadius: "12px", fontWeight: 700, mt: 1,
        boxShadow: `0 4px 15px ${isDark ? "rgba(0,0,0,0.4)" : "rgba(33, 150, 243, 0.3)"}`,
        '&:hover': { background: `linear-gradient(45deg, ${colors.blueAccent[600]} 30%, ${colors.blueAccent[500]} 90%)` }
      }}
    >
      {loading ? 'Processing...' : 'Submit Request'}
    </Button>
  </Stack>
</Card>

          {/* RIGHT: TABLE CARD */}
          <Card sx={{ 
            flex: 2, borderRadius: '24px', bgcolor: colors.primary[400], overflow: 'hidden',
            backgroundImage: "none",
            boxShadow: isDark ? "0 12px 40px rgba(0,0,0,0.5)" : "0 8px 24px rgba(149, 157, 165, 0.1)", 
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}`
          }}>
            <Box sx={{ p: 3, borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}` }}>
              <Typography variant="h5" fontWeight={700}>Incoming Applications</Typography>
            </Box>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 250px)' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: colors.primary[400], color: colors.grey[400], fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Employee</TableCell>
                    <TableCell sx={{ bgcolor: colors.primary[400], color: colors.grey[400], fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</TableCell>
                    <TableCell sx={{ bgcolor: colors.primary[400], color: colors.grey[400], fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase' }} align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((row) => (
                    <TableRow 
                      key={row.id} 
                      sx={{ 
                        transition: "background-color 0.2s ease",
                        '&:hover': { bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)" }
                      }}
                    >
                      <TableCell sx={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"}` }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <AccountCircleIcon sx={{ color: colors.blueAccent[500] }} />
                          <Box>
                            <Typography variant="body1" fontWeight={600} color={colors.grey[100]}>{row.employeeName}</Typography>
                            <Typography variant="caption" color={colors.grey[400]}>
                              {dayjs(row.startDate).format('MMM DD')} - {dayjs(row.endDate).format('MMM DD')}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"}` }}>
                        <Chip label={row.status} size="small" sx={{ ...getStatusStyles(row.status), fontWeight: 800, fontSize: '0.65rem', borderRadius: '6px' }} />
                      </TableCell>
                      <TableCell align="right" sx={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"}` }}>
                        <Button 
                          variant="outlined" size="small" startIcon={<VisibilityIcon />} onClick={() => handleOpenReview(row)}
                          sx={{ 
                            borderRadius: '10px', color: colors.grey[100], borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                            '&:hover': { borderColor: colors.greenAccent[500], color: colors.greenAccent[500], bgcolor: 'transparent' } 
                          }}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>

        {/* --- REVIEW MODAL --- */}
        <Modal open={openModal} onClose={() => setOpenModal(false)} closeAfterTransition BackdropComponent={Backdrop} BackdropProps={{ sx: { backdropFilter: 'blur(4px)', bgcolor: 'rgba(0,0,0,0.7)' } }}>
          <Fade in={openModal}>
            <Box sx={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '85%', height: '85vh', bgcolor: colors.primary[400], borderRadius: '32px', 
              boxShadow: 24, p: 4, display: 'flex', flexDirection: 'column', gap: 3,
              border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "transparent"}`
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h3" fontWeight={800} color={colors.grey[100]}>Verification Details</Typography>
                <IconButton onClick={() => setOpenModal(false)} sx={{ color: colors.grey[100] }}><CloseIcon /></IconButton>
              </Box>

              <Box sx={{ display: 'flex', flexGrow: 1, gap: 4, minHeight: 0 }}>
                <Box sx={{ flex: 1.6, bgcolor: "#000", borderRadius: '24px', overflow: 'hidden', border: `1px solid ${isDark ? "rgba(255,255,255,0.05)" : "#eee"}` }}>
                  <iframe src={selectedRow?.documentUrl} width="100%" height="100%" style={{ border: 'none' }} title="Doc Preview" />
                </Box>

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Box sx={{ p: 2.5, bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#f9f9f9", borderRadius: '20px' }}>
                    <Typography variant="caption" color={colors.grey[400]} sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Applicant</Typography>
                    <Typography variant="h5" fontWeight={700} color={colors.greenAccent[400]}>{selectedRow?.employeeName}</Typography>
                  </Box>

                  <TextField
                    label="Reason for Decision" multiline rows={8} fullWidth
                    value={adminComment} onChange={(e) => setAdminComment(e.target.value)}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: '20px', bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#fff" } }}
                  />
                  
                  <Stack direction="row" spacing={2} sx={{ mt: 'auto' }}>
                    <Button fullWidth variant="outlined" onClick={() => handleFinalSubmit('REJECTED')} sx={{ color: colors.redAccent[400], borderColor: colors.redAccent[400], borderRadius: '14px', py: 1.5, fontWeight: 700 }}>Reject</Button>
                    <Button fullWidth variant="contained" onClick={() => handleFinalSubmit('APPROVED')} sx={{ bgcolor: colors.greenAccent[600], borderRadius: '14px', py: 1.5, fontWeight: 700 }}>Approve</Button>
                  </Stack>
                </Box>
              </Box>
            </Box>
          </Fade>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
};

export default LeaveManagement;