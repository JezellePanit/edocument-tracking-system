import React, { useState, useEffect } from "react";
import { 
  Box, Typography, Modal, IconButton, Divider, Button, TextField, MenuItem, useTheme 
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from '@mui/icons-material/Send';
import { tokens } from "../../theme";
import { db } from "../../firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth } from "../../firebaseConfig";

const DEPARTMENT_NAMES = {
  hr: "Human Resource",
};

const DEPARTMENT_CATEGORIES = {
  hr: [
    "Personal Records/ PDS",
    "Employment Records",
    "Leave Documents",
    "Medical Certificates",
    "Memorandums",
    "Contracts (COS/JO)",
    "Training & Certifications",
    "Performance Evaluation Forms",
    "Appointment Papers",
    "Separation Documents",
    "Clearance & Separation"
  ]
};

const ForwardDocumentModal = ({ open, onClose, docData, onForwardSuccess }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const currentUser = auth.currentUser;
  
  const [targetDept] = useState("hr"); 
  const [targetUser, setTargetUser] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [remarks, setRemarks] = useState("");
  const [deptUsers, setDeptUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false); 

  const resetForm = () => {
    setTargetUser("");
    setRecipientEmail("");
    setSelectedCategory("");
    setCustomCategory("");
    setRemarks("");
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

  // Fetch only Admin users (HR)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(
          collection(db, "users"), 
          where("role", "==", "admin") 
        );
        const snap = await getDocs(q);
        
        const usersList = snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(user => user.uid !== currentUser?.uid && user.id !== currentUser?.uid); 
          
        setDeptUsers(usersList);
      } catch (err) { 
        console.error("Error fetching users:", err); 
      }
    };
    if (open) fetchUsers();
  }, [open, currentUser]);

  const handleForward = async () => {
    if (targetUser === currentUser?.uid) {
      alert("You cannot forward a document to yourself.");
      return;
    }

    const finalCategory = selectedCategory === "Others" ? customCategory : selectedCategory;

    if (!targetUser || !docData || !finalCategory) {
        alert("Please complete all fields.");
        return;
    }

  setLoading(true);
  try {
    // --- NEW LOGIC: FETCH SENDER'S DEPARTMENT ---
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDocSnap = await getDoc(userDocRef);
    
    let senderDept = "N/A"; // Default if not found
    let senderUsername = currentUser.displayName || "Unknown User";
    
    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      senderDept = userData.department || "General";
      // This checks common variations of the username field
      senderUsername = userData.username || userData.userName || userData.fullName || currentUser.displayName || "User";
    }
    // --------------------------------------------

    const selectedUserObj = deptUsers.find(u => u.id === targetUser || u.uid === targetUser);
    const docRef = doc(db, "documents", docData.id);
    const emailToSave = selectedUserObj?.email || "Unknown Email";

    setRecipientEmail(emailToSave);
    const timestamp = new Date();

    await updateDoc(docRef, {
      categoryName: finalCategory,
      submittedTo: DEPARTMENT_NAMES[targetDept], 
      recipientId: targetUser,  
      recipientName: emailToSave,
      senderId: currentUser.uid, 
      senderEmail: currentUser.email,
      username: senderUsername,
      senderDepartment: senderDept, // This now has a value!
      status: "Sent",
      lastForwardedAt: timestamp,
      remarks: remarks,
      forwardingHistory: arrayUnion({
        recipientName: emailToSave,
        submittedTo: DEPARTMENT_NAMES[targetDept],
        lastForwardedAt: timestamp,
        remarks: remarks,
        senderEmail: currentUser.email,
        senderUsername: senderUsername,
        senderDepartment: senderDept // Also good to keep in history
      })
    });

    setIsSuccess(true); 
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
          width: 450, bgcolor: colors.primary[400],
          boxShadow: 24, p: 4, borderRadius: "8px",
          border: `1px solid ${colors.primary[500]}`
        }}
      >
        {isSuccess ? (
          /* SUCCESS VIEW - No "Send Again" button, only "Done" to close */
          <Box sx={{ textAlign: 'center', py: 2 }}>
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
              Successfully Sent!
            </Typography>
            
            <Typography variant="body1" color={colors.grey[300]} mb={4}>
              Document forwarded to <strong>{recipientEmail}</strong>.<br/>
              You can track this in your <strong>Outbox</strong>.
            </Typography>

            <Box display="flex" justifyContent="center">
              <Button 
                variant="contained" 
                color="success" 
                onClick={() => onClose(true)} // FIX: Passing 'true' tells the parent the send was a success
                sx={{ px: 4, borderRadius: '8px', fontWeight: 'bold' }}
              >
                Done
              </Button>
            </Box>
          </Box>
        ) : (
          /* FORM VIEW */
          <>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">Send Document</Typography>
              <IconButton onClick={handleClose}><CloseIcon sx={{ color: colors.grey[100] }} /></IconButton>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box display="flex" flexDirection="column" gap="20px">
              <Typography variant="h6" color={colors.greenAccent[400]}>
                Forwarding: <strong>{docData.title}</strong>
              </Typography>

              <TextField 
                label="Target Department"
                fullWidth
                value={DEPARTMENT_NAMES[targetDept]}
                InputProps={{ readOnly: true }}
                sx={{ "& .MuiInputBase-input": { color: colors.grey[300] }, bgcolor: "rgba(0,0,0,0.05)" }}
              />

              <TextField 
                select 
                label={deptUsers.length === 0 ? "Loading HR Admins..." : "Select HR Recipient (Email)"}
                fullWidth required disabled={deptUsers.length === 0}
                value={targetUser} 
                onChange={(e) => setTargetUser(e.target.value)}
              >
                {deptUsers.map((user) => (
                  <MenuItem key={user.id} value={user.uid || user.id}>
                    {user.email}
                  </MenuItem>
                ))}
              </TextField>

              <TextField 
                select label="Document Category" fullWidth required
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {DEPARTMENT_CATEGORIES.hr.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
                <MenuItem value="Others"><em>Others (Please specify)</em></MenuItem>
              </TextField>

              {selectedCategory === "Others" && (
                <TextField
                  label="Specify Category"
                  fullWidth required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter custom category name"
                  sx={{ mt: -1 }}
                />
              )}

              <TextField
                label="Message / Remarks"
                placeholder="Optional notes for HR..."
                fullWidth multiline rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />

              <Box display="flex" justifyContent="flex-end" gap="10px" mt={2}>
                <Button onClick={handleClose} sx={{ color: colors.grey[100] }}>Cancel</Button>
                <Button 
                  variant="contained" startIcon={<SendIcon />} 
                  disabled={!targetUser || !selectedCategory || (selectedCategory === "Others" && !customCategory) || loading}
                  onClick={handleForward}
                  sx={{ backgroundColor: colors.blueAccent[700], color: colors.grey[100], padding: "10px 20px" }}
                >
                  {loading ? "Sending..." : "Confirm Send"}
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