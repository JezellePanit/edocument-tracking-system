import React, { useState, useEffect } from "react";
import { Box, Button, TextField, InputAdornment, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { db } from "../../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DocumentModal from "./DocumentModal"; // Renamed from CategoryModal

// Make sure your CSS file exists
import "./AddDocument.css";

const AddDocument = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [searchText, setSearchText] = useState("");

  // Fetch Documents from Firestore
  const fetchDocuments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "documents"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDocuments(data);
    } catch (error) {
      console.error("Error fetching documents: ", error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Filter documents based on search text
  const filteredRows = documents.filter((doc) =>
    doc.title?.toLowerCase().includes(searchText.toLowerCase()) ||
    doc.category?.toLowerCase().includes(searchText.toLowerCase())
  );

  const columns = [
    { 
      field: "title", 
      headerName: "Document Title", 
      flex: 1.5, 
      cellClassName: "name-column--cell" 
    },
    { 
      field: "category", 
      headerName: "Category", 
      flex: 1 
    },
    { 
      field: "uploadDate", 
      headerName: "Date Uploaded", 
      flex: 1 
    },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Box display="flex" gap="10px" alignItems="center" height="100%">
          <Button
            variant="contained"
            size="small"
            startIcon={<EditIcon />}
            className="edit-btn"
            onClick={() => console.log("Edit", params.id)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<DeleteIcon />}
            className="delete-btn"
            onClick={() => handleDelete(params.id)}
          >
            Delete
          </Button>
        </Box>
      ),
    },
  ];

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await deleteDoc(doc(db, "documents", id));
        fetchDocuments(); // Refresh the list
      } catch (error) {
        console.error("Error deleting document: ", error);
      }
    }
  };

  return (
    <Box className="categories-container">
      {/* HEADER SECTION */}
      <Typography variant="h4" className="categories-header-text">
        Manage Documents
      </Typography>

      {/* SEARCH & CREATE BAR */}
      <Box className="categories-top-bar">
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
          className="search-field"
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

      {/* THE TABLE */}
      <Box className="datagrid-wrapper" sx={{ height: 400, width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 20]}
          disableSelectionOnClick
          autoHeight
        />
      </Box>

      {/* MODAL COMPONENT */}
      <DocumentModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onDocumentAdded={fetchDocuments} 
      />
    </Box>
  );
};

export default AddDocument;