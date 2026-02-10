import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Modal, IconButton, Divider, Button, TextField, MenuItem, useTheme 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from '@mui/icons-material/Send';
import { tokens } from "../../theme";
import { db } from "../../firebaseConfig";
// Added arrayUnion to imports
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth } from "../../firebaseConfig";

const DEPARTMENT_NAMES = {
  executive: "Executive Office",
  administrative: "Administrative Section",
  records: "Records Section",
  procurement: "Procurement",
  finance: "Finance",
  training: "Training Section",
  assessment: "Assessment Section",
  it: "IT / System Admin"
};

const DEPARTMENT_CATEGORIES = {
  executive: ["Executive Communications", "Approved Reports", "Policy & Directives", "For Approval Documents", "Memoranda and Directives", "Signed Inspection Reports", "Special Requests & Complaints"],
  records: ["Incoming Client Documents", "Certificate Claim Requests", "SPA & Authorization Files", "Document Logs & Tracking", "Learner’s Profile Forms (MIS 03-01)", "Transmittal Records"],
  administrative: ["Administrative Documents", "QMS Forms", "Internal Requests", "Circulars & Advisories", "Attendance and Activity Reports"],
  procurement: ["Procurement Requests (PR)", "Purchase Orders (PO)", "Request for Quotation (RFQ)", "Supplier & Bidding Documents", "Inspection & Acceptance Files (IAR)", "BAC-related Files"],
  finance: ["Financial Documents", "Scholarship Disbursements", "Budget & Liquidation Reports", "Obligation Request and Status (ORS)", "Disbursement Vouchers (DV)", "Payroll-related Files"],
  training: ["Training Documents", "Trainee Records", "Scholarship Applications", "Training Plans & Reports", "Training Regulations (TRs)", "Competency-Based Curriculum (CBC)"],
  assessment: ["Assessment Applications", "Certification Documents", "Assessment Results", "Certified Worker Records", "National Certificate (NC)", "Registry of Certified Workers"],
  it: ["System Administration", "User Access Management", "Audit Logs", "Data Privacy & Security", "System Backup Reports", "Incident and Maintenance Reports"]
};

const ForwardDocumentModal = ({ open, onClose, docData, onForwardSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const currentUser = auth.currentUser;
  
  const [targetDept, setTargetDept] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [deptUsers, setDeptUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); // New Success State

  // --- 1. RESET LOGIC ---
  const resetForm = () => {
    setTargetDept("");
    setTargetUser("");
    setSelectedCategory("");
    setCustomCategory("");
    setDeptUsers([]);
    setIsSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, docData]);

  // --- 2. USER FETCHING LOGIC ---
  useEffect(() => {
    const fetchUsers = async () => {
      if (!targetDept) return setDeptUsers([]);
      try {
        const q = query(
          collection(db, "users"), 
          where("department", "in", [targetDept, DEPARTMENT_NAMES[targetDept]])
        );
        const snap = await getDocs(q);
        
        // FILTER: Remove the current user from the list
        const usersList = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(user => user.uid !== currentUser?.uid && user.id !== currentUser?.uid); 
          
        setDeptUsers(usersList);
      } catch (err) { 
        console.error("Error fetching users:", err); 
      }
    };
    if (open && targetDept) fetchUsers();
  }, [targetDept, open, currentUser]);

  // --- 3. FORWARDING LOGIC ---
  const handleForward = async () => {
    // Extra safety check
    if (targetUser === currentUser?.uid) {
      alert("You cannot forward a document to yourself.");
      return;
    }

    // Determine the final category string
    const finalCategory = selectedCategory === "Others" ? customCategory : selectedCategory;

    if (!targetUser || !docData || !finalCategory) {
        alert("Please complete all fields.");
        return;
    }

    setLoading(true);
    try {
      const selectedUserObj = deptUsers.find(u => u.id === targetUser || u.uid === targetUser);
      const docRef = doc(db, "documents", docData.id);
      const emailToSave = selectedUserObj?.email || "Unknown Email";
      const timestamp = new Date();

      await updateDoc(docRef, {
        categoryName: finalCategory, // Saves either the selection or the custom text
        submittedTo: DEPARTMENT_NAMES[targetDept] || targetDept, 
        recipientId: targetUser,  
        recipientName: emailToSave,
        status: "Sent",           
        lastForwardedAt: timestamp,
        // CHECKED: History array logic using arrayUnion
        forwardingHistory: arrayUnion({
          recipientName: emailToSave,
          submittedTo: DEPARTMENT_NAMES[targetDept] || targetDept,
          lastForwardedAt: timestamp
        })
      });

      setIsSuccess(true); // Trigger success view
      onForwardSuccess(); 

    } catch (error) {
      console.error("Forwarding Error:", error);
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!docData) return null;

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400, bgcolor: colors.primary[400],
          boxShadow: 24, p: 4, borderRadius: "8px",
          border: `1px solid ${colors.primary[500]}`
        }}
      >
        {/* SUCCESS VIEW */}
        {isSuccess ? (
          /* SUCCESS VIEW - COPIED DESIGN FROM DOCUMENTMODAL */
          <Box sx={{ textAlign: 'center', py: 2  }}>
            <Box 
              display="flex" justifyContent="center" alignItems="center" mb={2}
              sx={{ 
                width: 60, height: 60, bgcolor: '#e8f5e9', 
                borderRadius: '50%', margin: '0 auto 20px' 
              }}
            >
              <Typography sx={{ fontSize: 40, color: '#4caf50' }}>✓</Typography>
            </Box>
            
            <Typography variant="h5" fontWeight="bold" gutterBottom color={colors.grey[100]}>
              Forward Successful!
            </Typography>
            
            <Typography variant="body1" color={colors.grey[300]} mb={4}>
              The document has been forwarded to <strong>{targetDept}</strong>.
            </Typography>

            <Box display="flex" justifyContent="center">
                <Button 
                    variant="contained" 
                    color="success" 
                    onClick={handleClose}
                    sx={{ px: 4, borderRadius: '8px', fontWeight: 'bold' }}
                >
                    Done
                </Button>
            </Box>
          </Box>
        ) : (
          /* STANDARD FORM VIEW */
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">Forward Document</Typography>
              <IconButton onClick={handleClose}><CloseIcon sx={{ color: colors.grey[100] }} /></IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box display="flex" flexDirection="column" gap="20px">
              <Typography variant="h6" color={colors.greenAccent[400]}>
                Forwarding: <strong>{docData.title}</strong>
              </Typography>

              {/* 1. Department Selection */}
              <TextField 
                select label="Target Department" fullWidth required
                value={targetDept} 
                onChange={(e) => { 
                    setTargetDept(e.target.value); 
                    setTargetUser(""); 
                    setSelectedCategory(""); 
                    setCustomCategory("");
                }}
                sx={{ "& .MuiInputLabel-root": { color: colors.grey[500] } }}
              >
                {Object.keys(DEPARTMENT_NAMES).map((key) => (
                  <MenuItem key={key} value={key}>{DEPARTMENT_NAMES[key]}</MenuItem>
                ))}
              </TextField>

              {/* 2. Recipient Selection */}
              {targetDept && (
                <TextField 
                  select 
                  label={deptUsers.length === 0 ? "No users in this department" : "Select Recipient"}
                  fullWidth required disabled={deptUsers.length === 0}
                  value={targetUser} 
                  onChange={(e) => setTargetUser(e.target.value)}
                  sx={{ "& .MuiInputLabel-root": { color: colors.grey[500] } }}
                >
                  {deptUsers.map((user) => (
                    <MenuItem key={user.id} value={user.uid || user.id}>
                      {user.email}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {/* 3. Category Selection */}
              {targetDept && (
                <>
                  <TextField 
                    select label="Select Category" fullWidth required
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    sx={{ "& .MuiInputLabel-root": { color: colors.grey[500] } }}
                  >
                    {(DEPARTMENT_CATEGORIES[targetDept] || []).map((cat) => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                    {/* ADDED OTHERS OPTION */}
                    <MenuItem value="Others"><em>Others (Please specify)</em></MenuItem>
                  </TextField>

                  {/* 4. Custom Category Input (Visible only when "Others" is selected) */}
                  {selectedCategory === "Others" && (
                    <TextField
                      label="Specify Category"
                      fullWidth
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category name"
                      sx={{ mt: -1 }}
                    />
                  )}
                </>
              )}

              <Box display="flex" justifyContent="flex-end" gap="10px" mt={2}>
                <Button onClick={handleClose} sx={{ color: colors.grey[100] }}>Cancel</Button>
                <Button 
                  variant="contained" startIcon={<SendIcon />} 
                  disabled={
                    !targetUser || 
                    !selectedCategory || 
                    (selectedCategory === "Others" && !customCategory) || 
                    loading
                  }
                  onClick={handleForward}
                  sx={{ backgroundColor: colors.blueAccent[700], color: colors.grey[100], padding: "10px 20px" }}
                >
                  {loading ? "Forwarding..." : "Confirm Forward"}
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Modal>
  );
};

export default ForwardDocumentModal;