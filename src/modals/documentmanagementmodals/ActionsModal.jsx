import React from "react";
import { 
  Box, Typography, Modal, IconButton, Divider, List, ListItem, 
  ListItemIcon, ListItemText, useTheme 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from "@mui/icons-material/Delete";
import EditNoteIcon from '@mui/icons-material/EditNote'; 
import ReplyIcon from '@mui/icons-material/Reply';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import { tokens } from "../../theme";

const ActionsModal = ({ 
  open, 
  onClose, 
  docData, 
  onView,           // Triggers DocumentDetailModal
  onUpdateStatus,   // Triggers DocumentUpdateModal
  onRequest,        // Triggers DocumentRequestModal
  onReply,          // Triggers DocumentReplyModal
  onDelete          // Triggers DocumentDeleteModal
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (!docData) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle(colors)}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">Actions</Typography>
            <Typography variant="caption" color={colors.greenAccent[500]} sx={{ fontWeight: "bold" }}>
              DOC ID: {docData.documentId}
            </Typography>
          </Box>
          <IconButton onClick={onClose}><CloseIcon sx={{ color: colors.grey[100] }} /></IconButton>
        </Box>
        
        <Divider sx={{ mb: 2 }} />

        <List>
          {/* 1. VIEW DETAILS */}
          <ListItem button onClick={onView} sx={actionStyle(colors.primary[800])}>
            <ListItemIcon><VisibilityIcon sx={{ color: colors.blueAccent[100] }} /></ListItemIcon>
            <ListItemText primary="View Details" secondary="See full document info" />
          </ListItem>

          {/* 2. UPDATE STATUS */}
          <ListItem button onClick={onUpdateStatus} sx={actionStyle(colors.greenAccent[700])}>
            <ListItemIcon><SyncAltIcon sx={{ color: colors.greenAccent[300] }} /></ListItemIcon>
            <ListItemText primary="Update Status" secondary={`Current: ${docData.adminStatus || 'Pending'}`} />
          </ListItem>

          {/* 3. REQUEST REVISION */}
          <ListItem button onClick={onRequest} sx={actionStyle("#ef6c0033")}>
            <ListItemIcon><EditNoteIcon sx={{ color: "#ef6c00" }} /></ListItemIcon>
            <ListItemText primary="Request Revision" secondary="Ask user for corrections" />
          </ListItem>

          {/* 4. REPLY */}
          <ListItem button onClick={onReply} sx={actionStyle(colors.blueAccent[800])}>
            <ListItemIcon><ReplyIcon sx={{ color: colors.blueAccent[400] }} /></ListItemIcon>
            <ListItemText primary="Reply / Message" secondary="Send message to user" />
          </ListItem>

          <Divider sx={{ my: 1 }} />

          {/* 5. DELETE */}
          <ListItem button onClick={onDelete} sx={actionStyle(colors.redAccent[900])}>
            <ListItemIcon><DeleteIcon sx={{ color: colors.redAccent[500] }} /></ListItemIcon>
            <ListItemText primary="Delete Permanently" primaryTypographyProps={{ color: colors.redAccent[500], fontWeight: "bold" }} />
          </ListItem>
        </List>
      </Box>
    </Modal>
  );
};

// Styles to keep consistency with your basis
const modalStyle = (colors) => ({
  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
  width: 450, bgcolor: colors.primary[400], boxShadow: 24, p: 4, borderRadius: "8px",
  border: `1px solid ${colors.primary[500]}`,
});

const actionStyle = (hoverColor) => ({
  borderRadius: "8px", mb: 1, transition: "0.2s",
  "&:hover": { bgcolor: hoverColor }
});

export default ActionsModal;