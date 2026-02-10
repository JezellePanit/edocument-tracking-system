import React, { useState, useEffect } from "react";
import { Box, Button, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { supabase } from "../../supabaseClient";
import { db } from "../../firebaseConfig";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility'; 

import DocumentModal from "../document/DocumentModal";
import "./index.css";

const Invoices = ({ searchTerm = "" }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [editDoc, setEditDoc] = useState(null);

  const handleEdit = (document) => {
    console.log("Editing document:", document);
    setEditDoc(document);
    setIsModalOpen(true);
  };  

  const handleDelete = async (id) => {
    const docToDelete = documents.find((d) => d.id === id);

    if (window.confirm("Are you sure you want to delete this document and its associated files?")) {
      try {
        if (docToDelete?.files && docToDelete.files.length > 0) {
          const filesToRemove = docToDelete.files.map((file) => {
            const urlParts = file.url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            return fileName; 
          });

          const { error: storageError } = await supabase.storage
            .from('documents')
            .remove(filesToRemove.map(name => `documents/${name}`));

          if (storageError) {
            console.error("Supabase Storage deletion error:", storageError.message);
          }
        }

        await deleteDoc(doc(db, "documents", id));
        fetchDocuments();
        console.log("Document and files deleted successfully.");
      } catch (error) {
        console.error("Error during deletion process: ", error);
        alert("Failed to delete the document completely.");
      }
    }
  };  
    
  const fetchDocuments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "documents"));
      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        
        let formattedDate = "N/A";
        if (docData.createdAt?.toDate) {
          formattedDate = docData.createdAt.toDate().toLocaleString();
        } else if (docData.uploadDate) {
          formattedDate = docData.uploadDate; 
        }

        return {
          id: doc.id,
          ...docData,
          displayDate: formattedDate 
        };
      });
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  console.log("Current Search Term:", searchTerm);
  const filteredRows = documents.filter((doc) => {
    const search = (searchTerm || "").toLowerCase();
    
    return (
      doc.title?.toLowerCase().includes(search) ||
      doc.categoryName?.toLowerCase().includes(search)
    );
  });

  const columns = [
    { field: "title", headerName: "Document Title", flex: 1.5 },
    { field: "categoryName", headerName: "Category", flex: 1 },
    { field: "displayDate", headerName: "Date & Time Uploaded", flex: 1.2 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 2,
      renderCell: (params) => (
        <Box display="flex" gap="8px" alignItems="center" height="100%">
          <Button
            variant="text"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={() => {
              if (params.row.files?.length > 0) {
                window.open(params.row.files[0].url, "_blank");
              } else {
                alert("No files attached.");
              }
            }}
          >
            View
          </Button>

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
            onClick={() => handleDelete(params.id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditDoc(null); 
  };

return (
    <Box m="20px">
      <Header title="DOCUMENTS" subtitle="Managing Documents" />
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
            color: colors.grey[100], // Ensures the footer text is visible
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
        }}
      >
        <DataGrid
          key={searchTerm}
          rows={filteredRows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20]}
          disableSelectionOnClick
        />
      </Box>

      <DocumentModal 
        open={isModalOpen} 
        onClose={handleCloseModal} 
        onDocumentAdded={fetchDocuments}
        editData={editDoc} 
      />
    </Box>
  );
};

export default Invoices;