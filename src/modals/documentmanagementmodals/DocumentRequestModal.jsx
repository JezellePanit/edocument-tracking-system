import React, { useState } from "react";
import { Box, Typography, Modal, IconButton, Divider, Button, TextField, useTheme } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { tokens } from "../../theme";

const DocumentRequestModal = ({ open, onClose, docData, onSendRequest }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [remark, setRemark] = useState("");

  if (!docData) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle(colors)}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">Request Revision</Typography>
          <IconButton onClick={onClose}><CloseIcon sx={{ color: colors.grey[100] }} /></IconButton>
        </Box>
        <Divider sx={{ mb: 3 }} />

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Instructions for the user"
          variant="filled"
          placeholder="Describe what needs to be changed..."
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          sx={{ mb: 3, backgroundColor: colors.primary[500] }}
        />

        <Button 
          fullWidth 
          variant="contained" 
          color="secondary" 
          disabled={!remark}
          onClick={() => {
            onSendRequest(docData.id, "Action Required", remark);
            setRemark("");
            onClose();
          }}
        >
          Send to User
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

export default DocumentRequestModal;