import React, { useState, useEffect } from "react";
import { Box, Button, TextField, InputAdornment, Typography, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { supabase } from "../../supabaseClient";
import { db } from "../../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from '@mui/icons-material/Visibility'; // Added for View
import DocumentModal from "./DocumentModal";
import "./AddDocument.css";



const AddDocument = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [editDoc, setEditDoc] = useState(null);
  const [searchText, setSearchText] = useState("");

  const handleEdit = (document) => {
    // You can either open a new modal or use the existing DocumentModal 
    // by passing the document data as a prop.
    console.log("Editing document:", document);
    setEditDoc(document);
    setIsModalOpen(true);
  };  

  const handleDelete = async (id) => {
      // Find the document in our state to get the file information
      const docToDelete = documents.find((d) => d.id === id);

      if (window.confirm("Are you sure you want to delete this document and its associated files?")) {
        try {
          // 1. Delete files from Supabase Storage first
          if (docToDelete?.files && docToDelete.files.length > 0) {
            const filesToRemove = docToDelete.files.map((file) => {
              // We need the path (e.g., "documents/123_file.pdf")
              // If you only saved the URL, we extract the filename from it
              const urlParts = file.url.split('/');
              const fileName = urlParts[urlParts.length - 1];
              return fileName; 
            });

            const { error: storageError } = await supabase.storage
              .from('documents')
              .remove(filesToRemove.map(name => `documents/${name}`)); // Ensure path matches bucket structure

            if (storageError) {
              console.error("Supabase Storage deletion error:", storageError.message);
            }
          }

          // 2. Delete metadata from Firestore
          await deleteDoc(doc(db, "documents", id));

          // 3. Refresh UI
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
        
        // --- DATE & TIME LOGIC ---
        let formattedDate = "N/A";
        if (docData.createdAt?.toDate) {
            // If it's a Firestore Timestamp
            formattedDate = docData.createdAt.toDate().toLocaleString();
        } else if (docData.uploadDate) {
            // Fallback for your existing strings
            formattedDate = docData.uploadDate; 
        }

        return {
          id: doc.id,
          ...docData,
          displayDate: formattedDate // Use this for the column
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

  const filteredRows = documents.filter((doc) =>
    doc.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    doc.categoryName?.toLowerCase().includes(searchText.toLowerCase()) // Fixed field name
  );

const columns = [
  { 
    field: "title", 
    headerName: "Document Title", 
    flex: 1.5 
  },
  { 
    field: "categoryName", 
    headerName: "Category", 
    flex: 1 
  },
  { 
    field: "displayDate", 
    headerName: "Date & Time Uploaded", 
    flex: 1.2 
  },
  {
    field: "actions",
    headerName: "Actions",
    flex: 2, // Increased flex to fit the text labels
    renderCell: (params) => (
      <Box display="flex" gap="8px" alignItems="center" height="100%">
        {/* VIEW BUTTON */}
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

        {/* EDIT BUTTON */}
        <Button
          variant="text"
          size="small"
          color="secondary"
          startIcon={<EditIcon />}
          onClick={() => handleEdit(params.row)}
        >
          Edit
        </Button>

        {/* DELETE BUTTON */}
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
    <Box className="categories-container" sx={{ display: 'flex', flexDirection: 'column', height: '85vh' }}>
      <Typography variant="h4" className="categories-header-text" sx={{ mb: 2 }}>
        Manage Documents
      </Typography>

      <Box className="categories-top-bar" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsModalOpen(true)}
          className="create-btn"
        >
          Add New Document
        </Button>
        
        <TextField
          variant="outlined"
          placeholder="Search by title or category..."
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* --- TABLE HEIGHT FIX --- */}
      {/* We use flexGrow: 1 to push the footer to the bottom even when empty */}
      <Box className="datagrid-wrapper" sx={{ height: 'calc(100vh - 250px)', width: '100%', bgcolor: 'white' }}>
              <DataGrid
                rows={filteredRows}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10, 20]}
                disableSelectionOnClick
              />
            </Box>

            {/* UPDATE MODAL PROPS */}
            <DocumentModal 
              open={isModalOpen} 
              onClose={handleCloseModal} 
              onDocumentAdded={fetchDocuments}
              editData={editDoc} // Pass the data to be edited
            />
          </Box>
  );
};

export default AddDocument;