import React, { useState, useEffect } from 'react';
import { 
  Box, Card, Typography, Button, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, useTheme,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Grid, Divider,
  LinearProgress, Tooltip
} from '@mui/material';
import { 
  Close as CloseIcon, 
  InfoOutlined as InfoIcon,
  CalendarMonth as CalendarIcon,
  Visibility as VisibilityIcon,
  DeleteOutline as DeleteIcon
} from '@mui/icons-material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddIcon from '@mui/icons-material/Add';

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

  useEffect(() => {
    // Listen for Auth changes first
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // Query user's leaves ordered by newest first
        const q = query(
          collection(db, "leave_requests"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc") // This matches the field in the Modal
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
        setFetching(false);
        setHistory([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleRowClick = (leave) => {
    setSelectedLeave(leave);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedLeave(null);
  };

  const handleDeleteRequest = async (e, id, status) => {
    e.stopPropagation(); 
    if (status !== "Pending") {
      alert("Only Pending requests can be cancelled.");
      return;
    }
    
    if (window.confirm("Cancel this leave application?")) {
      try {
        await deleteDoc(doc(db, "leave_requests", id));
      } catch (error) {
        alert("Error: " + error.message);
      }
    }
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "approved") return colors.greenAccent[600];
    if (s === "pending") return colors.blueAccent[600];
    if (s === "rejected" || s === "denied") return colors.redAccent[600];
    return colors.grey[500];
  };

  return (
    <Box m="20px">
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
          <Header title="LEAVE HISTORY" subtitle="Manage and track your filed leave applications" />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
            sx={{ bgcolor: colors.greenAccent[600], fontWeight: "bold", p: "10px 20px" }}
          >
            File New Leave
          </Button>
        </Box>

        {fetching && <LinearProgress color="secondary" sx={{ mb: 2 }} />}

        {/* MODAL COMPONENT */}
        <LeaveRequestModal 
          open={isModalOpen} 
          handleClose={() => setIsModalOpen(false)} 
        />

        <Card sx={{ bgcolor: colors.primary[400], p: 2 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Inclusive Dates</TableCell>
                  <TableCell align="center">Days</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((leave) => (
                  <TableRow 
                    key={leave.id} 
                    hover 
                    onClick={() => handleRowClick(leave)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell sx={{ fontWeight: "bold" }}>{leave.leaveType}</TableCell>
                    <TableCell>{leave.startDate} to {leave.endDate}</TableCell>
                    <TableCell align="center">{leave.totalDays}</TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.status} 
                        size="small"
                        sx={{ bgcolor: getStatusColor(leave.status), color: "#fff", fontWeight: "bold" }} 
                      />
                    </TableCell>
                    <TableCell align="right">
                      {leave.status === "Pending" && (
                        <IconButton onClick={(e) => handleDeleteRequest(e, leave.id, leave.status)}>
                          <DeleteIcon sx={{ color: colors.redAccent[500] }} />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>

        {/* REVIEW DIALOG */}
        <Dialog open={detailsOpen} onClose={handleCloseDetails} fullWidth maxWidth="sm" PaperProps={{ sx: { bgcolor: colors.primary[400] }}}>
          {selectedLeave && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="h4" fontWeight="bold">Leave Details</Typography>
                <IconButton onClick={handleCloseDetails}><CloseIcon /></IconButton>
              </DialogTitle>
              <DialogContent dividers>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color={colors.grey[400]}>STATUS</Typography>
                    <Box><Chip label={selectedLeave.status} sx={{ bgcolor: getStatusColor(selectedLeave.status), color: "white" }} /></Box>
                  </Grid>
                  
                  {/* ADMIN REMARKS SECTION */}
                  {(selectedLeave.status?.toLowerCase() === "rejected" || selectedLeave.status?.toLowerCase() === "denied") && (
                    <Grid item xs={12}>
                      <Box p={2} sx={{ bgcolor: "rgba(244, 67, 54, 0.1)", border: `1px solid ${colors.redAccent[500]}`, borderRadius: "4px" }}>
                        <Typography variant="caption" color={colors.redAccent[400]} fontWeight="bold">REJECTION REASON</Typography>
                        <Typography variant="body2">{selectedLeave.adminRemarks || "No feedback provided."}</Typography>
                      </Box>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Divider />
                    <Typography variant="body1" mt={2}><strong>Reason:</strong> {selectedLeave.reason}</Typography>
                  </Grid>

                  <Grid item xs={12} mt={2}>
                    <Typography variant="caption" color={colors.grey[400]} display="block">ATTACHMENTS</Typography>
                    <Box display="flex" gap={1} mt={1}>
                      {selectedLeave.cscUrl && (
                        <Button variant="outlined" size="small" href={selectedLeave.cscUrl} target="_blank" startIcon={<VisibilityIcon />}>CSC Form</Button>
                      )}
                      {selectedLeave.medUrl && (
                        <Button variant="outlined" size="small" href={selectedLeave.medUrl} target="_blank" startIcon={<VisibilityIcon />}>Medical Cert</Button>
                      )}
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
            </>
          )}
        </Dialog>
      </LocalizationProvider>
    </Box>
  );
};

export default LeaveRequest;