import React, { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, MenuItem, Button, Select, Breadcrumbs, Link, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Chip, useTheme, Stack, CssBaseline, TextField, Modal, Backdrop, Fade, IconButton,
  Divider, ButtonGroup, Paper, InputAdornment, Tooltip
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DescriptionIcon from '@mui/icons-material/Description';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

// THEME & FIREBASE
import { tokens } from "../../theme";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot, doc, updateDoc, query, orderBy, serverTimestamp } from "firebase/firestore";
import dayjs from 'dayjs';

const LeaveManagement = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === 'dark';
  
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [adminComment, setAdminComment] = useState("");
  
  // Date Editing States
  const [editStartDate, setEditStartDate] = useState(null);
  const [editEndDate, setEditEndDate] = useState(null);

  // Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [activePreview, setActivePreview] = useState('csc'); 

  useEffect(() => {
    const q = query(collection(db, "leave_requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
      setFilteredRequests(data);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = requests;
    if (statusFilter !== "ALL") result = result.filter((req) => req.status === statusFilter);
    if (searchQuery) result = result.filter((req) => req.fullName?.toLowerCase().includes(searchQuery.toLowerCase()));
    setFilteredRequests(result);
  }, [searchQuery, statusFilter, requests]);

  const handleOpenReview = (row) => {
    setSelectedRow(row);
    setAdminComment(row.adminRemarks || "");
    setEditStartDate(dayjs(row.startDate));
    setEditEndDate(dayjs(row.endDate));
    setActivePreview('csc'); 
    setOpenModal(true);
  };

  const calculateDays = (start, end) => {
    if (!start || !end || !start.isValid() || !end.isValid()) return 0;
    const diff = end.diff(start, 'day') + 1;
    return diff > 0 ? diff : 0;
  };

  const handleFinalSubmit = async (newStatus) => {
    setLoading(true);
    try {
      const docRef = doc(db, "leave_requests", selectedRow.id);
      await updateDoc(docRef, { 
        status: newStatus,
        adminRemarks: adminComment,
        startDate: editStartDate.format('YYYY-MM-DD'),
        endDate: editEndDate.format('YYYY-MM-DD'),
        totalDays: calculateDays(editStartDate, editEndDate),
        reviewedAt: serverTimestamp()
      });
      setOpenModal(false);
      setAdminComment("");
    } catch (error) {
      console.error("Update failed:", error);
    }
    setLoading(false);
  };

  const getStatusStyles = (status) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED': return { bgcolor: isDark ? "rgba(76, 175, 80, 0.15)" : "#e8f5e9", color: isDark ? "#81c784" : "#2e7d32" };
      case 'REJECTED': return { bgcolor: isDark ? "rgba(244, 67, 54, 0.15)" : "#ffebee", color: isDark ? "#e57373" : "#d32f2f" };
      default: return { bgcolor: isDark ? "rgba(33, 150, 243, 0.15)" : "#e3f2fd", color: isDark ? "#64b5f6" : "#1976d2" };
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: isDark ? colors.primary[500] : "#f4f7f9", p: "24px", gap: "20px" }}>
        <CssBaseline />
        
        <Box>
          <Typography variant="h2" sx={{ fontWeight: "800", color: colors.grey[100] }}>Leave Management</Typography>
          <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
            <Link underline="hover" sx={{color: colors.greenAccent[500]}}>Admin</Link>
            <Typography sx={{color: colors.grey[300]}}>Approval Workflow</Typography>
          </Breadcrumbs>
        </Box>

        <Paper sx={{ p: 2, borderRadius: '16px', bgcolor: colors.primary[400], backgroundImage: "none", display: 'flex', gap: 2 }}>
          <TextField
            fullWidth placeholder="Search employee..." size="small"
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            sx={{ flex: 2 }}
          />
          <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ flex: 1 }}>
            <MenuItem value="ALL">All Status</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </Paper>

        <Card sx={{ flex: 1, borderRadius: '24px', bgcolor: colors.primary[400], overflow: 'hidden', backgroundImage: "none" }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 280px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ bgcolor: colors.primary[400], fontWeight: 700 }}>APPLICANT</TableCell>
                  <TableCell sx={{ bgcolor: colors.primary[400], fontWeight: 700 }}>LEAVE TYPE</TableCell>
                  <TableCell sx={{ bgcolor: colors.primary[400], fontWeight: 700 }}>DURATION</TableCell>
                  <TableCell sx={{ bgcolor: colors.primary[400], fontWeight: 700 }}>STATUS</TableCell>
                  <TableCell align="right" sx={{ bgcolor: colors.primary[400], fontWeight: 700 }}>ACTION</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRequests.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <AccountCircleIcon sx={{ color: colors.blueAccent[500] }} />
                        <Box>
                          <Typography variant="body1" fontWeight={600}>{row.fullName}</Typography>
                          <Typography variant="caption" color={colors.grey[400]}>{row.department}</Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>{row.leaveType}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{dayjs(row.startDate).format('MMM DD')} - {dayjs(row.endDate).format('MMM DD')}</Typography>
                      <Typography variant="caption" color={colors.greenAccent[500]} fontWeight={700}>{row.totalDays} Day(s)</Typography>
                    </TableCell>
                    <TableCell><Chip label={row.status} size="small" sx={{ ...getStatusStyles(row.status), fontWeight: 800 }} /></TableCell>
                    <TableCell align="right">
                      <Button variant="outlined" size="small" startIcon={<VisibilityIcon />} onClick={() => handleOpenReview(row)}>Review</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
        
        {/* --- REVIEW MODAL --- */}
        <Modal 
          open={openModal} 
          onClose={() => !loading && setOpenModal(false)} 
          closeAfterTransition 
          BackdropComponent={Backdrop} 
          BackdropProps={{ sx: { backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.7)' } }}
        >
          <Fade in={openModal}>
            <Box sx={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '95%', height: '90vh', 
              bgcolor: isDark ? colors.primary[400] : "#fff",
              color: colors.grey[100],
              borderRadius: '24px', 
              p: 3, display: 'flex', flexDirection: 'column', gap: 2,
              boxShadow: 24, outline: 'none',
              border: isDark ? `1px solid ${colors.grey[700]}` : 'none'
            }}>
              
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4" fontWeight={800} sx={{ color: colors.grey[100] }}>
                  Review Request
                </Typography>
                <IconButton onClick={() => setOpenModal(false)} sx={{ color: colors.grey[100] }}>
                  <CloseIcon />
                </IconButton>
              </Box>

              <Box sx={{ display: 'flex', flexGrow: 1, gap: 3, minHeight: 0 }}>
                {/* PREVIEW PANEL */}
                <Box sx={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <ButtonGroup fullWidth size="small">
                    <Button 
                      variant={activePreview === 'csc' ? "contained" : "outlined"} 
                      onClick={() => setActivePreview('csc')}
                      startIcon={<DescriptionIcon />}
                      sx={{ 
                        borderColor: colors.blueAccent[700],
                        bgcolor: activePreview === 'csc' ? colors.blueAccent[700] : 'transparent',
                        color: activePreview === 'csc' ? "#fff" : colors.grey[100]
                      }}
                    >
                      CSC Form
                    </Button>
                    {selectedRow?.medUrl && (
                      <Button 
                        variant={activePreview === 'med' ? "contained" : "outlined"} 
                        onClick={() => setActivePreview('med')}
                        startIcon={<LocalHospitalIcon />}
                        sx={{ 
                          borderColor: colors.blueAccent[700],
                          bgcolor: activePreview === 'med' ? colors.blueAccent[700] : 'transparent',
                          color: activePreview === 'med' ? "#fff" : colors.grey[100]
                        }}
                      >
                        Medical Cert
                      </Button>
                    )}
                  </ButtonGroup>
                  <Box sx={{ 
                    flexGrow: 1, bgcolor: "#2e2e2e", borderRadius: '12px', overflow: 'hidden', 
                    border: `1px solid ${colors.grey[700]}`, position: 'relative'
                  }}>
                    <iframe 
                      src={activePreview === 'csc' ? selectedRow?.cscUrl : selectedRow?.medUrl} 
                      width="100%" height="100%" style={{ border: 'none', backgroundColor: '#fff' }} 
                      title="Preview" 
                    />
                    <Box sx={{ position: 'absolute', bottom: 10, right: 10 }}>
                       <Tooltip title="Open in New Tab">
                         <IconButton 
                           href={activePreview === 'csc' ? selectedRow?.cscUrl : selectedRow?.medUrl} 
                           target="_blank"
                           sx={{ bgcolor: colors.primary[400], color: "#fff", '&:hover': { bgcolor: colors.primary[300] } }}
                         >
                           <VisibilityIcon fontSize="small" />
                         </IconButton>
                       </Tooltip>
                    </Box>
                  </Box>
                </Box>

                {/* ACTION PANEL */}
                <Box sx={{ 
                  flex: 1, display: 'flex', flexDirection: 'column', gap: 2, 
                  overflowY: 'auto', pr: 1,
                  '&::-webkit-scrollbar': { width: '6px' },
                  '&::-webkit-scrollbar-thumb': { bgcolor: colors.grey[700], borderRadius: '10px' }
                }}>
                  <Paper sx={{ 
                    p: 2, bgcolor: isDark ? "rgba(255,255,255,0.05)" : "#f8f9fa", 
                    borderRadius: '12px', backgroundImage: 'none',
                    border: `1px solid ${isDark ? colors.grey[800] : colors.grey[200]}`
                  }}>
                    <Typography variant="caption" color={colors.greenAccent[500]} fontWeight="bold">
                      EMPLOYEE & REASON
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ color: colors.grey[100] }}>
                      {selectedRow?.fullName}
                    </Typography>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1, color: colors.grey[200] }}>
                      "{selectedRow?.reason}"
                    </Typography>
                    
                    <Divider sx={{ my: 1, bgcolor: colors.grey[700] }} />
                    
                    <Typography variant="caption" color={colors.greenAccent[500]} fontWeight="bold">
                      ADJUST DATES
                    </Typography>
                    <Stack spacing={1.5} mt={1}>
                      <DatePicker 
                        label="Start Date" value={editStartDate} 
                        onChange={(v) => setEditStartDate(v)} 
                        slotProps={{ textField: { size: 'small', fullWidth: true, sx: { "& .MuiInputLabel-root": { color: colors.grey[300] } } } }} 
                      />
                      <DatePicker 
                        label="End Date" value={editEndDate} 
                        onChange={(v) => setEditEndDate(v)} 
                        slotProps={{ textField: { size: 'small', fullWidth: true, sx: { "& .MuiInputLabel-root": { color: colors.grey[300] } } } }} 
                      />
                      <Box display="flex" justifyContent="space-between" p={1.5} bgcolor={isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"} borderRadius="8px">
                        <Typography variant="caption" sx={{ color: colors.grey[100] }}>New Duration:</Typography>
                        <Typography variant="caption" fontWeight="bold" color={colors.greenAccent[400]}>
                          {calculateDays(editStartDate, editEndDate)} Days
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>

                  <TextField
                    label="Admin Remarks" multiline rows={3} fullWidth
                    value={adminComment} onChange={(e) => setAdminComment(e.target.value)}
                    sx={{ 
                      "& .MuiOutlinedInput-root": { borderRadius: '12px', bgcolor: isDark ? "rgba(255,255,255,0.03)" : "transparent" },
                      "& .MuiInputLabel-root": { color: colors.grey[300] }
                    }}
                  />
                  
                  <Stack direction="row" spacing={2} sx={{ mt: 'auto', pt: 2 }}>
                    <Button 
                      fullWidth variant="outlined" onClick={() => handleFinalSubmit('REJECTED')} 
                      disabled={loading}
                      sx={{ 
                        borderRadius: '10px', py: 1, color: colors.redAccent[400], borderColor: colors.redAccent[400],
                        '&:hover': { borderColor: colors.redAccent[500], bgcolor: 'rgba(244, 67, 54, 0.08)' }
                      }}
                    >
                      Reject
                    </Button>
                    <Button 
                      fullWidth variant="contained" onClick={() => handleFinalSubmit('APPROVED')} 
                      disabled={loading}
                      sx={{ 
                        bgcolor: colors.greenAccent[600], color: '#000', fontWeight: 700, borderRadius: '10px', py: 1,
                        '&:hover': { bgcolor: colors.greenAccent[700] }
                      }}
                    >
                      {loading ? "Saving..." : "Approve"}
                    </Button>
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