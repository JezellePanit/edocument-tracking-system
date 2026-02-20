import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Modal, IconButton, Divider, Button, TextField, useTheme 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { tokens } from "../../theme";

const DocumentUpdateModal = ({ open, onClose, docData, onUpdate }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  // State for the admin remarks and status
  const [remarks, setRemarks] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // EFFECT: Handle Modal Open/Close logic
  useEffect(() => {
    if (open && docData) {
      // Use adminStatus as the source of truth for the buttons
      // Every received doc is "Pending" by default if adminStatus isn't set
      setSelectedStatus(docData.adminStatus || "Pending");
    } else if (!open) {
      // Clear inputs when the modal is closed to prevent ghost data
      setRemarks("");
      setSelectedStatus("");
    }
  }, [open, docData]);

  if (!docData) return null;

  const statuses = ["Pending", "In Review", "On Hold", "Completed", "Deferred", "Rejected"];

  const handleUpdateClick = () => {
    if (!selectedStatus) {
      alert("Please select a status first.");
      return;
    }
    // Update using the adminStatus field
    onUpdate(docData.id, selectedStatus, remarks);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 550, bgcolor: colors.primary[400],
          boxShadow: 24, p: 4, borderRadius: "8px",
          maxHeight: "90vh", overflowY: "auto",
          border: `1px solid ${colors.primary[500]}`,
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
            Update Status & Notify
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: colors.grey[100] }} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box display="flex" flexDirection="column" gap="20px">
          
          {/* TOP ROW: Document Info */}
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap="20px">
            <DetailItem label="Document ID" value={docData.documentId} colors={colors} />
            <DetailItem label="Current Admin Status" value={docData.adminStatus || "Pending"} colors={colors} />
          </Box>

          {/* STATUS SELECTION AREA */}
          <Box>
            <Typography variant="caption" color={colors.greenAccent[500]} sx={{ textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>
              Select New Status
            </Typography>
            <Box display="grid" gridTemplateColumns="1fr 1fr 1fr" gap="10px" mt="8px">
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
                    borderColor: colors.blueAccent[700],
                    "&:hover": { 
                      bgcolor: selectedStatus === status ? colors.blueAccent[800] : colors.primary[900],
                      borderColor: colors.blueAccent[500] 
                    }
                  }}
                >
                  {status}
                </Button>
              ))}
            </Box>
          </Box>

          {/* REMARKS INPUT */}
          <Box>
            <Typography variant="caption" color={colors.greenAccent[500]} sx={{ textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>
              Admin Remarks / Reply
            </Typography>
            <TextField
              id="admin-remarks-input"
              fullWidth
              multiline
              rows={4}
              variant="filled"
              placeholder="Explain the reason for this status update..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              sx={{
                mt: "8px",
                bgcolor: colors.primary[900],
                borderRadius: "4px",
                "& .MuiInputBase-root": { color: colors.grey[100] },
                "& .MuiFilledInput-underline:before": { borderBottom: "none" },
                "& .MuiFilledInput-root": {
                    backgroundColor: "transparent",
                    "&:hover": { backgroundColor: "transparent" },
                    "&.Mui-focused": { backgroundColor: "transparent" }
                }
              }}
            />
          </Box>

          {/* ACTION BUTTONS */}
          <Box display="flex" justifyContent="flex-end" gap="10px" mt={1}>
            <Button onClick={onClose} sx={{ color: colors.grey[100], fontWeight: "bold" }}>
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
                px: 4,
                "&:hover": { bgcolor: colors.blueAccent[600] }
              }}
            >
              Update & Send
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

const DetailItem = ({ label, value, colors }) => (
  <Box>
    <Typography variant="caption" color={colors.greenAccent[500]} sx={{ textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>
      {label}
    </Typography>
    <Typography variant="h5" color={colors.grey[100]} sx={{ mt: "2px", wordBreak: "break-word", lineHeight: 1.4 }}>
      {value || "None"}
    </Typography>
  </Box>
);

export default DocumentUpdateModal;