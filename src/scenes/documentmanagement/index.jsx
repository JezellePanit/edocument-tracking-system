import React, { useState, useEffect } from "react";
import { Box, useTheme, Chip, TextField, MenuItem, Button, Tabs, Tab, Typography, IconButton } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { db } from "../../firebaseConfig";
import { 
  collection, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  limit, 
  startAfter, 
  getDocs, 
  getCountFromServer 
} from "firebase/firestore"; 
import { tokens } from "../../theme";
import Header from "../../components/Header";
import DocumentUpdateModal from "../../modals/documentmanagementmodals/DocumentUpdateModal";
import DocumentRequestModal from "../../modals/documentmanagementmodals/DocumentRequestModal";
import DocumentMDetailsModal from "../../modals/documentmanagementmodals/DocumentDetailsModal";
import DocumentReplyModal from "../../modals/documentmanagementmodals/DocumentReplyModal";
import ActionsModal from "../../modals/documentmanagementmodals/ActionsModal";
import "./index.css"; 

const DocumentManagement = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Pagination & Data States
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });
  const [lastVisible, setLastVisible] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

  // Filter States
  const [searchEmployee, setSearchEmployee] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  // --- MODAL & ACTION STATES ---
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionsModalOpen, setIsActionsModalOpen] = useState(false); // Added this
  const [docToDelete, setDocToDelete] = useState(null);
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const [actionType, setActionType] = useState(""); 

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

  // No-op for modals that require a refresh function
  const noOp = () => {};

  useEffect(() => {
    const getCount = async () => {
      try {
        const coll = collection(db, "documents");
        const snapshot = await getCountFromServer(query(coll));
        setTotalCount(snapshot.data().count);
      } catch (error) {
        console.error("Error getting count:", error);
      }
    };
    getCount();
  }, []);

  const fetchDocs = async () => {
    setLoading(true);
    try {
        let q = query(
          collection(db, "documents"),
          orderBy("createdAt", "desc"),
          limit(paginationModel.pageSize)
        );
        if (paginationModel.page > 0 && lastVisible) {
          q = query(q, startAfter(lastVisible));
        }
        const querySnapshot = await getDocs(q);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDocuments(docs);
    } catch (error) {
        console.error("Fetch Error:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, [paginationModel]);

  // --- HANDLER FUNCTIONS ---
  const handleUpdateStatus = async (id, newAdminStatus, adminRemarks) => {
    try {
      const docRef = doc(db, "documents", id);
      
      // Build the update object
      const updateData = {
        adminStatus: newAdminStatus, // Internal admin workflow
        // status: "Sent", // We DON'T change this anymore so it stays in user outbox
        updatedAt: new Date()
      };

      // Handle remarks/replies dynamically based on which modal sent them
      if (typeof adminRemarks === 'string') {
        updateData.adminReply = adminRemarks;
      } else if (adminRemarks?.adminRemarks) {
        updateData.adminReply = adminRemarks.adminRemarks;
      } else if (adminRemarks?.adminReply) {
        updateData.adminReply = adminRemarks.adminReply;
      }

      await updateDoc(docRef, updateData);
      
      setIsUpdateModalOpen(false);
      setIsRequestModalOpen(false);
      setIsReplyModalOpen(false);
      fetchDocs(); 
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update: " + error.message);
    }
  };

  const handleOpenActions = (row) => {
    setSelectedDoc(row);
    setIsActionsModalOpen(true);
  };

  const handleView = (row) => {
    setSelectedDoc(row);
    setIsDetailOpen(true);
    setHighlightedRowId(row.id);
    setActionType("view");
  };

  const handleRowClick = (params, event) => {
    // Prevent opening details if clicking the Action icon (MoreVert)
    if (event.target.closest('button')) return; 
    handleView(params.row);
  };

  const filteredRows = documents.filter((doc) => {
    // Only show documents that were sent to Admin
    if (doc.status !== "Sent") return false;

    const searchLower = searchEmployee.toLowerCase();
    const matchesSearch = 
      (doc.senderEmail || "").toLowerCase().includes(searchLower) || 
      (doc.title || "").toLowerCase().includes(searchLower) ||
      (doc.documentId || "").toLowerCase().includes(searchLower);

    const deptMap = {
      "Executive Office": "executive",
      "Records Section": "records",
      "Procurement": "procurement",
      "Finance": "finance",
      "Training Section": "training",
      "Assessment Section": "assessment",
      "IT / System Admin": "it",
      "Human Resource": "hr" 
    };                
    
    const targetDbValue = deptMap[filterDept];
    const matchesDept = filterDept === "All" || doc.originDepartment === targetDbValue;
    const matchesPriority = filterPriority === "All" || doc.priority === filterPriority;

    const currentAdminStatus = doc.adminStatus || "Pending";    
    const statusMatch = 
      currentTab === 0 ? true : // All
      currentTab === 1 ? (currentAdminStatus !== "Completed" && currentAdminStatus !== "Rejected") : // Ongoing (Active)
      currentTab === 2 ? (currentAdminStatus === "Completed") : // Completed
      currentTab === 3 ? (currentAdminStatus === "Rejected") : false; // Rejected

    return matchesSearch && matchesDept && matchesPriority && statusMatch;
  });

  const columns = [
    { 
        field: "documentId", 
        headerName: "Doc ID", 
        flex: 0.7, 
        renderCell: (params) => (
            <Box display="flex" alignItems="center" height="100%">
                <Typography fontWeight="bold" color={colors.greenAccent[400]}>{params.value}</Typography>
            </Box>
        )
    },
    { 
        field: "senderEmail", 
        headerName: "Sender", 
        flex: 1,
        renderCell: (params) => (
            <Box display="flex" alignItems="center" height="100%">
                <Typography>{params.value}</Typography>
            </Box>
        )
    },
    { 
      field: "originDepartment", 
      headerName: "Sender Dept", 
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
            <Typography color={colors.greenAccent[400]} sx={{ textTransform: 'capitalize' }}>
                {params.value || "N/A"}
            </Typography>
        </Box>
      )
    },
    { 
        field: "title", 
        headerName: "Title", 
        flex: 1,
        renderCell: (params) => (
            <Box display="flex" alignItems="center" height="100%">
                <Typography>{params.value}</Typography>
            </Box>
        )
    },

    {
      field: "lastForwardedAt",
      headerName: "Date Received",
      flex: 1.5,
      renderCell: (params) => {
        const dateValue = params.value || params.row.createdAt;
        let formattedDateTime = "N/A";

        if (dateValue) {
          const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
          
          // Format: 2/18/2026, 9:47:22 AM
          formattedDateTime = date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          });
        }

        return (
          <Box display="flex" alignItems="center" height="100%">
            <Typography color={colors.grey[100]} variant="body2">
              {formattedDateTime}
            </Typography>
          </Box>
        );
      },
    },  
    { 
      field: "categoryName", 
      headerName: "Category", 
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Chip 
            label={params.value || "General"} 
            size="small" 
            sx={{ 
              borderRadius: "4px", 
              backgroundColor: colors.primary[400],
              border: `1px solid ${colors.blueAccent[700]}`,
              color: colors.grey[100],
              fontWeight: "bold",
              width: "150px",
              justifyContent: "center",
              "& .MuiChip-label": {
                display: "block",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                width: "100%",
                textAlign: "center",
              }
            }} 
          />
        </Box>
      )
    }, 
{
      field: "priority",
      headerName: "Priority",
      flex: 0.8,
      renderCell: (params) => {
        const priority = params.value || "Normal";
        // Now using the subtle category-like border style
        return (
          <Box display="flex" alignItems="center" height="100%">
            <Chip
                label={priority}
                size="small"
                sx={{
                  backgroundColor: colors.primary[400],
                  color: colors.grey[100],
                  fontWeight: "bold",
                  borderRadius: "4px",
                  border: `1px solid ${colors.grey[500]}`, // Subtle border
                  minWidth: "80px",
                }}
            />
          </Box>
        );
      }
    },     
    { 
      field: "adminStatus", 
      headerName: "Admin Status", 
      flex: 1,
      renderCell: (params) => {

        const status = params.value || "Pending";
        let chipColor;
        let pulse = false;

        switch(status) {
          case "In Review": chipColor = colors.greenAccent[500]; break;
          case "On Hold": chipColor = colors.blueAccent[500]; break;
          case "Completed": chipColor = colors.greenAccent[600]; break;
          case "Deferred": chipColor = "#ef6c00"; break;
          case "Rejected": chipColor = colors.redAccent[500]; pulse = true; break;
          default: chipColor = colors.grey[500]; pulse = status === "Pending"; break;
        }
        
        return (
          <Box display="flex" alignItems="center" height="100%">
            <Chip 
              label={status} 
              size="small" 
              sx={{ 
                borderRadius: "4px", 
                backgroundColor: chipColor, 
                color: colors.grey[100], 
                fontWeight: "bold",
                width: "80px", 
                justifyContent: "center",
                animation: status === "Rejected" ? "pulse 2s infinite" : "none",
                "& .MuiChip-label": {
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  width: "100%",
                  textAlign: "center",
                }
              }} 
            />
          </Box>
        );
      }
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 0.5, // Reduced flex since it's just one icon
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <IconButton 
            onClick={(e) => {
              e.stopPropagation();
              handleOpenActions(params.row);
            }}
            sx={{ color: colors.grey[100] }}
          >
            <MoreVertIcon />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="ADMIN DOCUMENT MGMT" subtitle="Manage incoming documents and requests" />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: "20px" }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)} 
          textColor="secondary"
          indicatorColor="secondary"
        >
          <Tab label="All Documents" />
          <Tab label="Ongoing" />
          <Tab label="Completed" />
          <Tab label="Rejected" />
        </Tabs>
      </Box>

      {/* Filter Section */}
      <Box display="flex" gap="15px" mb="20px" p="20px" borderRadius="8px" alignItems="center" backgroundColor={colors.primary[400]}>
        <TextField
          label="Search Employee, ID, or Title"
          variant="outlined"
          size="small"
          sx={{ flex: 2 }}
          value={searchEmployee}
          onChange={(e) => setSearchEmployee(e.target.value)}
        />
        {/* ... (MenuItem textfields stay the same) ... */}
        <TextField select label="Department" size="small" sx={{ flex: 1 }} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
          <MenuItem value="All">All Departments</MenuItem>
          <MenuItem value="Executive Office">Executive Office</MenuItem>
          <MenuItem value="Records Section">Records Section</MenuItem>
          <MenuItem value="Procurement">Procurement</MenuItem>
          <MenuItem value="Finance">Finance</MenuItem>
          <MenuItem value="Training Section">Training Section</MenuItem>
          <MenuItem value="Assessment Section">Assessment Section</MenuItem>
          <MenuItem value="IT / System Admin">IT / System Admin</MenuItem>
        </TextField>

        <TextField select label="Priority" size="small" sx={{ flex: 1 }} value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <MenuItem value="All">All Priorities</MenuItem>
          <MenuItem value="Low">Low</MenuItem>
          <MenuItem value="Normal">Normal</MenuItem>
          <MenuItem value="Urgent">Urgent</MenuItem>
          <MenuItem value="Critical">Critical</MenuItem>
        </TextField>
      </Box>

      <Box
        height="65vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiDataGrid-row:hover": { backgroundColor: `${colors.primary[400]} !important` },
          // Highlight styles
          "& .delete-flash-row, & .delete-row": { backgroundColor: `${colors.redAccent[600]} !important`, transition: "background-color 0.1s ease" },
          "& .view-row": { backgroundColor: `${colors.greenAccent[700]} !important`, transition: "background-color 0.5s ease" },
        }}
      >
        <DataGrid
          rows={filteredRows}
          columns={columns}
          rowCount={totalCount}
          loading={loading}
          pageSizeOptions={[10, 25, 50]}
          paginationModel={paginationModel}
          paginationMode="server"
          onPaginationModelChange={setPaginationModel}
          getRowClassName={(params) => {
            if (params.id === highlightedRowId) return `${actionType}-row`;
            return '';
          }}
          onRowClick={(params, event) => {
            if (event.target.closest('button')) return; 
            handleView(params.row);
          }}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>

      {/* MODALS */}
      <ActionsModal 
        open={isActionsModalOpen}
        onClose={() => setIsActionsModalOpen(false)}
        docData={selectedDoc}
        onView={() => { setIsActionsModalOpen(false); setIsDetailOpen(true); }}
        onUpdateStatus={() => { setIsActionsModalOpen(false); setIsUpdateModalOpen(true); }}
        onRequestRevision={() => { setIsActionsModalOpen(false); setIsRequestModalOpen(true); }}
        onReply={() => { setIsActionsModalOpen(false); setIsReplyModalOpen(true); }}
        onDelete={() => { setIsActionsModalOpen(false); setIsDeleteModalOpen(true); }}
      />

      <DocumentMDetailsModal 
        open={isDetailOpen} 
        onClose={() => { setIsDetailOpen(false); setHighlightedRowId(null); setActionType(""); }} 
        docData={selectedDoc} 
        onRefresh={noOp} 
      />
      
      <DocumentUpdateModal 
        open={isUpdateModalOpen} 
        onClose={() => setIsUpdateModalOpen(false)} 
        docData={selectedDoc} 
        onUpdate={handleUpdateStatus}
      />

      <DocumentRequestModal 
        open={isRequestModalOpen} 
        onClose={() => setIsRequestModalOpen(false)} 
        docData={selectedDoc} 
        onSendRequest={(id, status, remark) => handleUpdateStatus(id, status, { adminRemarks: remark })} 
      />

      <DocumentReplyModal 
        open={isReplyModalOpen} 
        onClose={() => setIsReplyModalOpen(false)} 
        docData={selectedDoc} 
        onSendReply={(id, status, msg) => handleUpdateStatus(id, status, { adminReply: msg })} 
      />
    </Box>
  );
};

export default DocumentManagement;