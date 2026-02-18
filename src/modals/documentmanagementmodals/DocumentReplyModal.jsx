import React, { useState } from "react";
import { Box, Typography, Modal, IconButton, Divider, Button, TextField, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { tokens } from "../../theme";

const DocumentReplyModal = ({ open, onClose, docData, onSendReply }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [message, setMessage] = useState("");

  if (!docData) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle(colors)}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">Send Reply</Typography>
          <IconButton onClick={onClose}><CloseIcon sx={{ color: colors.grey[100] }} /></IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Message to User"
          variant="filled"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ mb: 3, backgroundColor: colors.primary[500] }}
        />

        <Button 
          fullWidth 
          variant="contained" 
          sx={{ backgroundColor: colors.blueAccent[600] }}
          disabled={!message}
          onClick={() => {
            onSendReply(docData.id, docData.adminStatus, message);
            setMessage("");
            onClose();
          }}
        >
          Submit Message
        </Button>
      </Box>
    </Modal>
  );
};

const modalStyle = (colors) => ({
  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
  width: 450, bgcolor: colors.primary[400], boxShadow: 24, p: 4, borderRadius: "8px",
  border: `1px solid ${colors.primary[500]}`,
});

export default DocumentReplyModal;