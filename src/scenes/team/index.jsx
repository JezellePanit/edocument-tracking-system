import React from "react";
import { 
  Box,
  Typography, 
  Paper,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Tabs,
  Tab,
  Stack,
  useTheme} from "@mui/material";

import Header from "../../components/Header";
import { tokens } from "../../theme";

import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot
} from "@mui/lab";

// ======== ICONS
import PrintIcon from '@mui/icons-material/Print';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddBoxIcon from '@mui/icons-material/AddBox';
import MoveToInboxIcon from '@mui/icons-material/MoveToInbox';
import OutboxIcon from '@mui/icons-material/Outbox';

// import { DataGrid } from "@mui/x-data-grid";
// import { mockDataTeam} from "../../data/mockData";


const Team = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  return (
    <Box m = "20px" sx = {{ bgcolor: '#e3f2fd', minHeight: '100vh', p: 4}}>
      

      <Paper 
        elevation={3}
        sx={{ maxWidth: 1200, 
        mx: "auto", 
        borderRadius: 3, 
        overflow: "hidden"
        }}>

        <Box sx = {{ p: 2, borderBottom: '3px solid #1976d2' }}>
          <Header title = "TEAM" subtitle = "Managing the Team Members"/>

          <Tabs value = {0} textColor="primary" indicatorColor="primary">
            <Tab 
              icon = {<LocationOnIcon 
              sx={{ fontSize: 18 }} />} 
              iconPosition="start" 
              label="Track Document" 
            />

            <Tab
              icon = {<AddBoxIcon 
              sx={{ fontSize: 18 }} />} 
              iconPosition="start" 
              label="Add Document" 
            />

            <Tab
              icon = {<MoveToInboxIcon 
              sx={{ fontSize: 18 }} />} 
              iconPosition="start" 
              label="Receive Document" 
            />

            <Tab
              icon = {<OutboxIcon
              sx={{ fontSize: 18 }} />} 
              iconPosition="start" 
              label="Release Document" 
            />
          </Tabs>
        </Box>

        {/* ======================== MAIN CONTENT AREA */}
        <Box sx = {{ 
          display: 'grid', 
          gridTemplateColumns: { md: '1fr 1fr', xs: '1fr' }, 
          gap: 3, 
          p: 3, 
          bgcolor: '#f5f7f9' 
          }}
        >

          {/* ================= LEFT SIDE: INPUT & DETAILS */}
          <Stack spacing={3}>
            <Paper sx = {{ p: 3, border: '1px solid #e0e0e0' }}>
              <Box sx = {{ bgcolor: '#cfd8dc', p: 1.5, borderRadius: 1, mb: 2, fontSize: '0.8rem', color: '#546e7a' }}>
                ❔ By entering the tracking number, it can quickly locate your files and view who departments access the documents.
              </Box>

              {/* ============ INPUT */}
              <TextField 
                fullWidth
                placeholder = "Enter Document ID"
                defaultValue = "PR00112211"
                label = "Enter Tracking Number" 
                sx = {{ mb: 2 }} 
              />

              <Button variant = "contained" color = "primary" sx={{ bgcolor: '#03a9f4', fontWeight: 'bold' }}>
                Track
              </Button>
            </Paper>

            <TableContainer component = {Paper} sx = {{ border: '1px solid #e0e0e0' }}>
              <Table size = "small">
                <TableBody>
                  {[
                    ['TITLE', 'SUPLLY, DELIVERY, AND INSTALLATION OF WEBSITE APPLICATION SCANNER'],
                    ['DOCUMENT ID', 'PR00112211'],
                    ['DEPARTMENT', 'SUPPLY OFFICE'],
                    ['TYPE', 'BIDDING']
                  ].map(([label, value]) => (
                    <TableRow key = {label}>
                      <TableCell 
                        sx = {{ fontWeight: 'bold', 
                        color: '#546e7a', 
                        width: '30%', 
                        borderRight: '1px solid #eee' }}>
                        {label}
                      </TableCell>

                      <TableCell sx = {{ color: '#263238' }}>{value}</TableCell>
                    </TableRow>
                  ))}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', color: '#546e7a', verticalAlign: 'top', borderRight: '1px solid #eee' }}>REMARKS</TableCell>
                      <TableCell sx={{ color: '#78909c', fontSize: '0.75rem', lineHeight: 1.6 }}>
                      LOREM IPSUM IS SIMPLY DUMMY TEXT OF THE PRINTING AND TYPESETTING INDUSTRY...
                      </TableCell>
                    </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>

          {/* ================= RIGHT SIDE: TIMELINE */}
           <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              
              <Typography 
                variant="subtitle1" 
                sx = {{ fontWeight: 'bold', 
                color: '#0d47a1' }}
              > DOCUMENT TIMELINE PROCESS </Typography>

              <Button 
                size="small" 
                variant="contained" 
                startIcon={<PrintIcon />} 
                sx={{ bgcolor: '#03a9f4' }}
              > Print </Button>
            </Box>

            <Timeline sx = {{ p: 0 }}>
              {[
                { office: 'Supply Office', label: 'First Step', color: '#1976d2' },
                { office: 'Finance Office', label: '2nd Step', color: '#1976d2' },
                { office: 'HR Office', label: '3rd Step', color: '#1976d2' },
                { office: 'Executive Office', label: 'Final Step', color: '#bdbdbd' }
              ].map((item, index) => (
                <TimelineItem key={index} sx={{ '&:before': { display: 'none' } }}>
                  <TimelineSeparator>
                    <TimelineDot sx={{ bgcolor: item.color }} />
                    {index !== 3 && <TimelineConnector />}
                  </TimelineSeparator>

                  <TimelineContent sx={{ mb: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ fontWeight: 'bold', 
                      color: '#37474f' }}
                    > {item.office} </Typography>

                    <Box sx = {{ bgcolor: '#eceff1', p: 1.5, borderRadius: 1 }}>
                      <Typography 
                        sx = {{ fontWeight: 'bold', 
                        fontSize: '0.8rem', 
                        color: '#455a64' }}
                      > FORWARDING TO EXECUTIVE OFFICE </Typography>

                      <Typography
                        sx = {{ fontSize: '0.7rem', 
                        color: '#1976d2' }}
                      > Jan 26, 2026 10:00 AM </Typography>

                      <Typography
                        sx = {{ fontSize: '0.7rem', 
                        color: '#ed6c02', 
                        fontWeight: 'bold' }}
                      > RELEASED | <span style={{ fontWeight: 'normal' }}>Jan 26, 2026 11:00 AM</span>
                      </Typography>

                      <Typography 
                        sx={{ mt: 1, 
                        fontSize: '0.7rem', 
                        color: '#90a4ae' }}
                      > {item.label} </Typography>
                    </Box>
                  </TimelineContent>
                </TimelineItem>
              ))
              }
            </Timeline>
          </Paper>
        </Box>
      </Paper>
    </Box>
  );
};

  export default Team;