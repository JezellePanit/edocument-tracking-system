import React, { useState, useEffect } from "react";
import { Box, useTheme, Chip, TextField, MenuItem, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import DeleteIcon from "@mui/icons-material/Delete";

// Modals
import DocumentMDetailsModal from "../../modals/mydocumentmodals/DocumentDetailsModal";
import DeleteConfirmModal from "../../modals/mydocumentmodals/DeleteConfirmModal";

const DocumentManagement = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Data States
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States (Matching your reference image requirements)
  const [searchEmployee, setSearchEmployee] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  // Modal States
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  useEffect(() => {
    // Querying documents sent to HR
    const q = query(
      collection(db, "documents"),
      where("status", "==", "Sent"), 
      orderBy("lastForwardedAt", "desc")
    );

const unsubscribe = onSnapshot(q, (snapshot) => {
  const docs = snapshot.docs.map(doc => {
    // 1. DEFINE data HERE
    const data = doc.data(); 
    
    return {
      id: doc.id,
      ...data,
      // 2. NOW you can use data safely
      displayDepartment: data.senderDepartment || data.submittedTo || "N/A",
      displayDate: data.lastForwardedAt?.toDate 
        ? data.lastForwardedAt.toDate().toLocaleString() 
        : "N/A"
    };
  });
  setDocuments(docs);
  setLoading(false);
}, (error) => {
  console.error("Firestore Error:", error);
  setLoading(false);
});

    return () => unsubscribe();
  }, []);

    // Combined Filter Logic
    const filteredRows = documents.filter((doc) => {
    const searchLower = searchEmployee.toLowerCase();
    const matchesEmployee = (doc.senderEmail || "").toLowerCase().includes(searchLower) || 
                            (doc.title || "").toLowerCase().includes(searchLower) ||
                            (doc.documentId || "").toLowerCase().includes(searchLower);
    
    // Use the new displayDepartment property for filtering
    const matchesDept = filterDept === "All" || doc.displayDepartment === filterDept;
    const matchesPriority = filterPriority === "All" || doc.priority === filterPriority;

    return matchesEmployee && matchesDept && matchesPriority;
    });

  const columns = [
    { 
      field: "documentId", 
      headerName: "Doc ID", 
      flex: 0.8,
      renderCell: (params) => (
        <Box color={colors.greenAccent[400]} fontWeight="bold">
          {params.value}
        </Box>
      )
    },
    { field: "senderEmail", headerName: "Employee Email", flex: 1.2 },
    { field: "title", headerName: "Document Title", flex: 1.2 },
{ 
  field: "displayDepartment", 
  headerName: "Department", 
  flex: 1,
  // This version is much safer and won't crash
  valueGetter: (value, row) => {
    return row?.displayDepartment || row?.senderDepartment || row?.submittedTo || "N/A";
  }
},
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      renderCell: ({ value }) => {
        const priority = value || "Normal";
        let chipColor;
        switch(priority) {
          case "Critical": chipColor = colors.redAccent[500]; break;
          case "Urgent": chipColor = "#ef6c00"; break; // Orange for Urgent
          case "Low": chipColor = colors.greenAccent[600]; break;
          default: chipColor = colors.blueAccent[700];
        }
        return (
          <Box display="flex" alignItems="center" height="100%">
            <Chip label={priority} size="small" 
              sx={{ backgroundColor: chipColor, color: colors.grey[100], fontWeight: "bold", minWidth: "85px" }} 
            />
          </Box>
        );
      }
    },
    { field: "displayDate", headerName: "Date Received", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center",
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%" width="100%" gap="5px">
          <Button
            variant="text"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedDoc(params.row);
              setIsDetailOpen(true);
            }}
          >View</Button>
          <Button
            variant="text"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={(e) => {
              e.stopPropagation();
              setDocToDelete(params.row);
              setIsDeleteModalOpen(true);
            }}
          >Delete</Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="DOCUMENT MANAGEMENT" subtitle="Reviewing documents sent by employees" />

      {/* FILTER TOP BAR */}
      <Box 
        display="flex" 
        gap="15px" 
        mb="20px" 
        p="20px" 
        borderRadius="8px"
        alignItems="center"
      >
        <TextField
          label="Search Employee, ID, or Title"
          variant="outlined"
          size="small"
          sx={{ flex: 2 }}
          value={searchEmployee}
          onChange={(e) => setSearchEmployee(e.target.value)}
        />

        <TextField
          select
          label="Department Filter"
          size="small"
          sx={{ flex: 1 }}
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          <MenuItem value="All">All Departments</MenuItem>
          <MenuItem value="Executive Office">Executive Office</MenuItem>
          <MenuItem value="Records Section">Records Section</MenuItem>
          <MenuItem value="Procurement">Procurement</MenuItem>
          <MenuItem value="Finance">Finance</MenuItem>
          <MenuItem value="Training Section">Training Section</MenuItem>
          <MenuItem value="Assessment Section">Assessment Section</MenuItem>
          <MenuItem value="IT / System Admin">IT / System Admin</MenuItem>
        </TextField>

        <TextField
          select
          label="Priority Filter"
          size="small"
          sx={{ flex: 1 }}
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
        >
          <MenuItem value="All">All Priorities</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
          <MenuItem value="Normal">Normal</MenuItem>
          <MenuItem value="Urgent">Urgent</MenuItem>
          <MenuItem value="Critical">Critical</MenuItem>
        </TextField>
      </Box>

      {/* DATA GRID TABLE */}
      <Box
        height="65vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiDataGrid-row:hover": { cursor: "pointer" }
        }}
      >
        <DataGrid 
          loading={loading}
          rows={filteredRows} 
          columns={columns} 
          components={{ Toolbar: GridToolbar }}
          onRowClick={(params) => {
            setSelectedDoc(params.row);
            setIsDetailOpen(true);
          }}
        />
      </Box>

      {/* MODALS */}
      <DocumentMDetailsModal 
        open={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        docData={selectedDoc} 
      />

      <DeleteConfirmModal 
        open={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        docData={docToDelete}
      />
    </Box>
  );
};

export default DocumentManagement;