import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, MenuItem, Typography, IconButton 
} from "@mui/material";
import { db, auth } from "../../firebaseConfig"; 
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import "./DocumentModal.css";

const DEPARTMENT_CATEGORIES = {
  "executive": ["Executive Communications", "Approved Reports", "Policy & Directives", "For Approval Documents"],
  "records": ["Incoming Client Documents", "Certificate Claim Requests", "SPA & Authorization Files", "Document Logs & Tracking"],
  "administrative": ["Administrative Documents", "QMS Forms", "Internal Requests", "Circulars & Advisories"],
  "procurement": ["Procurement Requests", "Supplier & Bidding Documents", "Inspection & Acceptance Files"],
  "finance": ["Financial Documents", "Scholarship Disbursements", "Budget & Liquidation Reports"],
  "training": ["Training Documents", "Trainee Records", "Scholarship Applications", "Training Plans & Reports"],
  "assessment": ["Assessment Applications", "Certification Documents", "Assessment Results", "Certified Worker Records"],
  "it": ["System Administration", "User Access Management", "Audit Logs", "Data Privacy & Security"]
};

const DocumentModal = ({ open, onClose, onDocumentAdded }) => {
  const [userDept, setUserDept] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [targetDept, setTargetDept] = useState(""); 
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  
  const [formData, setFormData] = useState({
    title: "", // Added title for the Document list
    categoryName: "",
    description: "",
    remarks: "",
    docType: "", 
    priority: "Normal",
  });
  const [files, setFiles] = useState([]); 
  const [loading, setLoading] = useState(false);

  // Helper to format the department for the header
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
          const dept = userSnap.data().department.trim().toLowerCase();
          setUserDept(dept);
          setAvailableCategories(DEPARTMENT_CATEGORIES[dept] || []);
        }
      }
    };
    if (open) fetchUserDept();
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "categoryName") setIsOtherCategory(value === "Other");
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

  // CONNECT TO FIREBASE AND UPLOAD FILES & DATA
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const storage = getStorage();
      const uploadedFileUrls = [];

      // 1. Upload each file to Firebase Storage
      for (const file of files) {
        const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedFileUrls.push({
          name: file.name,
          url: downloadURL
        });
      }

      const finalCategory = isOtherCategory ? customCategory : formData.categoryName;
      
      // Save to 'documents' collection instead of 'categories'
      await addDoc(collection(db, "documents"), {
        ...formData,
        categoryName: finalCategory,
        originDepartment: userDept,
        submittedTo: targetDept,
        files: uploadedFileUrls, 
        uploadDate: new Date().toLocaleDateString(),
        createdAt: new Date(),
      });

      onDocumentAdded();
      setFormData({ title: "", categoryName: "", description: "", remarks: "", docType: "", priority: "Normal" });
      setTargetDept("");
      setFiles([]);
      setIsOtherCategory(false);
      setCustomCategory("");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error saving documents.");
    } finally {
      setLoading(false);
    }
  };

  //FIRESTORE (Preserved your original commented logic below)
/* const handleSubmitOriginal = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const storage = getStorage(); // Initialize storage
    const uploadedFileUrls = [];

    // 1. Upload each file to Firebase Storage
    for (const file of files) {
      // Create a unique path for the file: documents/TIMESTAMP_FILENAME
      const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the public download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      uploadedFileUrls.push({
        name: file.name,
        url: downloadURL
      });
    }

    // 2. Save the metadata and the URLs to Firestore
    const finalCategory = isOtherCategory ? customCategory : formData.categoryName;
    
    await addDoc(collection(db, "categories"), {
      ...formData,
      categoryName: finalCategory,
      originDepartment: userDept,
      submittedTo: targetDept,
      files: uploadedFileUrls, // This now contains the actual links to the files!
      count: files.length,
      createdAt: new Date(),
    });

    // 3. Reset and Close
    alert("Documents uploaded and submitted successfully!");
    onCategoryAdded();
    setFormData({ categoryName: "", description: "", remarks: "", docType: "", priority: "Normal" });
    setTargetDept("");
    setFiles([]);
    onClose();

  } catch (error) {
    console.error("Upload error:", error);
    alert("Error uploading files: " + error.message);
  } finally {
    setLoading(false);
  }
};
*/

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
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
            select 
            label="Submit To (Target Department)" 
            fullWidth 
            required
            value={targetDept} 
            onChange={(e) => setTargetDept(e.target.value)}
            >
            {Object.keys(DEPARTMENT_CATEGORIES)
                .filter((key) => key !== userDept) 
                .map((key) => (
                <MenuItem key={key} value={key}>
                    {formatDeptName(key)}
                </MenuItem>
                ))
            }
            </TextField>

            <TextField select name="categoryName" label="Category" fullWidth required
              value={formData.categoryName} onChange={handleChange}>
              {availableCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
              <MenuItem value="Other"><em>Other (Specify...)</em></MenuItem>
            </TextField>

            {isOtherCategory && (
              <TextField label="Specify Category" fullWidth required sx={{ mt: 1 }}
                value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
            )}
            
            <TextField name="description" label="Description" fullWidth multiline rows={2} required 
              value={formData.description} onChange={handleChange} />

            <Box className="modal-row" display="flex" gap={2}>
            <TextField 
                name="docType" 
                label="Detected File Type(s)" 
                fullWidth 
                value={formData.docType} 
                InputProps={{ readOnly: true }}
                disabled 
                sx={{ 
                "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#555",
                },
                "& .MuiInputLabel-root.Mui-disabled": {
                    color: "rgba(0, 0, 0, 0.6)"
                }
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
          <Button onClick={onClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading || files.length === 0 || !targetDept} className="submit-btn">
            {loading ? "Processing..." : `Submit to ${targetDept.toUpperCase() || '...'}`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DocumentModal;