import React, { useState, useEffect } from "react";
import { 
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Typography, Box, Divider, TextField, MenuItem, Chip
} from "@mui/material";
import { db, auth } from "../../firebaseConfig";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import SendIcon from '@mui/icons-material/Send';

const DocumentDetailsModal = ({ open, docData, onClose, onRefresh }) => {
  const [targetDept, setTargetDept] = useState("");
  const [targetUser, setTargetUser] = useState("");
  const [deptUsers, setDeptUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch users when department is selected
  useEffect(() => {
    const fetchUsers = async () => {
      if (!targetDept) return;
      const q = query(collection(db, "users"), where("department", "==", targetDept));
      const snap = await getDocs(q);
      setDeptUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    };
    fetchUsers();
  }, [targetDept]);

  const handleSend = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, "documents", docData.id);
      const selectedUser = deptUsers.find(u => u.id === targetUser);
      
      await updateDoc(docRef, {
        submittedTo: targetDept,
        recipientId: targetUser,
        recipientName: selectedUser?.username || "Staff",
        status: "Sent",
        sentAt: new Date()
      });

      alert("Document sent successfully!");
      onRefresh();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!docData) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ bgcolor: "#f5f5f5", fontWeight: "bold" }}>
        Document Details: {docData.title}
      </DialogTitle>
      <DialogContent dividers>
        <Box display="flex" gap={4}>
          {/* LEFT: INFO */}
          <Box flex={1}>
            <Typography variant="subtitle2" color="textSecondary">Category</Typography>
            <Typography variant="body1" gutterBottom>{docData.categoryName}</Typography>
            
            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Description</Typography>
            <Typography variant="body2" gutterBottom>{docData.description}</Typography>

            <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2 }}>Current Status</Typography>
            <Chip label={docData.status || "Draft"} color="primary" size="small" />
            
            <Box sx={{ mt: 3 }}>
                <Button variant="outlined" onClick={() => window.open(docData.files?.[0]?.url)}>
                    View Attached File
                </Button>
            </Box>
          </Box>

          <Divider orientation="vertical" flexItem />

          {/* RIGHT: SEND FUNCTION */}
          <Box flex={1} sx={{ bgcolor: "#fafafa", p: 2, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>Forward Document</Typography>
            <TextField
              select
              fullWidth
              label="Target Department"
              value={targetDept}
              onChange={(e) => setTargetDept(e.target.value)}
              sx={{ mb: 2 }}
            >
              <MenuItem value="executive">Executive</MenuItem>
              <MenuItem value="finance">Finance</MenuItem>
              <MenuItem value="training">Training</MenuItem>
              <MenuItem value="it">IT</MenuItem>
            </TextField>

            <TextField
              select
              fullWidth
              label="Specific Recipient"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              disabled={!targetDept}
            >
              {deptUsers.map((u) => (
                <MenuItem key={u.id} value={u.id}>{u.username} ({u.email})</MenuItem>
              ))}
            </TextField>

            <Button 
              fullWidth 
              variant="contained" 
              startIcon={<SendIcon />}
              sx={{ mt: 3 }}
              disabled={!targetUser || loading}
              onClick={handleSend}
            >
              {loading ? "Sending..." : "Send Document"}
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentDetailsModal;