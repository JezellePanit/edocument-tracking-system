import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Modal, IconButton, Divider, Button, TextField, useTheme, Stack 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditNoteIcon from '@mui/icons-material/EditNote';
import { tokens } from "../../theme";

const DocumentRequestModal = ({ open, onClose, docData, onRequest }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!open) {
      setRemarks(""); // Clear input on close
    }
  }, [open]);

  if (!docData) return null;

  const handleRequestClick = () => {
    if (!remarks.trim()) {
      alert("Please provide instructions for the revision.");
      return;
    }
    // Triggers the request revision logic
    onRequest(docData.id, remarks);
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
          <Box display="flex" alignItems="center" gap="10px">
            <EditNoteIcon sx={{ color: "#ef6c00", fontSize: "28px" }} />
            <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
              Request Revision
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: colors.grey[100] }} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          {/* Document Context */}
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap="20px">
            <DetailItem label="Document ID" value={docData.documentId} colors={colors} />
            <DetailItem label="Document Title" value={docData.title} colors={colors} />
          </Box>

          <Box sx={{ p: 2, bgcolor: "rgba(239, 108, 0, 0.1)", borderRadius: "4px", borderLeft: "4px solid #ef6c00" }}>
             <Typography variant="body2" color={colors.grey[100]}>
               You are requesting the sender to modify or re-upload this document. Please specify exactly what needs to be changed below.
             </Typography>
          </Box>

          {/* REVISION INSTRUCTIONS */}
          <Box>
            <Typography variant="caption" color={colors.greenAccent[500]} sx={{ textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>
              Revision Instructions / Remarks
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              variant="filled"
              placeholder="e.g., 'Please re-scan page 3, the text is blurry' or 'Missing authorized signature'..."
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
          <Box display="flex" justifyContent="flex-end" gap="10px">
            <Button onClick={onClose} sx={{ color: colors.grey[100], fontWeight: "bold" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleRequestClick}
              sx={{
                backgroundColor: "#ef6c00",
                color: "#fff",
                fontWeight: "bold",
                px: 4,
                "&:hover": { bgcolor: "#e65100" }
              }}
            >
              Send Request
            </Button>
          </Box>
        </Stack>
      </Box>
    </Modal>
  );
};

// Helper component to keep it clean
const DetailItem = ({ label, value, colors }) => (
  <Box>
    <Typography variant="caption" color={colors.greenAccent[500]} sx={{ textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>
      {label}
    </Typography>
    <Typography variant="h5" color={colors.grey[100]} sx={{ mt: "2px", wordBreak: "break-word", lineHeight: 1.4 }}>
      {value || "N/A"}
    </Typography>
  </Box>
);

export default DocumentRequestModal;