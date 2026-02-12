import React, { useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography } from "@mui/material";

// Mock data for HR documents
const initialDocuments = [
  { id: 1, type: "Memorandum", title: "Training Schedule", status: "Submitted" },
  { id: 2, type: "Office Order", title: "Leave Policy Update", status: "Under Review" },
  { id: 3, type: "Notice", title: "New Health Guidelines", status: "Draft" },
];

const Tracker = () => {
  const [documents, setDocuments] = useState(initialDocuments);

  // Update status function
  const updateStatus = (id, newStatus) => {
    const updatedDocs = documents.map((doc) =>
      doc.id === id ? { ...doc, status: newStatus } : doc
    );
    setDocuments(updatedDocs);
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Typography variant="h5" gutterBottom>
        HR Document Tracker
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.id}</TableCell>
                <TableCell>{doc.type}</TableCell>
                <TableCell>{doc.title}</TableCell>
                <TableCell>{doc.status}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    sx={{ mr: 1 }}
                    onClick={() => updateStatus(doc.id, "Approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    onClick={() => updateStatus(doc.id, "Rejected")}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Tracker;
