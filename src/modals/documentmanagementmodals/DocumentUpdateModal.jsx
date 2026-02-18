import React, { useState } from "react";
import { 
  Box, Typography, Modal, IconButton, Divider, Button, TextField, useTheme 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { tokens } from "../../theme";

const DocumentUpdateModal = ({ open, onClose, docData, onUpdate }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // State for the admin remarks
  const [remarks, setRemarks] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  if (!docData) return null;

  const statuses = ["Pending", "In Review", "On Hold", "Completed", "Deferred", "Rejected"];

  const handleUpdateClick = () => {
    if (!selectedStatus) {
      alert("Please select a status first.");
      return;
    }
    // Passing doc ID, new status, and the admin message
    onUpdate(docData.id, selectedStatus, remarks);
    setRemarks(""); // Reset on success
    setSelectedStatus("");
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle(colors)}>
        {/* HEADER */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
            Update Status & Notify
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: colors.grey[100] }} />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 3 }} />

        <Typography variant="body1" mb={2} color={colors.grey[200]}>
          Updating document: <strong>{docData.documentId}</strong>
        </Typography>

        {/* STATUS SELECTION AREA */}
        <Typography variant="caption" color={colors.greenAccent[500]} fontWeight="bold">
          SELECT NEW STATUS
        </Typography>
        <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap="10px" mt={1} mb={3}>
          {statuses.map((status) => (
            <Button
              key={status}
              variant={selectedStatus === status ? "contained" : "outlined"}
              onClick={() => setSelectedStatus(status)}
              sx={{
                p: "8px",
                fontSize: "11px",
                fontWeight: "bold",
                color: colors.grey[100],
                backgroundColor: selectedStatus === status ? colors.blueAccent[700] : "transparent",
                borderColor: colors.primary[500],
                "&:hover": { bgcolor: colors.primary[500] }
              }}
            >
              {status}
            </Button>
          ))}
        </Box>

        {/* REMARKS INPUT */}
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="filled"
          label="Message / Remarks for Sender"
          placeholder="Explain the reason for this status update..."
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          sx={{
            bgcolor: colors.primary[500],
            borderRadius: "4px",
            mb: 3,
            "& .MuiInputLabel-root": { color: colors.greenAccent[500] },
          }}
        />

        {/* ACTION BUTTONS */}
        <Box display="flex" justifyContent="flex-end" gap="10px">
          <Button onClick={onClose} sx={{ color: colors.grey[100] }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!selectedStatus}
            onClick={handleUpdateClick}
            sx={{
              backgroundColor: colors.blueAccent[700],
              color: colors.grey[100],
              fontWeight: "bold",
              px: 4
            }}
          >
            Update & Send
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const modalStyle = (colors) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 500, // Widened to accommodate remarks
  bgcolor: colors.primary[400],
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
  border: `1px solid ${colors.primary[500]}`,
});

export default DocumentUpdateModal;