import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Modal, IconButton, Divider, Button, TextField, MenuItem, useTheme, Chip, Stack 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";

import { supabase } from "../../supabaseClient"; // Using Supabase for Storage
import { db } from "../../firebaseConfig"; // Using Firebase for Firestore
import { doc, updateDoc } from "firebase/firestore";
import { tokens } from "../../theme";

const EditDocumentModal = ({ open, onClose, docData, onEditSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const [formData, setFormData] = useState({
    title: "",
    categoryName: "",
    description: "",
    priority: "Normal"
  });
  
  const [existingFiles, setExistingFiles] = useState([]); // Already in Supabase/Firestore
  const [newFiles, setNewFiles] = useState([]);         // Selected from local machine
  const [filesToDelete, setFilesToDelete] = useState([]);  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (docData && open) {
      setFormData({
        title: docData.title || "",
        categoryName: docData.categoryName || "",
        description: docData.description || "",
        priority: docData.priority || "Normal"
      });
      setExistingFiles(docData.files || []);
      setNewFiles([]);
      setFilesToDelete([]);
    }
  }, [docData, open]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setNewFiles([...newFiles, ...Array.from(e.target.files)]);
    }
  };

// Handle removing a file from the UI and queueing it for Supabase deletion
  const removeExistingFile = (indexToRemove) => {
    const fileTarget = existingFiles[indexToRemove];
    setFilesToDelete([...filesToDelete, fileTarget]); // Add to deletion queue
    setExistingFiles(existingFiles.filter((_, index) => index !== indexToRemove));
  };

  const removeNewFile = (indexToRemove) => {
    setNewFiles(newFiles.filter((_, index) => index !== indexToRemove));
  };

const handleUpdate = async (e) => {
    e.preventDefault();
    
    // --- VALIDATION: Ensure at least one file exists ---
    if (existingFiles.length === 0 && newFiles.length === 0) {
      alert("Validation Error: A document must have at least one attachment. Please upload a file before saving.");
      return;
    }

    setLoading(true);

    try {
      // 1. PHYSICAL DELETION from Supabase Storage
      if (filesToDelete.length > 0) {
        const pathsToRemove = filesToDelete.map((file) => {
          const parts = file.url.split('/documents/');
          return parts[parts.length - 1];
        });

        const { error: deleteError } = await supabase.storage
          .from('documents')
          .remove(pathsToRemove);

        if (deleteError) {
          console.error("Error deleting old files from Supabase:", deleteError.message);
          // We continue anyway to update Firestore, or you can throw error here
        } else {
          console.log("Successfully removed files from storage:", pathsToRemove);
        }
      }

      const finalFileUrls = [...existingFiles];

      // 2. Upload NEW files to SUPABASE Storage (as you already had)
      for (const file of newFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('documents') 
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        finalFileUrls.push({ name: file.name, url: publicUrl });
      }

      // 3. Update docType tags
      const extensions = finalFileUrls.map(f => {
        const ext = f.name.split('.').pop().toLowerCase();
        return ext.charAt(0).toUpperCase() + ext.slice(1);
      });
      const uniqueExtensions = [...new Set(extensions)].join(", ");

      // 4. Update FIREBASE Firestore
      const docRef = doc(db, "documents", docData.id);
      await updateDoc(docRef, {
        ...formData,
        files: finalFileUrls,
        docType: uniqueExtensions,
        lastEditedAt: new Date()
      });

      onEditSuccess();
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Error updating document: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!docData) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 550,
          bgcolor: colors.primary[400],
          boxShadow: 24,
          p: 4,
          borderRadius: "8px",
          maxHeight: "90vh",
          overflowY: "auto",
          border: `1px solid ${colors.primary[500]}`,
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
            Edit Document
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: colors.grey[100] }} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <form onSubmit={handleUpdate}>
          <Box display="flex" flexDirection="column" gap="20px">
            
            <TextField name="title" label="Document Title" fullWidth required value={formData.title} onChange={handleChange} />

            <TextField name="categoryName" label="Category" fullWidth required value={formData.categoryName} onChange={handleChange} />

            <TextField name="description" label="Description" fullWidth multiline rows={2} required value={formData.description} onChange={handleChange} />

            <TextField select name="priority" label="Priority" fullWidth value={formData.priority} onChange={handleChange}>
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Normal">Normal</MenuItem>
              <MenuItem value="Urgent">Urgent</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </TextField>

            {/* ATTACHMENTS SECTION */}
            <Box sx={{ bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", p: 2, borderRadius: "4px" }}>
              <Typography variant="h6" color={colors.greenAccent[400]} mb={1.5} fontWeight="bold">
                Manage Attachments
              </Typography>
              
              {/* Existing Files (Solid blue) */}
              {existingFiles.length > 0 && (
                 <Box mb={2}>
                    <Typography variant="caption" color={colors.grey[300]}>CURRENT FILES</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1}>
                        {existingFiles.map((file, index) => (
                        <Chip
                            key={index}
                            label={file.name}
                            onDelete={() => removeExistingFile(index)}
                            deleteIcon={<DeleteIcon />}
                            sx={{ bgcolor: colors.blueAccent[700], color: colors.grey[100] }}
                        />
                        ))}
                    </Stack>
                 </Box>
              )}

              {/* New Files (Outlined green) */}
              {newFiles.length > 0 && (
                <Box mb={2}>
                    <Typography variant="caption" color={colors.greenAccent[500]}>NEW FILES TO ADD</Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mt={1}>
                        {newFiles.map((file, index) => (
                        <Chip
                            key={index}
                            label={file.name}
                            variant="outlined"
                            onDelete={() => removeNewFile(index)}
                            sx={{ color: colors.greenAccent[400], borderColor: colors.greenAccent[400] }}
                        />
                        ))}
                    </Stack>
                </Box>
              )}

              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<AttachFileIcon />}
                sx={{ color: colors.grey[100], borderColor: colors.grey[400], mt: 1 }}
              >
                Add Additional Files
                <input type="file" hidden multiple onChange={handleFileChange} />
              </Button>
            </Box>

            {/* Actions */}
            <Box display="flex" justifyContent="flex-end" gap="10px" mt={2}>
              <Button onClick={onClose} sx={{ color: colors.grey[100] }}>Cancel</Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading || (existingFiles.length === 0 && newFiles.length === 0)}
                sx={{
                  backgroundColor: colors.greenAccent[600],
                  color: colors.grey[100],
                  "&:hover": { backgroundColor: colors.greenAccent[700] },
                  padding: "10px 20px"
                }}
              >
                {loading ? "Saving..." : "Update Document"}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

export default EditDocumentModal;