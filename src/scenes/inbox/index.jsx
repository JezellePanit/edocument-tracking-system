import React, { useState, useEffect } from "react";
import { Box, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { db, auth } from "../../firebaseConfig"; // Ensure auth is imported
import { collection, query, where, getDocs } from "firebase/firestore";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Button } from "@mui/material";
import DocumentDetailsModal from "../../modals/mydocumentmodals/DocumentDetailsModal";

const Inbox = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch only documents forwarded to the CURRENT user
  const fetchReceivedDocuments = async () => {
    try {
      setLoading(true);
      const currentUser = auth.currentUser;

      if (!currentUser) {
        console.error("No user logged in");
        return;
      }

      // QUERY: Only get docs where recipientId matches current user's UID
      const q = query(
        collection(db, "documents"),
        where("recipientId", "==", currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => {
        const docData = doc.data();
        
        return {
          id: doc.id,
          ...docData,
          displayDate: docData.lastForwardedAt?.toDate 
            ? docData.lastForwardedAt.toDate().toLocaleString() 
            : "N/A"
        };
      });

      setDocuments(data);
    } catch (error) {
      console.error("Error fetching received documents: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceivedDocuments();
  }, []);

  const columns = [
    { field: "title", headerName: "Document Title", flex: 1.5 },
    { 
      field: "categoryName", 
      headerName: "Category", 
      flex: 1 
    },
    { 
      field: "displayDate", 
      headerName: "Date Received", 
      flex: 1.2 
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
            setIsDetailOpen(true);
          }}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="INBOX" subtitle="Documents received and forwarded to you" />
      
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
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
        }}
      >
        <DataGrid
          rows={documents}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10]}
          disableSelectionOnClick
        />
      </Box>

      {/* Reusing your Detail Modal to show the file and history */}
      <DocumentDetailsModal 
        open={isDetailOpen} 
        onClose={() => setIsDetailOpen(false)} 
        docData={selectedDoc} 
      />
    </Box>
  );
};

export default Inbox;