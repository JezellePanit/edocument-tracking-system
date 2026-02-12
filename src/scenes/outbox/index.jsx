import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme, Chip, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import VisibilityIcon from '@mui/icons-material/Visibility'; 
import DeleteIcon from "@mui/icons-material/Delete";
import DocumentMDetailsModal from "../../modals/outboxmodals/ViewOutboxModal";
import DeleteConfirmModal from "../../modals/mydocumentmodals/DeleteConfirmModal";

const Outbox = ({ searchTerm = "" }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [outboxDocs, setOutboxDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [docToDelete, setDocToDelete] = useState(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, "documents"),
      where("senderId", "==", currentUser.uid),
      where("status", "==", "Sent"),
      orderBy("lastForwardedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        displayDate: doc.data().lastForwardedAt?.toDate 
          ? doc.data().lastForwardedAt.toDate().toLocaleString() 
          : "N/A",
      }));
      setOutboxDocs(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const filteredRows = outboxDocs.filter((doc) => {
    const search = (searchTerm || "").toLowerCase();
    return (
      doc.title?.toLowerCase().includes(search) ||
      doc.recipientName?.toLowerCase().includes(search) ||
      doc.documentId?.toLowerCase().includes(search)
    );
  });

  const columns = [
    { 
      field: "documentId", 
      headerName: "Document ID", 
      flex: 1,
      renderCell: (params) => (
        <Box fontWeight="bold" color={colors.greenAccent[400]}>{params.value || "SENT"}</Box>
      )
    },
    { field: "title", headerName: "Document Title", flex: 1.5 },
    { 
      field: "submittedTo", 
      headerName: "Target Department", 
      flex: 1,
      renderCell: (params) => (
        <Typography color={colors.greenAccent[400]}>{params.value}</Typography>
      )
    },
    { 
      field: "priority", 
      headerName: "Priority", 
      flex: 1,
      renderCell: (params) => {
        const priority = params.value || "Normal";
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
            className="priority-chip"
            size="small"
            sx={{ backgroundColor: chipColor, color: colors.grey[100] }}
          />
        );
      }
    },
    { field: "displayDate", headerName: "Date Sent", flex: 1.2 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1.5,
      headerAlign: "center",
      renderCell: (params) => (
        <Box display="flex" justifyContent="center" alignItems="center" height="100%" width="100%" gap="8px">
          <Button
            variant="text"
            size="small"
            startIcon={<VisibilityIcon />}
            onClick={(e) => { e.stopPropagation(); setSelectedDoc(params.row); setIsDetailOpen(true); }}
          >View</Button>
          <Button
            variant="text"
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={(e) => { e.stopPropagation(); setDocToDelete(params.row); setIsDeleteModalOpen(true); }}
          >Delete</Button>
        </Box>
      ),
    },
  ];

  return (
    <Box m="20px">
      <Header title="OUTBOX" subtitle="Documents Sent" />
      
      {/* Container class handles the layout/border design */}
      <Box
        className="datagrid-container"
        m="40px 0 0 0"
        height="70vh"
        sx={{
          /* Still using SX for theme-specific colors */
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700] },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { backgroundColor: colors.blueAccent[700] },
          "& .MuiDataGrid-row:hover": { backgroundColor: `${colors.primary[400]} !important` },
        }}
      >
        <DataGrid 
          loading={loading}
          rows={filteredRows} 
          columns={columns} 
          onRowClick={(params, event) => {
            if (event.target.closest('button')) return; 
            setSelectedDoc(params.row);
            setIsDetailOpen(true); 
          }}
          pageSize={10}
          rowsPerPageOptions={[10, 20]}
          disableSelectionOnClick
        />
      </Box>

      <DocumentMDetailsModal open={isDetailOpen} onClose={() => setIsDetailOpen(false)} docData={selectedDoc} />
      
      <DeleteConfirmModal 
        open={isDeleteModalOpen} 
        onClose={() => { setIsDeleteModalOpen(false); setDocToDelete(null); }} 
        docData={docToDelete}   
        onConfirm={() => setIsDeleteModalOpen(false)} 
      />
    </Box>
  );
};

export default Outbox;