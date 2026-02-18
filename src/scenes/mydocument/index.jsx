import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, useTheme, Chip } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { collection, getDocs, onSnapshot, query, where, or} from "firebase/firestore";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import SendIcon from '@mui/icons-material/Send';

import DocumentModal from "../../modals/mydocumentmodals/DocumentModal";
import DocumentMDetailsModal from "../../modals/mydocumentmodals/DocumentDetailsModal";
import ForwardDocumentModal from "../../modals/mydocumentmodals/ForwardDocumentModal";
import DeleteConfirmModal from "../../modals/mydocumentmodals/DeleteConfirmModal";
import EditDocumentModal from "../../modals/mydocumentmodals/EditDocumentModal";
import "./index.css";

const MyDocument = ({ searchTerm = "" }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [editDoc, setEditDoc] = useState(null);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isForwardModalOpen, setIsForwardModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [highlightedRowId, setHighlightedRowId] = useState(null);
  const [actionType, setActionType] = useState(""); // "view", "edit", "add", "delete"

  const navigate = useNavigate();
  const [sendingDocId, setSendingDocId] = useState(null);

  // Get the current logged-in user
  const currentUser = auth.currentUser;  
  
useEffect(() => {
  if (!currentUser) return;

  // 1. Simplified Query (More reliable for real-time)
  const q = query(
    collection(db, "documents"),
    where("ownerId", "==", currentUser.uid)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const docs = snapshot.docs
      .map(doc => {
        const docData = doc.data();
        let formattedDate = docData.createdAt?.toDate 
          ? docData.createdAt.toDate().toLocaleString() 
          : "N/A";
        return {
          id: doc.id,
          ...docData,
          displayDate: formattedDate 
        };
      })
      // 2. THIS IS THE KEY: 
      // This ensures that as soon as a doc status changes to "Sent", 
      // it is filtered out of the 'documents' state instantly.
      .filter(doc => doc.status !== "Sent"); 

    setDocuments(docs);
  }, (error) => {
    console.error("Snapshot error:", error);
  });

  return () => unsubscribe(); 
}, [currentUser]);

  // Create a dummy function so your Modals don't crash when calling onRefresh
  const noOp = () => {};

  // Handle Forwarding success to trigger UI updates in parent
  const handleForwardClose = (wasSent) => {
    if (wasSent === true) {
      // Trigger the green highlight effect
      setTimeout(() => {
        // Remove the document from the local list immediately
        setDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== sendingDocId));
        setSendingDocId(null);
        setIsForwardModalOpen(false);
        
        // REDIRECT to Outbox after the visual effect
        // navigate("/outbox"); 
      }, 800); 
    } else {
      setSendingDocId(null);
      setIsForwardModalOpen(false);
    }
  };

  // Handle Add Success (in the DocumentModal call)
  const handleAddSuccess = (newDocId) => {
    setIsModalOpen(false);
    setHighlightedRowId(newDocId);
    setActionType("add");
    setTimeout(() => { setHighlightedRowId(null); setActionType(""); }, 2000);
  };

  // Handle View
  const handleView = (row) => {
    setSelectedDoc(row);
    setIsDetailOpen(true);
    setHighlightedRowId(row.id);
    setActionType("view");
  };

  // Handle Edit Success
  const handleEditSuccess = (docId) => {
    setIsEditModalOpen(false);
    setHighlightedRowId(docId);
    setActionType("edit");
    setTimeout(() => { setHighlightedRowId(null); setActionType(""); }, 2000);
  };

  // Handle Delete (Highlighting red before it vanishes)
  const handleDeleteConfirm = (docId) => {
    setHighlightedRowId(docId);
    setActionType("delete-flash");
    
    setTimeout(() => {
      setDocuments((prevDocs) => prevDocs.filter(d => d.id !== docId));
      setIsDeleteModalOpen(false);
      setDocToDelete(null);
      setHighlightedRowId(null);
      setActionType("");
    }, 800); // Wait for the red flash before removing
  };  


  // Handle Edit action
  const handleEdit = (document) => {
    setSelectedDoc(document);
    setIsEditModalOpen(true);
  };

  // Fetch documents from Firestore   
  // const fetchDocuments = useCallback(async () => {
  //   if (!currentUser) return;
  //   try {
  //     const q = query(
  //       collection(db, "documents"),
  //       or(
  //         where("ownerId", "==", currentUser.uid),
  //       )
  //     );
  //     const querySnapshot = await getDocs(q);
  //     const data = querySnapshot.docs.map((doc) => {
  //       const docData = doc.data();
  //       let formattedDate = docData.createdAt?.toDate ? docData.createdAt.toDate().toLocaleString() : "N/A";
  //       return { id: doc.id, ...docData, displayDate: formattedDate };
  //     });
  //     setDocuments(data);
  //   } catch (error) {
  //     console.error("Error fetching documents: ", error);
  //   }
  // }, [currentUser]);

  // useEffect(() => {
  //     fetchDocuments();
  //   }, [fetchDocuments]);

  // Filter based on the search bar
  const filteredRows = documents.filter((doc) => {
    const search = (searchTerm || "").toLowerCase();
    return (
      doc.title?.toLowerCase().includes(search) ||
      doc.priority?.toLowerCase().includes(search) ||
      doc.documentId?.toLowerCase().includes(search)
    );
  });

  // Define columns for DataGrid
  const columns = [
  { field: "documentId", headerName: "Document ID", flex: 1,
    renderCell: (params) => (
      <Box fontWeight="bold" color={colors.greenAccent[400]}>
        {params.value || "PENDING"}
      </Box>
    )
  },  
    { field: "title", headerName: "Document Title", flex: 1.5 },
      { field: "displayDate", headerName: "Date & Time Uploaded", flex: 1.2 },

    { 
      field: "priority", 
      headerName: "Priority", 
      flex: 1,
      renderCell: (params) => {
        const priority = params.value || "Normal";
        
        // Define color mapping for the 4 levels
        let chipColor;
          switch(priority) {
            case "Critical": chipColor = colors.redAccent[500]; break;
            case "Urgent": chipColor = "#ef6c00"; break;
            case "Low": chipColor = colors.greenAccent[600]; break;
            default: chipColor = colors.blueAccent[700];
          }

        return (
          <Chip
            label={priority}
            size="small"
            sx={{
              backgroundColor: chipColor,
              color: colors.grey[100],
              fontWeight: "bold",
              borderRadius: "4px",
              minWidth: "80px",
              // Add a pulse effect for Critical items to make them impossible to miss
              animation: priority === "Critical" ? "pulse 2s infinite" : "none",
              "@keyframes pulse": {
                "0%": { opacity: 1 },
                "50%": { opacity: 0.7 },
                "100%": { opacity: 1 },
              }
            }}
          />
        );
      }
    },

    {
      field: "actions",
      headerName: "Actions",
      flex: 1.8,
      renderCell: (params) => (
        <Box display="flex" gap="8px" alignItems="center" height="100%">
          <Button
            variant="text"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => {
              handleView(params.row)
              setSelectedDoc(params.row);
              setIsDetailOpen(true);
            }}
          >
            View
          </Button>

          {params.row.ownerId === currentUser?.uid && (
            <>
              <Button
                variant="text"
                size="small"
                color="secondary"
                startIcon={<EditIcon />}
                onClick={() => handleEdit(params.row)}
              >
                Edit
              </Button>

              <Button
                variant="text"
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  setDocToDelete(params.row);
                  setHighlightedRowId(params.row.id); // Highlight row immediately
                  setActionType("delete");            // Set type to delete (red)
                  setIsDeleteModalOpen(true);
                }}
              >
                Delete
              </Button>
            </>
          )}
        </Box>
      ),
    },

    {
      field: "send",
      headerName: "Send / Forward",
      flex: 1.2,
      renderCell: (params) => (
        <Box display="flex" alignItems="center" height="100%">
          <Button
            variant="contained"
            size="small"
            color="info" 
            startIcon={<SendIcon />}
            onClick={() => {
              setSelectedDoc(params.row);
              setSendingDocId(params.row.id); 
              setIsForwardModalOpen(true);
            }}
            sx={{ borderRadius: "4px", textTransform: "none", fontSize: "12px" }}
          >
            Send
          </Button>
        </Box>
      ),
    },    
  ];

  // Handle closing the modal and resetting edit state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditDoc(null); 
  };

// Handle row click to open detail modal
  const handleRowClick = (params, event) => {
    // Prevent opening details if the user clicked an action button (Edit/Delete/Send)
    if (event.target.closest('button')) return; 

    setSelectedDoc(params.row);
    setIsDetailOpen(true); 
    handleView(params.row);
  };

return (
    <Box m="20px">
      <Header title=" MY DOCUMENTS" subtitle="Managing Documents" />
      <Box className="categories-top-bar" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          sx={{
            backgroundColor: colors.blueAccent[700],
            color: colors.grey[100],
            fontSize: "14px",
            fontWeight: "bold",
            padding: "10px 20px",
            "&:hover": {
              backgroundColor: colors.blueAccent[800],
            },
          }}
        >
          Add New Document
        </Button>
      </Box>

      <Box
        m="40px 0 0 0"
        height="67vh"
        sx={{
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiTablePagination-root": {
            color: colors.grey[100],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-row:hover": {
            backgroundColor: colors.primary[400],
            cursor: "pointer",
          },
          "& .sending-row": {
            backgroundColor: `${colors.greenAccent[700]} !important`,
            transition: "background-color 0.5s ease",
          }
        }}
      >
      <DataGrid 
          rows={filteredRows} 
          columns={columns} 
          components={{ Toolbar: GridToolbar }}
            getRowClassName={(params) => {
              if (params.id === sendingDocId) return 'sending-row';
              if (params.id === highlightedRowId) return `${actionType}-row`;
              return '';
            }}
            onRowClick={handleRowClick} 
          />
      </Box>

      {/* MODALS */}          
      {/* When user click a row/view in the table */}
      <DocumentMDetailsModal 
        open={isDetailOpen} 
        onClose={() => {
          setIsDetailOpen(false);      // Close the modal
          setHighlightedRowId(null);   // Remove the row highlight immediately
          setActionType("");           // Clear the action type
        }} 
        docData={selectedDoc} 
        onRefresh={noOp}
      />

      {/* When user click forward */}      
      <ForwardDocumentModal 
        open={isForwardModalOpen} 
        onClose={handleForwardClose} // FIX: Changed from anonymous function to handleForwardClose
        docData={selectedDoc} 
        onForwardSuccess={noOp}
      />

      {/* When user click edit */}
      <EditDocumentModal 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        docData={selectedDoc} 
        onEditSuccess={(newId) => {
          handleEditSuccess(newId);
          // This closes the modal in the parent state immediately
          setIsEditModalOpen(false); // Close the modal
          console.log("Document updated successfully!");         
        }}
      />

      {/* When user click delete */}
      <DeleteConfirmModal 
        open={isDeleteModalOpen} 
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDocToDelete(null);
          setHighlightedRowId(null); // Clear highlight if they cancel
          setActionType("");
        }} 
        docData={docToDelete}   
        onConfirm={() => {
          handleDeleteConfirm(docToDelete.id);
          // 1. Close the modal immediately
          // setIsDeleteModalOpen(false);
          // setDocToDelete(null);
          
          // 2. OPTIONAL: Manually filter the local state for an "instant" vanish
          // This makes the row disappear BEFORE the server even responds.
          // setDocuments((prevDocs) => prevDocs.filter(d => d.id !== docToDelete.id));
          
          console.log("Document removed from UI");
        }}
      />

      {/* When user click add new document */}
      <DocumentModal 
        open={isModalOpen} 
        onClose={handleCloseModal} 
        onDocumentAdded={(newId) => {
            handleAddSuccess(newId)
            console.log("New document detected!");
          }}
          editData={editDoc} 
        />
    </Box>
  );
};

export default MyDocument;