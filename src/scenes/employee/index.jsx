import React, { useState } from 'react';
import { 
  Box, Typography, InputBase, IconButton, Table, TableBody, 
  TableCell, TableContainer, TableHead, TableRow, Paper, 
  useTheme, Avatar, TextField, MenuItem, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, Grid, Chip, Alert, Stack 
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Close as CloseIcon, 
  CheckCircle as CheckCircleIcon, 
  VpnKey as KeyIcon 
} from '@mui/icons-material';
import Header from "../../components/Header";
import { tokens } from "../../theme";

// Updated Mock Data with 'status' and 'passwordResetRequested'
const INITIAL_DATA = [
  { id: 1, empId: 'EMP001', name: 'Sarah Johnson', role: 'Senior Developer', department: 'Executive Office', email: 'sarah.j@company.com', status: 'approved', passwordResetRequested: false },
  { id: 2, empId: 'EMP002', name: 'Michael Chen', role: 'Product Manager', department: 'Executive Office', email: 'm.chen@company.com', status: 'pending', passwordResetRequested: true },
  { id: 3, empId: 'EMP003', name: 'Emily Davis', role: 'HR Manager', department: 'Administrative Office', email: 'emily.d@company.com', status: 'approved', passwordResetRequested: false },
];

const Employee = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // States
  const [employees, setEmployees] = useState(INITIAL_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Filter Logic
  const departments = ['All', ...new Set(employees.map(emp => emp.department))];
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  // Modal Handlers
  const handleRowClick = (employee) => {
    setSelectedEmployee(employee);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEmployee(null);
  };

  // Action Handlers
  const handleApprove = (id) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, status: 'approved' } : emp));
    handleClose();
  };

  const handleReject = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id));
    handleClose();
  };

  // Status Check Helpers
  const isApproved = selectedEmployee?.status === 'approved';
  const hasResetRequest = selectedEmployee?.passwordResetRequested;

  return (
    <Box m="20px">
      <Header title="EMPLOYEES" subtitle="Full List of Organization Personnel" />
      
      {/* FILTER SECTION */}
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Box display="flex" gap="20px" alignItems="center">
          <TextField
            select size="small" label="Department" value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            sx={{ width: '200px', backgroundColor: colors.primary[400] }}
          >
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>{dept}</MenuItem>
            ))}
          </TextField>

          <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px" sx={{ width: '300px' }}>
            <InputBase
              sx={{ ml: 2, flex: 1, color: colors.grey[100] }}
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton sx={{ p: 1, color: colors.grey[100] }}><SearchIcon /></IconButton>
          </Box>
        </Box>
      </Box>

      {/* THE TABLE */}
      <TableContainer component={Paper} sx={{ backgroundColor: colors.primary[400], borderRadius: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: colors.blueAccent?.[700] || '#1e293b' }}>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Employee Name</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Department</TableCell>
              <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Position / Role</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployees.map((emp) => (
              <TableRow key={emp.id} hover onClick={() => handleRowClick(emp)} sx={{ cursor: 'pointer' }}>
                <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: colors.secondary?.[500] || '#2e7d32' }}>
                    {emp.name[0]}
                  </Avatar>
                  <Box>
                    <Typography fontWeight="600" color={colors.grey[100]}>{emp.name}</Typography>
                    {emp.passwordResetRequested && (
                       <Typography variant="caption" color="error">Reset Requested</Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                   <Chip 
                    label={emp.status === 'approved' ? "Active" : "Pending"} 
                    size="small"
                   sx={{ 
                        // Bold text color
                        color: emp.status === 'approved' ? colors.greenAccent[400] : colors.redAccent[400],
                        // Very light background of the same color
                        bgcolor: emp.status === 'approved' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                        // Subtle border for definition
                        border: `1px solid ${emp.status === 'approved' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
                        fontWeight: "bold",
                        borderRadius: "6px",
                        textTransform: "uppercase",
                        fontSize: "10px",
                        letterSpacing: "0.5px"
                      }}
                   />
                </TableCell>
                <TableCell sx={{ color: colors.grey[100] }}>{emp.department}</TableCell>
                <TableCell sx={{ color: colors.grey[100] }}>{emp.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL SECTION */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm"
        PaperProps={{ sx: { bgcolor: colors.primary[400], backgroundImage: 'none', borderRadius: "12px" }}}
      >
        {selectedEmployee && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h4" fontWeight="bold" color={colors.grey[100]}>Profile Details</Typography>
                <Chip 
                  label={isApproved ? "Active Account" : "Access Pending"} 
                  size="small"
                  sx={{ 
                    // Bold text color using your theme tokens
                    color: isApproved ? colors.greenAccent[400] : colors.redAccent[400],
                    // 10% opacity background of the same color
                    bgcolor: isApproved ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                    // Subtle 20% opacity border
                    border: `1px solid ${isApproved ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)'}`,
                    fontWeight: "600",
                    borderRadius: "4px", // Standard slightly rounded corners
                    px: "4px",
                    fontSize: "11px",
                    "& .MuiChip-label": { px: 1 } // Fine-tune internal padding
                  }}
                />
              </Box>
              <IconButton onClick={handleClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ borderColor: colors.grey[700] }}>
              {hasResetRequest && (
                <Alert severity="error" icon={<KeyIcon />} sx={{ mb: 3 }}>
                  <strong>Security Alert:</strong> User requested a password reset.
                </Alert>
              )}

              <Grid container spacing={3}>
                <Grid item xs={12} display="flex" flexDirection="column" alignItems="center" mb={1}>
                  <Avatar sx={{ width: 80, height: 80, mb: 1, bgcolor: colors.blueAccent[500] }}>
                    {selectedEmployee.name[0]}
                  </Avatar>
                  <Typography variant="h5" color={colors.grey[100]} fontWeight="700">{selectedEmployee.name}</Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography color={colors.grey[400]} variant="caption">EMPLOYEE ID</Typography>
                  <Typography variant="body1" fontWeight="600" color={colors.grey[100]}>{selectedEmployee.empId}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography color={colors.grey[400]} variant="caption">DEPARTMENT</Typography>
                  <Typography variant="body1" fontWeight="600" color={colors.grey[100]}>{selectedEmployee.department}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography color={colors.grey[400]} variant="caption">EMAIL ADDRESS</Typography>
                  <Typography variant="body1" fontWeight="600" color={colors.grey[100]}>{selectedEmployee.email}</Typography>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button onClick={handleClose} sx={{ color: colors.grey[100] }}>Close</Button>
              <Stack direction="row" spacing={2}>
                {!isApproved ? (
                  <>
                    <Button variant="outlined" color="error" onClick={() => handleReject(selectedEmployee.id)}>Reject</Button>
                    <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={() => handleApprove(selectedEmployee.id)}>Approve User</Button>
                  </>
                ) : (
                  <Button variant="contained" color="secondary" onClick={handleClose}>Viewed</Button>
                )}
              </Stack>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Employee;