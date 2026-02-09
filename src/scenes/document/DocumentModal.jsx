import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, MenuItem, Typography, IconButton 
} from "@mui/material";

import { supabase } from "../../supabaseClient";
import { db, auth } from "../../firebaseConfig"; 
import { collection, addDoc, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import "./DocumentModal.css";

// UPDATED: Categories based on your specific department requirements
const DEPARTMENT_CATEGORIES = {
  "executive": [
    "Executive Communications", "Approved Reports", "Policy & Directives", 
    "For Approval Documents", "Memoranda and Directives", "Signed Inspection Reports",
    "Special Requests & Complaints"
  ],
  "records": [
    "Incoming Client Documents", "Certificate Claim Requests", "SPA & Authorization Files", 
    "Document Logs & Tracking", "Learner’s Profile Forms (MIS 03-01)", "Transmittal Records"
  ],
  "administrative": [
    "Administrative Documents", "QMS Forms", "Internal Requests", 
    "Circulars & Advisories", "Attendance and Activity Reports"
  ],
  "procurement": [
    "Procurement Requests (PR)", "Purchase Orders (PO)", "Request for Quotation (RFQ)", 
    "Supplier & Bidding Documents", "Inspection & Acceptance Files (IAR)", "BAC-related Files"
  ],
  "finance": [
    "Financial Documents", "Scholarship Disbursements", "Budget & Liquidation Reports",
    "Obligation Request and Status (ORS)", "Disbursement Vouchers (DV)", "Payroll-related Files"
  ],
  "training": [
    "Training Documents", "Trainee Records", "Scholarship Applications", 
    "Training Plans & Reports", "Training Regulations (TRs)", "Competency-Based Curriculum (CBC)"
  ],
  "assessment": [
    "Assessment Applications", "Certification Documents", "Assessment Results", 
    "Certified Worker Records", "National Certificate (NC)", "Registry of Certified Workers"
  ],
  "it": [
    "System Administration", "User Access Management", "Audit Logs", 
    "Data Privacy & Security", "System Backup Reports", "Incident and Maintenance Reports"
  ]
};

const DocumentModal = ({ open, onClose, onDocumentAdded }) => {
  const [targetUser, setTargetUser] = useState(""); 
  const [deptUsers, setDeptUsers] = useState([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [userDept, setUserDept] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [targetDept, setTargetDept] = useState(""); 
  const [isOtherCategory, setIsOtherCategory] = useState(false);
  const [customCategory, setCustomCategory] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedRecipient, setSubmittedRecipient] = useState("");
  
  const [formData, setFormData] = useState({
    title: "",
    categoryName: "",
    description: "",
    remarks: "",
    docType: "", 
    priority: "Normal",
  });
  const [files, setFiles] = useState([]); 
  const [loading, setLoading] = useState(false);

  // --- NEW: Reset Function ---
  const resetForm = () => {
    setFormData({ title: "", categoryName: "", description: "", remarks: "", docType: "", priority: "Normal" });
    setTargetDept("");
    setTargetUser("");
    setFiles([]);
    setIsOtherCategory(false);
    setCustomCategory("");
    setAvailableCategories([]);
    setDeptUsers([]);
  };

  // --- NEW: Wrapper for closing the modal ---
  const handleClose = () => {
    resetForm();
    onClose(); // This calls the parent's closing function
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

  // 1. Fetch the SENDER'S department only (to exclude it from the "Submit To" list)
  useEffect(() => {
    const fetchUserDept = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const dept = userSnap.data().department.trim().toLowerCase();
          setUserDept(dept);
        }
      }
    };
    if (open) fetchUserDept();
  }, [open]);

// 2. TRIGGER CATEGORY CHANGE when targetDept changes
  const handleTargetDeptChange = (e) => {
    const selectedDept = e.target.value;
    setTargetDept(selectedDept);
    setTargetUser(""); // Reset recipient
    
    // This is the fix: Update categories based on the RECIPIENT department
    setAvailableCategories(DEPARTMENT_CATEGORIES[selectedDept] || []);
    
    // Reset category selection in form data so they don't submit a category 
    // from a previously selected department
    setFormData(prev => ({ ...prev, categoryName: "" })); 
    setIsOtherCategory(false);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedFileUrls = [];

      // 1. Upload each file to SUPABASE Storage
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `documents/${fileName}`;

        // Upload the file to the 'documents' bucket
        const { error: uploadError } = await supabase.storage
          .from('documents') 
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL for the uploaded file
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath);

        uploadedFileUrls.push({
          name: file.name,
          url: publicUrl
        });
      }

      // 2. Identify the specific recipient
      const selectedUserObj = deptUsers.find(u => (u.uid || u.id) === targetUser);
      const finalCategory = isOtherCategory ? customCategory : formData.categoryName;

      // 3. Save metadata to FIREBASE Firestore
      await addDoc(collection(db, "documents"), {
        ...formData,
        categoryName: finalCategory,
        originDepartment: userDept,
        submittedTo: targetDept,          // e.g., "executive"
        recipientId: targetUser,          // e.g., "Anne_UID_123"
        recipientName: selectedUserObj?.username || "Unknown",
        files: uploadedFileUrls,          // Array of Supabase URLs
        status: "Pending",
        uploadDate: new Date().toLocaleDateString(),
        createdAt: new Date(),
      });

      // 4. Success and Cleanup
      setSubmittedRecipient(selectedUserObj?.email || formatDeptName(targetDept));
      setShowSuccess(true);
      
      // Reset states
      onDocumentAdded();
      handleClose(); // Resets and Closes

    } catch (error) {
      console.error("Upload failed:", error.message);
      alert("Error saving documents: " + error.message);
    } finally {
      setLoading(false);
    }
  };

// Fetch users within the target department
  useEffect(() => {
    const fetchDeptUsers = async () => {
      if (!targetDept) return setDeptUsers([]);
      setFetchingUsers(true);
      try {
        const q = query(collection(db, "users"), where("department", "in", [targetDept, formatDeptName(targetDept)]));
        const snap = await getDocs(q);
        setDeptUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error(error);
      } finally {
        setFetchingUsers(false);
      }
    };
    fetchDeptUsers();
  }, [targetDept]);

return (
    <>
      {/* 1. MAIN INTAKE FORM DIALOG */}
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

          {/* Target Department Selection */}
          <TextField 
            select 
            label="Submit To (Target Department)" 
            fullWidth 
            required
            value={targetDept} 
            onChange={handleTargetDeptChange} // Call the new handler here
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
      
          {/* NEW: Specific User Selection (Recipient) */}
          {targetDept && (
            <TextField
              select
              label={fetchingUsers ? "Loading Staff..." : `Select Recipient in ${formatDeptName(targetDept)}`}
              fullWidth
              required
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              disabled={fetchingUsers || deptUsers.length === 0}
              helperText={deptUsers.length === 0 && !fetchingUsers ? "No users found in this department" : ""}
            >
              {deptUsers.map((user) => (
                <MenuItem key={user.id} value={user.uid || user.id}>
                  {user.email} {user.role ? `(${user.role})` : ""}
                </MenuItem>
              ))}
            </TextField>
          )}

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
          <Button onClick={handleClose} color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading || files.length === 0 || !targetDept} className="submit-btn">
            {loading ? "Processing..." : `Submit to ${targetDept.toUpperCase() || '...'}`}
          </Button>
        </DialogActions>
      </form>
    </Dialog>

{/* 2. CUSTOM SUCCESS MODAL (Moved outside the first Dialog) */}
      <Dialog 
        open={showSuccess} 
        onClose={() => {
          setShowSuccess(false);
          // Note: onClose() was already called in handleSubmit, 
          // but we keep it here as a safety measure.
        }}
        PaperProps={{
          style: { borderRadius: 15, padding: '10px' }
        }}
      >
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            mb={2}
            sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: '#e8f5e9', 
              borderRadius: '50%', 
              margin: '0 auto 20px' 
            }}
          >
            <Typography sx={{ fontSize: 40, color: '#4caf50' }}>✓</Typography>
          </Box>
          
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Submission Successful!
          </Typography>
          
          <Typography variant="body1" color="textSecondary">
            Your document has been sent to: <br />
            <strong>{submittedRecipient}</strong>
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