import React, { useState } from "react";
import { Box, Typography, Modal, Button, IconButton, Divider, useTheme, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { tokens } from "../../theme";

// Import configurations
import { db } from "../../firebaseConfig";
import { supabase } from "../../supabaseClient";
import { doc, deleteDoc } from "firebase/firestore";

const DeleteConfirmModal = ({ open, onClose, docData, onConfirm }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);

const handleDelete = async () => {
  if (!docData) return;
  setLoading(true);

  try {
    // 1. Delete from Firestore FIRST
    // This triggers your onSnapshot in MyDocument to remove the row immediately
    const docId = docData.id;
    await deleteDoc(doc(db, "documents", docId));

    // 2. Trigger UI Cleanup immediately
    // We call these NOW so the modal closes while Supabase is still working
    onConfirm(); 
    onClose();

    // 3. Clean up Supabase in the background
    if (docData.files && docData.files.length > 0) {
      const filesToRemove = docData.files.map((file) => {
        const parts = file.url.split('/documents/');
        return parts[parts.length - 1]; 
      });

      console.log("Cleaning up storage for:", filesToRemove);

      const { error: storageError } = await supabase.storage
        .from('documents') 
        .remove(filesToRemove);

      if (storageError) {
        console.error("Supabase Storage Error (Background):", storageError.message);
      }
    }
    
    // NOTE: Removed the extra code here that was causing errors!

  } catch (error) {
    console.error("Error during deletion process:", error);
    alert("An error occurred while deleting.");
  } finally {
    // This is safe to leave here, but technically the modal is already closed
    setLoading(false);
  }
};

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400, bgcolor: colors.primary[400],
          boxShadow: 24, p: 4, borderRadius: "8px", textAlign: "center",
          border: `1px solid ${colors.redAccent[500]}`
        }}
      >
        <Box display="flex" justifyContent="flex-end">
          <IconButton onClick={onClose} disabled={loading}>
            <CloseIcon sx={{ color: colors.grey[100] }} />
          </IconButton>
        </Box>

        <DeleteForeverIcon sx={{ color: colors.redAccent[500], fontSize: "50px", mb: 2 }} />
        
        <Typography variant="h4" color={colors.grey[100]} fontWeight="bold" mb={2}>
          Delete Document?
        </Typography>
        
        <Typography variant="body1" color={colors.grey[100]} mb={3}>
          Are you sure you want to delete <strong>{docData?.title}</strong>? This action will permanently remove the files from storage.
        </Typography>

        <Divider sx={{ mb: 3 }} />

        <Box display="flex" justifyContent="center" gap="15px">
          <Button onClick={onClose} variant="outlined" disabled={loading} sx={{ color: colors.grey[100], borderColor: colors.grey[100] }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="contained" 
            disabled={loading}
            sx={{ backgroundColor: colors.redAccent[600], "&:hover": { backgroundColor: colors.redAccent[700] }, minWidth: "100px" }}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Yes, Delete"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default DeleteConfirmModal;