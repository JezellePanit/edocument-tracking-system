import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, Chip, Button, Badge, Tooltip } from "@mui/material"; // Added Badge
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, updateDoc } from "firebase/firestore";
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import DeleteIcon from "@mui/icons-material/Delete";
import DocumentMDetailsModal from "../../modals/outboxmodals/ViewOutboxModal";
import DeleteConfirmModal from "../../modals/mydocumentmodals/DeleteConfirmModal";
import FiberNewIcon from '@mui/icons-material/FiberNew'; // Added for the modern indicator

const Outbox = ({ searchTerm = "" }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [outboxDocs, setOutboxDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userDepartment, setUserDepartment] = useState("Loading...");
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  // --- HIGHLIGHT STATES ---
  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const [actionType, setActionType] = useState(""); 

  const currentUser = auth.currentUser;

  // Pagination & Data States
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 100 });
   
  // --- DEPARTMENT FORMATTING LOGIC ---
  const formatDepartmentName = (dept) => {
    if (!dept) return "N/A";
    const deptMap = {
      "executive": "Executive Office",
      "it": "IT / System Admin",
      "admin": "Administrative Section",
      "records": "Records Management Office",
      "procurement": "Procurement Section",
      "finance": "Finance Section",
      "training": "Training Section",
      "assessment": "Assessment Section",
    };

    const searchKey = dept.toLowerCase().trim();
    if (deptMap[searchKey]) return deptMap[searchKey];
    if (searchKey.includes("office") || searchKey.includes("department")) {
        return dept.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }
    return dept.charAt(0).toUpperCase() + dept.slice(1).toLowerCase();
  };

  // --- FETCH USER DEPARTMENT ---
  useEffect(() => {
    const fetchUserDept = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const rawDept = userDocSnap.data().department;
            setUserDepartment(formatDepartmentName(rawDept));
          }
        } catch (error) {
          console.error("Error fetching user department:", error);
          setUserDepartment("N/A");
        }
      }
    };
    fetchUserDept();
  }, [currentUser]);

// --- FETCH OUTBOX DOCUMENTS + NOTIFICATION LOGIC ---
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "documents"),
      where("senderId", "==", currentUser.uid),
      where("status", "==", "Sent"),
      orderBy("lastForwardedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // Load previously seen statuses from LocalStorage
      const storedHistory = JSON.parse(localStorage.getItem(`outbox_history_${currentUser.uid}`)) || {};
      const newHistory = { ...storedHistory };

      const docs = snapshot.docs.map((doc) => {
        const data = doc.data();
        const docId = doc.id;
        const currentStatus = data.adminStatus || "Pending";
        
        // If the status in DB is different from what we last saved, mark as changed
        const hasChanged = storedHistory[docId] && storedHistory[docId] !== currentStatus;
        
        // Update our temporary object for this session
        newHistory[docId] = currentStatus;

        return {
          id: docId,
          ...data,
          hasChanged: hasChanged, // Custom flag for UI
          displayDate: data.lastForwardedAt?.toDate 
            ? data.lastForwardedAt.toDate().toLocaleString() 
            : "N/A",
        };
      });

      // Save the current state so next time it's not "new"
      localStorage.setItem(`outbox_history_${currentUser.uid}`, JSON.stringify(newHistory));
      
      setOutboxDocs(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // --- HANDLERS ---
  const handleView = (row) => {
    setSelectedDoc(row);
    setIsDetailOpen(true);
    setHighlightedRowId(row.id);
    setActionType("view");
    
    // 1. Update Local State
    setOutboxDocs(prev => prev.map(d => d.id === row.id ? { ...d, hasChanged: false } : d));

    // 2. Update LocalStorage so it stays "read"
    const storedHistory = JSON.parse(localStorage.getItem(`outbox_history_${currentUser.uid}`)) || {};
    storedHistory[row.id] = row.adminStatus; // Sync current status to history
    localStorage.setItem(`outbox_history_${currentUser.uid}`, JSON.stringify(storedHistory));
  };

  // Inside Outbox.jsx
  const handleDeleteConfirm = async (docId) => { // Added async
    setHighlightedRowId(docId);
    setActionType("delete-flash");
    
    try {
      // This changes the status so it disappears from "Sent" queries
      const docRef = doc(db, "documents", docId);
      await updateDoc(docRef, { 
        status: "Deleted",
        deletedAt: new Date() // Good for record keeping!
      });
    } catch (error) {
      console.error("Error soft-deleting document:", error);
    }

    setTimeout(() => {
      // Keep your existing UI logic
      setOutboxDocs((prevDocs) => prevDocs.filter(d => d.id !== docId));
      setIsDeleteModalOpen(false);
      setDocToDelete(null);
      setHighlightedRowId(null);
      setActionType("");
    }, 800); 
  };

  const filteredRows = outboxDocs.filter((doc) => {
    const search = (searchTerm || "").toLowerCase();
    return (
      doc.title?.toLowerCase().includes(search) ||
      doc.recipientName?.toLowerCase().includes(search) ||
      doc.recipientEmail?.toLowerCase().includes(search) ||
      doc.documentId?.toLowerCase().includes(search)
    );
  });

  const columns = [
    { 
      field: "adminStatus", 
      headerName: "Status", 
      flex: 1.2,
      renderCell: (params) => {
        const status = params.value || "Pending";
        const hasChanged = params.row.hasChanged; // Get our custom flag
        let chipColor;
        let pulse = false;

        switch(status) {
          case "In Review": chipColor = colors.greenAccent[500]; break;
          case "On Hold": chipColor = colors.blueAccent[500]; break;
          case "Completed": chipColor = colors.greenAccent[600]; break;
          case "Deferred": chipColor = "#ef6c00"; break;
          case "Rejected": 
            chipColor = colors.redAccent[500]; 
            pulse = true; 
            break;
          default: chipColor = colors.grey[500]; 
        }
        
        return (
          <Box display="flex" alignItems="center" height="100%" gap="12px">
            <Badge
              overlap="circular"
              variant="dot"
              invisible={!hasChanged}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: colors.redAccent[500],
                  animation: "pulse-red 1.5s infinite",
                }
              }}
            >
              <Chip 
                label={status} 
                size="small" 
                sx={{ 
                  borderRadius: "4px", 
                  backgroundColor: chipColor, 
                  color: "#fff", 
                  fontWeight: "bold",
                  width: "100px",
                }} 
              />
            </Badge>
            {hasChanged && (
              <Typography 
                variant="caption" 
                sx={{ 
                  color: colors.redAccent[400], 
                  fontWeight: "bold", 
                  fontSize: "0.7rem",
                  textTransform: "uppercase"
                }}
              >
                Updated
              </Typography>
            )}
          </Box>
        );
      }
    },
    { 
      field: "documentId", 
      headerName: "Document ID", 
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography fontWeight="bold" color={colors.greenAccent[400]}>
            {params.value || "SENT"}
          </Typography>
        </Box>
      )
    },
    { 
      field: "title", 
      headerName: "Document Title", 
      flex: 1.5,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography>{params.value}</Typography>
        </Box>
      )
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
                paddingLeft: "8px",
                paddingRight: "8px",
              }
            }} 
          />
        </Box>
      )
    },
    // { 
    //   field: "senderDepartment", 
    //   headerName: "Sender Department", 
    //   flex: 1.2,
    //   renderCell: (params) => (
    //     <Box display="flex" alignItems="center" height="100%">
    //       <Typography color={colors.greenAccent[400]}>
    //         {/* Use params.row.senderDepartment, NOT userDepartment */}
    //         {formatDepartmentName(params.row.senderDepartment || "General")}
    //       </Typography>
    //     </Box>
    //   )
    // },
    { 
      field: "recipientName", 
      headerName: "Recipient Email", 
      flex: 1.3,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%"><Typography>{params.value || "N/A"}</Typography></Box>
      )
    },
    // { 
    //   field: "submittedTo", 
    //   headerName: "Target Department", 
    //   flex: 1.2,
    //   renderCell: (params) => (
    //     <Box display="flex" alignItems="center" height="100%">
    //       <Typography color={colors.greenAccent[400]}>{formatDepartmentName(params.value)}</Typography>
    //     </Box>
    //   )
    // },
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
      field: "displayDate", 
      headerName: "Date Sent", 
      flex: 1.2,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography>{params.value}</Typography>
        </Box>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%" width="100%" gap="8px">
          <Button
            variant="text"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={(e) => { 
              e.stopPropagation(); 
              handleView(params.row);
            }}
            sx={{ textTransform: "none" }}
          >View</Button>
          <Button
            variant="text"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={(e) => { 
              e.stopPropagation(); 
              setDocToDelete(params.row); 
              setHighlightedRowId(params.row.id);
              setActionType("delete");
              setIsDeleteModalOpen(true); 
            }}
            sx={{ textTransform: "none" }}
          >Delete</Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="OUTBOX" subtitle="Documents Sent" />
      <Box
        className="datagrid-container"
        m="40px 0 0 0"
        height="77vh"
        sx={{
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700] },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { backgroundColor: colors.blueAccent[700] },
          "& .MuiDataGrid-row:hover": { backgroundColor: `${colors.primary[400]} !important` },
          // Ensuring our custom highlight classes in index.css work here
          "& .delete-flash-row": {
            backgroundColor: `${colors.redAccent[600]} !important`,
            transition: "background-color 0.1s ease",
          },
          "& .view-row": {
            backgroundColor: `${colors.greenAccent[700]} !important`,
            transition: "background-color 0.5s ease",
          },

          // FORCE TEXT TO WHITE IN HIGHLIGHTED ROWS
          // This ensures Typography and Box colors don't stay green/grey
          
          // Ensure Chips inside highlighted rows also look okay
          "& .delete-flash-row .MuiChip-root": {
            borderColor: "#ffffff !important",
            color: "#ffffff !important",
          }
        }}
      >
        <DataGrid 
          loading={loading}
          rows={filteredRows} 
          columns={columns} 
          getRowClassName={(params) => {
            if (params.id === highlightedRowId) return `${actionType}-row`;
            // Add a special class if it has changed to maybe highlight the whole row
            if (params.row.hasChanged) return 'status-changed-row';
            return '';
          }}
          onRowClick={(params, event) => {
            if (event.target.closest('button')) return; 
            handleView(params.row);
          }}
          pageSize={10}
          rowsPerPageOptions={[10, 20]}
          disableSelectionOnClick
        />
      </Box>

      <DocumentMDetailsModal 
        open={isDetailOpen} 
        onClose={() => {
          setIsDetailOpen(false);
          setHighlightedRowId(null);
          setActionType("");
        }} 
        docData={selectedDoc} 
      />

      {/* When user click delete in Outbox */}
      <DeleteConfirmModal 
        open={isDeleteModalOpen} 
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDocToDelete(null);
          setHighlightedRowId(null); 
          setActionType("");
        }} 
        docData={docToDelete}   
        onConfirm={() => {
          // This triggers the 800ms logic we wrote in step 1
          handleDeleteConfirm(docToDelete.id);
        }}
      />
    </Box>
  );
};

export default Outbox;