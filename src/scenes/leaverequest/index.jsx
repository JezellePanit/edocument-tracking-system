import React, { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Grid, Divider,
  LinearProgress, Tooltip, Paper
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Visibility as VisibilityIcon,
  DeleteOutline as DeleteIcon,
  DescriptionOutlined as FileIcon,
  Add as AddIcon,
  EventNoteOutlined as EmptyIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Firebase Imports
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, onSnapshot, orderBy, doc, deleteDoc } from "firebase/firestore";

import Header from "../../components/Header";
import { tokens } from "../../theme";
import LeaveRequestModal from "../../modals/leaveformmodals/LeaveFormModal";

const LeaveRequest = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [history, setHistory] = useState([]);
  const [fetching, setFetching] = useState(true);

  // REAL-TIME LISTENER
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // Query must match the 'userId' field in your Firestore documents
        const q = query(
          collection(db, "leave_requests"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
          const leaves = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setHistory(leaves);
          setFetching(false);
        }, (error) => {
          console.error("Firestore Error:", error);
          setFetching(false);
        });

        return () => unsubscribeSnapshot();
      } else {
        setHistory([]);
        setFetching(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleRowClick = (leave) => {
    setSelectedLeave(leave);
    setDetailsOpen(true);
  };

  const handleDeleteRequest = async (e, id, status) => {
    e.stopPropagation(); 
    if (status?.toUpperCase() !== "PENDING") {
      alert("This request has already been processed and cannot be deleted.");
      return;
    }
    
    if (window.confirm("Are you sure you want to cancel this application?")) {
      try {
        await deleteDoc(doc(db, "leave_requests", id));
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  };

  // ROBUST STATUS LOGIC
  const getStatusStyle = (status) => {
    const s = status ? status.toUpperCase() : "PENDING";
    
    switch (s) {
      case 'APPROVED':
        return { color: colors.greenAccent[600], label: "APPROVED" };
      case 'REJECTED':
      case 'DENIED':
        return { color: colors.redAccent[600], label: "REJECTED" };
      default:
        return { color: colors.blueAccent[600], label: "PENDING" };
    }
  };

  return (
    <Box m="20px">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
          <Header title="MY LEAVE APPLICATIONS" subtitle="Track your status and view admin feedback" />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{ bgcolor: colors.greenAccent[600], color: "#fff", fontWeight: "bold" }}
          >
            File New Leave
          </Button>
        </Box>

        {fetching && <LinearProgress color="secondary" sx={{ mb: 2, borderRadius: '4px' }} />}

        <LeaveRequestModal open={isModalOpen} handleClose={() => setIsModalOpen(false)} />

        <Card sx={{ bgcolor: colors.primary[400], borderRadius: "12px", boxShadow: "none" }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "rgba(255,255,255,0.05)" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>Type of Leave</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Inclusive Dates</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>Days</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.length > 0 ? (
                  history.map((leave) => {
                    const statusInfo = getStatusStyle(leave.status);
                    return (
                      <TableRow key={leave.id} hover onClick={() => handleRowClick(leave)} sx={{ cursor: 'pointer' }}>
                        <TableCell sx={{ fontWeight: "600", color: colors.greenAccent[400] }}>
                          {leave.leaveType}
                        </TableCell>
                        <TableCell>
                          {dayjs(leave.startDate).format('MMM DD, YYYY')} - {dayjs(leave.endDate).format('MMM DD, YYYY')}
                        </TableCell>
                        <TableCell align="center">{leave.totalDays}</TableCell>
                        <TableCell>
                          <Chip 
                            label={statusInfo.label} 
                            size="small" 
                            sx={{ bgcolor: statusInfo.color, color: "#fff", fontWeight: "bold" }} 
                          />
                        </TableCell>
                        <TableCell align="right">
                           <Box display="flex" justifyContent="flex-end">
                             {leave.status?.toUpperCase() === "PENDING" ? (
                               <Tooltip title="Delete">
                                 <IconButton onClick={(e) => handleDeleteRequest(e, leave.id, leave.status)}>
                                   <DeleteIcon sx={{ color: colors.redAccent[500] }} />
                                 </IconButton>
                               </Tooltip>
                             ) : (
                               <Tooltip title="View Details">
                                 <IconButton><VisibilityIcon /></IconButton>
                               </Tooltip>
                             )}
                           </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : !fetching && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <EmptyIcon fontSize="large" sx={{ color: colors.grey[500], mb: 2 }} />
                      <Typography variant="h5" color={colors.grey[400]}>No applications found.</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* DETAILS DIALOG */}
        <Dialog 
          open={detailsOpen} 
          onClose={() => setDetailsOpen(false)} 
          fullWidth 
          maxWidth="sm" 
          PaperProps={{ sx: { bgcolor: colors.primary[400], backgroundImage: 'none', borderRadius: '16px' }}}
        >
          {selectedLeave && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight="800">APPLICATION REVIEW</Typography>
                <IconButton onClick={() => setDetailsOpen(false)}><CloseIcon /></IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={3}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color={colors.grey[400]} fontWeight="bold">STATUS</Typography>
                    <Box mt={1}>
                      <Chip 
                        label={selectedLeave.status?.toUpperCase()} 
                        sx={{ bgcolor: getStatusStyle(selectedLeave.status).color, color: "white", fontWeight: "bold" }} 
                      />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color={colors.grey[400]} fontWeight="bold">TOTAL DAYS</Typography>
                    <Typography variant="h6" color={colors.greenAccent[400]}>{selectedLeave.totalDays} Day(s)</Typography>
                  </Grid>

                  {/* ADMIN REMARKS - The critical part for feedback */}
                  {selectedLeave.adminRemarks && (
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, bgcolor: "rgba(255, 255, 255, 0.05)", borderLeft: `5px solid ${getStatusStyle(selectedLeave.status).color}` }}>
                        <Typography variant="caption" color={getStatusStyle(selectedLeave.status).color} fontWeight="bold">ADMIN REMARKS</Typography>
                        <Typography variant="body1" sx={{ mt: 1, fontStyle: 'italic' }}>
                          "{selectedLeave.adminRemarks}"
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Typography variant="caption" color={colors.grey[400]} fontWeight="bold">YOUR REASON</Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>{selectedLeave.reason}</Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="caption" color={colors.grey[400]} fontWeight="bold">ATTACHMENTS</Typography>
                    <Box display="flex" gap={2} mt={1}>
                      {selectedLeave.cscUrl && (
                        <Button variant="outlined" color="secondary" href={selectedLeave.cscUrl} target="_blank" startIcon={<FileIcon />}>
                          CSC Form
                        </Button>
                      )}
                      {selectedLeave.medUrl && (
                        <Button variant="outlined" color="secondary" href={selectedLeave.medUrl} target="_blank" startIcon={<FileIcon />}>
                          Medical Cert
                        </Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions sx={{ p: 3 }}>
                <Button variant="contained" onClick={() => setDetailsOpen(false)} sx={{ bgcolor: colors.grey[600], px: 4 }}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </LocalizationProvider>
    </Box>
  );
};

export default LeaveRequest;