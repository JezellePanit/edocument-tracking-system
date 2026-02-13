import React, { useState } from 'react';
import { 
  Grid, Card, CardContent, Avatar, Typography, 
  InputBase, Box, IconButton, useTheme,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button
} from '@mui/material';
import Header from "../../components/Header";
import { tokens } from "../../theme";
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const MOCK_DATA = [
  { id: 1, empId: 'EMP001', name: 'Sarah Johnson', role: 'Senior Developer', department: 'Executive Office' },
  { id: 2, empId: 'EMP002', name: 'Michael Chen', role: 'Product Manager', department: 'Executive Office' },
  { id: 3, empId: 'EMP003', name: 'Emily Davis', role: 'HR Manager', department: 'Administrative Office' },
  { id: 4, empId: 'EMP004', name: 'James Wilson', role: 'Designer', department: 'Finance' },
  { id: 5, empId: 'EMP005', name: 'Lisa Anderson', role: 'Marketing Lead', department: 'Procurement' },
];

const Department = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState(null); 
  
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Helper function to count employees per department
  const getEmployeeCount = (deptName) => {
    return MOCK_DATA.filter(emp => emp.department === deptName).length;
  };

  // Filter Departments for Grid View
  const displayDepartments = [
    'Executive Office', 'Administrative Office', 'Finance', 
    'Procurement', 'Training Department', 'Assessment Department', 
    'Legal Department', 'IT Systems Administration'
  ].filter(dept => dept.toLowerCase().includes(searchTerm.toLowerCase()));

  // Filter Employees for Table View
  const tableData = MOCK_DATA.filter(emp => emp.department === selectedDept);

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
        <Header title="DEPARTMENT" subtitle={selectedDept ? `Employees in ${selectedDept}` : "List of Departments"} />
        
        {!selectedDept && (
          <Box display="flex" backgroundColor={colors.primary[400]} borderRadius="3px" sx={{ width: '300px' }}>
            <InputBase
              sx={{ ml: 2, flex: 1 }}
              placeholder="Search Departments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <IconButton sx={{ p: 1 }}><SearchIcon /></IconButton>
          </Box>
        )}
      </Box>

      {selectedDept ? (
        /* --- TABLE VIEW --- */
        <Paper sx={{ width: '100%', p: 2, backgroundColor: colors.primary[400] }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => setSelectedDept(null)}
            sx={{ mb: 2, color: colors.grey[100] }}
          >
            Back to Departments
          </Button>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Name</TableCell>
                  <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Employee ID</TableCell>
                  <TableCell sx={{ color: colors.grey[100], fontWeight: 'bold' }}>Role</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell sx={{ fontWeight: '600', color: colors.grey[100] }}>{emp.name}</TableCell>
                    <TableCell sx={{ color: colors.grey[100] }}>{emp.empId}</TableCell>
                    <TableCell sx={{ color: colors.grey[100] }}>{emp.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : (
        /* --- GRID VIEW --- */
        <Grid container spacing={4} justifyContent="center">
          {displayDepartments.map((deptName) => {
            const count = getEmployeeCount(deptName);
            
            return (
              <Grid item xs={12} sm={6} md={3} key={deptName} display="flex" justifyContent="center">
                <Card 
                  onClick={() => setSelectedDept(deptName)}
                  sx={{ 
                    height: '320px',
                    width: '350px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: '0.3s', 
                    '&:hover': { transform: 'translateY(-5px)', boxShadow: 10 },
                    backgroundColor: colors.primary[400],
                    borderRadius: 5,
                    p: 2
                  }}
                >
                  <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: colors.grey[100] }}>
                    {deptName[0]}
                  </Avatar>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" fontWeight="600" color={colors.grey[100]}>
                      {deptName}
                    </Typography>
                    <Typography variant='body2' sx={{ color: colors.greenAccent?.[500] || 'green', mt: 1 }}>
                      {count === 1 ? '1 Employee' : `${count} Employees`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default Department;