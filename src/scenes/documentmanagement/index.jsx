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
  arrayUnion,
  getCountFromServer 
} from "firebase/firestore"; 
import { tokens } from "../../theme";
import Header from "../../components/Header";
import DocumentUpdateModal from "../../modals/documentmanagementmodals/DocumentUpdateModal";
import DocumentRequestModal from "../../modals/documentmanagementmodals/DocumentRequestModal";
import DocumentDetailsModal from "../../modals/documentmanagementmodals/DocumentDetailsModal";
import DocumentDeleteModal from "../../modals/documentmanagementmodals/DocumentDeleteModal";
import ActionsModal from "../../modals/documentmanagementmodals/ActionsModal";
import "./index.css"; 

const DocumentManagement = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Pagination & Data States
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });
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
        );

        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDocuments(docs);
    } catch (error) {
        console.error("Fetch Error:", error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  // --- HANDLER FUNCTIONS ---
  const handleUpdateStatus = async (id, newAdminStatus, adminRemarks) => {
    // 1. Start Highlight
    setHighlightedRowId(id);
    setActionType("update"); // Uses the green/blue highlight

    try {
      const docRef = doc(db, "documents", id);
      const messageBody = typeof adminRemarks === 'string' ? adminRemarks : (adminRemarks?.adminRemarks || adminRemarks?.adminReply);

      const updateData = {
        adminStatus: newAdminStatus,
        updatedAt: new Date(),
        thread: arrayUnion({
          sender: "Admin",
          message: messageBody ? `STATUS UPDATE [${newAdminStatus}]: ${messageBody}` : `Status changed to: ${newAdminStatus}`,
          timestamp: new Date().toISOString()
        })
      };

  await updateDoc(docRef, updateData);
      
      // Close modal but wait to clear highlight so user sees the change
      setIsUpdateModalOpen(false);

      setTimeout(() => {
        setHighlightedRowId(null);
        setActionType("");
        fetchDocs(); 
      }, 1200); // Slightly longer to allow the user to see the row highlighted
      
    } catch (error) {
      console.error("Error updating status:", error);
      setHighlightedRowId(null);
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

  // 1. Function to switch from Actions Modal to Request Modal
  const handleOpenRequestModal = () => {
    setIsActionsModalOpen(false);
    setIsRequestModalOpen(true);
  };

  // 2. Function to actually save the revision request to Firebase
  const handleFinalSubmitRevision = async (id, remarks) => {
    setHighlightedRowId(id);
    setActionType("revision");

    try {
      const docRef = doc(db, "documents", id);
      await updateDoc(docRef, {
        adminStatus: "Revision Requested",
        // Push the revision details into the thread so User sees it in their Inbox
        thread: arrayUnion({
          sender: "Admin",
          message: `⚠️ REVISION REQUESTED: ${remarks}`,
          timestamp: new Date().toISOString()
        }),
        updatedAt: new Date(),
      });
      
      setIsRequestModalOpen(false);

      setTimeout(() => {
        setHighlightedRowId(null);
        setActionType("");
        fetchDocs(); 
      }, 1200);
    } catch (error) {
      console.error("Error sending revision:", error);
      setHighlightedRowId(null);
    }
};

  // --- DELETE WITH FLASH ---
const handleConfirmDelete = (id) => {
    setHighlightedRowId(id);
    setActionType("delete"); // This triggers the .delete-row CSS class

    // Wait for the flash animation to be visible (800ms) before refreshing the list
    setTimeout(() => {
      fetchDocs(); // This pulls the new list (where the doc is now gone)
      setHighlightedRowId(null);
      setActionType("");
    }, 800); 
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

          // ADD THIS CASE:
          case "Revision Requested": 
            chipColor = "#ef6c00"; // Deep orange
            break;

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
    <Box m="20px" >
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
        height="61vh"
        sx={{
          flexGrow: 1, // This tells the box to take up ALL remaining vertical space
          width: "100%",
          mb: "20px", // Margin at the very bottom
          "& .MuiDataGrid-root": { border: "none", display: "flex", flexDirection: "column",},
          "& .MuiDataGrid-main": { flex: "1 1 auto", display: "flex", flexDirection: "column",},
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400], flex: "1 1 auto", },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiDataGrid-row:hover": { backgroundColor: `${colors.primary[400]} !important` },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700],},
          "& .MuiDataGrid-row": { transition: "background-color 0.3s ease", },

          // View Detail - Greyish (Matches grey[100] / blueAccent[100] grade)
          "& .view-row": { 
            backgroundColor: `${colors.primary[900]} !important`, // A lighter grey/navy than the background 
            transition: "background-color 0.5s ease" 
          },

          // Update Status/Reply - Solid Green (Matches greenAccent[700])
          "& .update-row": { 
            backgroundColor: `${colors.greenAccent[700]} !important`, 
            transition: "background-color 0.5s ease" 
          },

          // Revision Requested (Keep as is)
          "& .revision-row": { 
            backgroundColor: "rgba(239, 108, 0, 0.35) !important", 
            transition: "background-color 0.5s ease" 
          },

          // Delete (Keep as is)
          "& .delete-row": { 
            backgroundColor: `${colors.redAccent[600]} !important`, 
            color: "white" 
          },
        }}
      >
      <DataGrid
        rows={filteredRows}
        columns={columns}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        paginationMode="client"
        // This is the key: if there are few rows, it won't shrink the table
        autoHeight={false} 
        getRowClassName={(params) => {
          if (params.id === highlightedRowId && actionType) {
            return `${actionType}-row`;
          }
          return '';
        }}
        onRowClick={(params, event) => {
          if (event.target.closest('button')) return; 
          handleView(params.row);
        }}
        slots={{ toolbar: GridToolbar }}
      />
      </Box>

      {/* MODALS */}
    <ActionsModal 
      open={isActionsModalOpen}
      onClose={() => {
        setIsActionsModalOpen(false);
        // Only clear highlight if no other modal is opening
        if(!isUpdateModalOpen && !isRequestModalOpen && !isDeleteModalOpen) {
          setHighlightedRowId(null);
        }
      }}
      docData={selectedDoc}
      onView={() => { 
        setIsActionsModalOpen(false); 
        handleView(selectedDoc); 
      }}
      onUpdateStatus={() => { 
        setHighlightedRowId(selectedDoc.id); 
        setActionType("update");
        setIsActionsModalOpen(false); 
        setIsUpdateModalOpen(true); 
      }}
      onRequest={() => {
        setHighlightedRowId(selectedDoc.id);
        setActionType("revision");
        setIsActionsModalOpen(false);
        setIsRequestModalOpen(true);
      }}
      onDelete={() => {
        setHighlightedRowId(selectedDoc.id);
        setActionType("delete");
        setIsActionsModalOpen(false); 
        setIsDeleteModalOpen(true);    
      }}
    />

    {/* DELETE MODAL */}
    <DocumentDeleteModal 
      open={isDeleteModalOpen}
      onClose={() => {
        setIsDeleteModalOpen(false);
        setHighlightedRowId(null); // Clear highlight on cancel
      }}
      docData={selectedDoc}
      onConfirm={() => handleConfirmDelete(selectedDoc.id)} 
    />

     {/* VIEW MODAL */}   
      <DocumentDetailsModal 
        open={isDetailOpen} 
        onClose={() => { setIsDetailOpen(false); setHighlightedRowId(null); setActionType(""); }} 
        docData={selectedDoc} 
        onRefresh={noOp} 
      />
      
      {/* UPDATE MODAL */}
      <DocumentUpdateModal 
        open={isUpdateModalOpen} 
        onClose={() => {
          setIsUpdateModalOpen(false);
          setHighlightedRowId(null); // Clear highlight on cancel
        }} 
        docData={selectedDoc} 
        onUpdate={handleUpdateStatus}
      />

      {/* REQUEST MODAL */}
      <DocumentRequestModal 
        open={isRequestModalOpen} 
        onClose={() => {
          setIsRequestModalOpen(false);
          setHighlightedRowId(null); // Clear highlight on cancel
        }} 
        docData={selectedDoc} 
        onRequest={handleFinalSubmitRevision}
      />
      
    </Box>
  );
};

export default DocumentManagement;