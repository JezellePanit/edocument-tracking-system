import React, { useState } from "react";
import { Box, useTheme, Chip, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArchiveDetailsModal from "../../modals/archivemodals/ArchiveDetailsModal"; // The new separate modal

const Contacts = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const staticArchiveData = [
    {
      id: "TESDA-2024-001",
      title: "Scholarship Allowance - Batch 2023-A",
      categoryName: "Finance",
      originDepartment: "Training Section",
      ownerName: "Jezelle",
      displayDate: "2024-01-15", 
      status: "Completed",
      remarks: "Final audit cleared. All stipends disbursed.",
      history: [
        { date: "2024-01-01 09:00 AM", action: "Document Created", user: "Jezelle", dept: "Training" },
        { date: "2024-01-05 02:30 PM", action: "Forwarded to Finance", user: "Jezelle", dept: "Training" },
        { date: "2024-01-10 11:00 AM", action: "Reviewed & Approved", user: "Edison", dept: "Finance" },
        { date: "2024-01-15 04:00 PM", action: "Marked as Completed", user: "Admin", dept: "Records" }
      ]
    },
    {
      id: "TESDA-2024-002",
      title: "Procurement of IT Equipment (COA-05)",
      categoryName: "Procurement",
      originDepartment: "IT / System Admin",
      ownerName: "Edison",
      displayDate: "2024-01-20",
      status: "Archived",
      remarks: "Inventory updated and tags assigned."
    },
    {
      id: "TESDA-2024-003",
      title: "Assessment Center Accreditation",
      categoryName: "Certification",
      originDepartment: "Assessment Section",
      ownerName: "Admin User",
      displayDate: "2024-02-02",
      status: "Completed",
      remarks: "Renewed for 3 years."
    },
    {
      id: "TESDA-2024-004",
      title: "Staff Training - Digital Literacy",
      categoryName: "Human Resources",
      originDepartment: "Administrative Section",
      ownerName: "Jezelle",
      displayDate: "2024-02-10",
      status: "Archived",
      remarks: "Certificates filed."
    }
  ];

const columns = [
    { field: "id", headerName: "Tracking ID", flex: 1 },
    { field: "title", headerName: "Document Title", flex: 1.5 },
    { field: "originDepartment", headerName: "Office of Origin", flex: 1 },
    { field: "displayDate", headerName: "Date Archived", flex: 1 },
    { 
      field: "status", 
      headerName: "Status", 
      flex: 0.8,
      renderCell: (params) => (
        <Chip label="ARCHIVED" sx={{ bgcolor: colors.greenAccent[700], color: "#fff" }} />
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Button
          variant="contained"
          size="small"
          startIcon={<VisibilityIcon />}
          sx={{ backgroundColor: colors.blueAccent[700] }}
          onClick={() => {
            setSelectedDoc(params.row);
            setIsModalOpen(true);
          }}
        >
          View Log
        </Button>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="ARCHIVE" subtitle="View Audit Trails & Completed Records" />
      <Box m="40px 0 0 0" height="75vh">
        <DataGrid rows={staticArchiveData} columns={columns} />
      </Box>

      <ArchiveDetailsModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        docData={selectedDoc} 
      />
    </Box>
  );
};

export default Contacts;