import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { db, auth } from "../../firebaseConfig";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { collection, getDocs, onSnapshot, query, where, or} from "firebase/firestore";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';

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

  // Get the current logged-in user
  const currentUser = auth.currentUser;  

  useEffect(() => {
    if (!currentUser) return;

    // --- ROLE BASED FILTERING LOGIC ---
    // We want to see documents where:
    // 1. The user is the Creator (uploaderId)
    const q = query(
      collection(db, "documents"),
      or(
        where("ownerId", "==", currentUser.uid),
      )
    );    
    
    // This creates a "live" connection to your documents
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const docData = doc.data();
        let formattedDate = "N/A";
        if (docData.createdAt?.toDate) {
          formattedDate = docData.createdAt.toDate().toLocaleString();
        }
        return {
          id: doc.id,
          ...docData,
          displayDate: formattedDate 
        };
      });
      setDocuments(docs);
    });

    return () => unsubscribe(); 
  }, [currentUser]); // Re-run if user logs in/out

  // Handle Edit action
  const handleEdit = (document) => {
    setSelectedDoc(document);
    setIsEditModalOpen(true);
  };

  // Fetch documents from Firestore   
  const fetchDocuments = useCallback(async () => {
    if (!currentUser) return;
    try {
      const q = query(
        collection(db, "documents"),
        or(
          where("ownerId", "==", currentUser.uid),
        )
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        let formattedDate = docData.createdAt?.toDate ? docData.createdAt.toDate().toLocaleString() : "N/A";
        return { id: doc.id, ...docData, displayDate: formattedDate };
      });
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  }, [currentUser]); // Function only changes if currentUser changes

  useEffect(() => {
      fetchDocuments();
    }, [fetchDocuments]);

  // Filter based on the search bar
  const filteredRows = documents.filter((doc) => {
    const search = (searchTerm || "").toLowerCase();
    return (
      doc.title?.toLowerCase().includes(search) ||
      doc.categoryName?.toLowerCase().includes(search)
    );
  });

  // Define columns for DataGrid
  const columns = [
    { field: "title", headerName: "Document Title", flex: 1.5 },
    { field: "categoryName", headerName: "Category", flex: 1 },
    { field: "displayDate", headerName: "Date & Time Uploaded", flex: 1.2 },

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
        renderCell: (params) => {
          const isSent = params.row.status === "Sent";

          return (
            <Box display="flex" alignItems="center" height="100%">
              <Button
                variant={isSent ? "outlined" : "contained"}
                size="small"
                // If sent, use a subtle color; if not, use the primary action color
                color={isSent ? "secondary" : "info"} 
                startIcon={isSent ? <ReplyIcon /> : <SendIcon />}
                onClick={() => {
                  setSelectedDoc(params.row);
                  setIsForwardModalOpen(true);
                }}
                sx={{ 
                  borderRadius: "4px", 
                  textTransform: "none",
                  fontSize: "12px" 
                }}
              >
                {isSent ? "Send Another" : "Send"}
              </Button>
            </Box>
          );
        },
      },    
  ];

  // Handle closing the modal and resetting edit state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditDoc(null); 
  };

  // Handle row click to open detail modal (if needed)
const handleRowClick = (params, event) => {
    if (event.target.closest('button')) return; 

    setSelectedDoc(params.row);
    setIsDetailOpen(true); 
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
        }}
      >
        <DataGrid
          key={searchTerm}
          rows={filteredRows}
          columns={columns}
          onRowClick={handleRowClick}
          sx={{ cursor: "pointer", 
            "& .MuiDataGrid-row:hover": {
              backgroundColor: colors.primary[400], }, 
          }}
          pageSize={10}
          rowsPerPageOptions={[10, 20]}
          disableSelectionOnClick
        />
      </Box>

      {/* MODALS */}          
      {/* When user click a row/view in the table */}
      <DocumentMDetailsModal 
        open={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        docData={selectedDoc} 
        onRefresh={fetchDocuments}
      />
      {/* When user click forward */}      
      <ForwardDocumentModal 
        open={isForwardModalOpen} 
        onClose={() => setIsForwardModalOpen(false)} 
        docData={selectedDoc} 
        onForwardSuccess={fetchDocuments} 
      />

      {/* When user click edit */}
      <EditDocumentModal 
        open={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        docData={selectedDoc} 
        onEditSuccess={fetchDocuments}
      />

      {/* When user click delete */}
      <DeleteConfirmModal 
        open={isDeleteModalOpen} 
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDocToDelete(null);
        }} 
        docData={docToDelete}   
        onConfirm={fetchDocuments} 
      />

      {/* When user click add new document */}
      <DocumentModal 
        open={isModalOpen} 
        onClose={handleCloseModal} 
        onDocumentAdded={fetchDocuments}
        editData={editDoc} 
      />
    </Box>
  );
};

export default MyDocument;