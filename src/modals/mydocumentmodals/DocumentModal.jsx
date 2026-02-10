import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, MenuItem, Typography, IconButton 
} from "@mui/material";

import { supabase } from "../../supabaseClient";
import { db, auth } from "../../firebaseConfig"; 
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import "./DocumentModal.css";

export const DocumentModal = ({ open, onClose, onDocumentAdded }) => {
  const [userDept, setUserDept] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    remarks: "",
    docType: "", 
    priority: "Normal",
  });
  const [files, setFiles] = useState([]); 
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({ title: "", description: "", remarks: "", docType: "", priority: "Normal" });
    setFiles([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatDeptName = (dept) => {
    if (!dept) return "Loading...";
    const names = {
      executive: "Executive Office",
      administrative: "Administrative Section",
      records: "Records Section",
      procurement: "Procurement",
      finance: "Finance",
      training: "Training Section",
      assessment: "Assessment Section",
      it: "IT / System Admin"
    };
    return names[dept] || dept.charAt(0).toUpperCase() + dept.slice(1);
  };

  useEffect(() => {
    const fetchUserDept = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserDept(userSnap.data().department.trim().toLowerCase());
        }
      }
    };
    if (open) fetchUserDept();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      const newFiles = [...files, ...selectedFiles];
      setFiles(newFiles);
      const extensions = newFiles.map(f => {
        const ext = f.name.split('.').pop().toLowerCase();
        return ext.charAt(0).toUpperCase() + ext.slice(1);
      });
      const uniqueExtensions = [...new Set(extensions)];
      setFormData(prev => ({ ...prev, docType: uniqueExtensions.join(", ") }));
    }
  };

  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    const extensions = updatedFiles.map(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ext.charAt(0).toUpperCase() + ext.slice(1);
    });
    const uniqueExtensions = [...new Set(extensions)];
    setFormData(prev => ({ ...prev, docType: uniqueExtensions.join(", ") }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const uploadedFileUrls = [];
      for (const file of files) {
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

        uploadedFileUrls.push({ name: file.name, url: publicUrl });
      }

      await addDoc(collection(db, "documents"), {
        ...formData,
        categoryName: "Uncategorized",
        originDepartment: userDept,
        ownerId: auth.currentUser.uid,
        submittedTo: "None",
        recipientId: "None",
        recipientName: "Not Assigned",
        files: uploadedFileUrls,
        status: "Draft",
        uploadDate: new Date().toLocaleDateString(),
        createdAt: new Date(),
      });

      setShowSuccess(true);
      onDocumentAdded();
      handleClose();
    } catch (error) {
      alert("Error saving documents: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle className="modal-header">
          Document Intake Form - {formatDeptName(userDept)}
        </DialogTitle>
      
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box className="modal-form-container" display="flex" flexDirection="column" gap={2}>
              
              <TextField 
                name="title" 
                label="Document Title" 
                fullWidth 
                required 
                value={formData.title} 
                onChange={handleChange} 
              />

              <TextField 
                name="description" 
                label="Description" 
                fullWidth 
                multiline 
                rows={2} 
                required 
                value={formData.description} 
                onChange={handleChange} 
              />

              <Box className="modal-row" display="flex" gap={2}>
                <TextField 
                  name="docType" 
                  label="Detected File Type(s)" 
                  fullWidth 
                  value={formData.docType} 
                  InputProps={{ readOnly: true }}
                  disabled 
                  sx={{ 
                    "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#555" },
                    "& .MuiInputLabel-root.Mui-disabled": { color: "rgba(0, 0, 0, 0.6)" }
                  }}
                  helperText="Auto-detected from files" 
                />
                <TextField select name="priority" label="Priority" fullWidth 
                  value={formData.priority} onChange={handleChange}>
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Normal">Normal</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                  <MenuItem value="Critical">Critical</MenuItem>
                </TextField>
              </Box>

              {/* Keep your design for attach documents exactly as it was */}
              <Box className="file-upload-section">
                <Button variant="outlined" component="label" fullWidth className="upload-button" startIcon={<CloudUploadIcon />}>
                  Attach Documents
                  <input type="file" hidden multiple onChange={handleFileChange} />
                </Button>

                {files.length > 0 && (
                  <Box sx={{ mt: 2, maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', p: 1, borderRadius: 1 }}>
                    {files.map((f, index) => (
                      <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" noWrap sx={{ maxWidth: '80%' }}>{f.name}</Typography>
                        <IconButton size="small" onClick={() => removeFile(index)} color="error">
                          <DeleteIcon fontSize="inherit" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading || files.length === 0} className="submit-btn">
              {loading ? "Processing..." : "Save Document"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog 
        open={showSuccess} 
        onClose={() => setShowSuccess(false)}
        PaperProps={{ style: { borderRadius: 15, padding: '10px' } }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Box 
            display="flex" justifyContent="center" alignItems="center" mb={2}
            sx={{ width: 60, height: 60, bgcolor: '#e8f5e9', borderRadius: '50%', margin: '0 auto 20px' }}
          >
            <Typography sx={{ fontSize: 40, color: '#4caf50' }}>✓</Typography>
          </Box>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Upload Successful!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Your document has been saved to your records.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button 
            variant="contained" 
            color="success" 
            onClick={() => setShowSuccess(false)}
            sx={{ px: 4, borderRadius: '8px' }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DocumentModal;