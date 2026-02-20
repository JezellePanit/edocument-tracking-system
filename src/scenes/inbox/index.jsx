import React, { useState, useEffect } from "react";
import { 
  Box, Typography, useTheme, Card, CardContent, 
  Stack, TextField, IconButton, Divider, Chip
} from "@mui/material";
import { db } from "../../firebaseConfig";
import { 
  collection, query, where, orderBy, onSnapshot, 
  doc, updateDoc, arrayUnion, serverTimestamp 
} from "firebase/firestore";
import ArchiveIcon from '@mui/icons-material/Archive';
import SendIcon from '@mui/icons-material/Send';
import { tokens } from "../../theme";
import Header from "../../components/Header";

const Inbox = ({ userEmail }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [docs, setDocs] = useState([]);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    if (!userEmail) return;

    // Filter: User's documents where isArchived is FALSE
    const q = query(
      collection(db, "documents"),
      where("senderEmail", "==", userEmail),
      where("isArchived", "==", false), 
      orderBy("updatedAt", "desc")
    );

    // Real-time listener: instantly shows Admin updates/replies
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDocs(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsubscribe();
  }, [userEmail]);

  const handleSendReply = async (docId) => {
    if (!replyText[docId]?.trim()) return;

    const docRef = doc(db, "documents", docId);
    await updateDoc(docRef, {
      thread: arrayUnion({
        sender: "User",
        message: replyText[docId],
        timestamp: new Date().toISOString()
      }),
      updatedAt: serverTimestamp(),
      hasUnreadAdmin: true 
    });
    setReplyText({ ...replyText, [docId]: "" });
  };

  const handleArchive = async (docId) => {
    // When archived, it disappears from this view and appears in archive.jsx
    await updateDoc(doc(db, "documents", docId), { 
      isArchived: true,
      updatedAt: serverTimestamp()
    });
  };

  return (
    <Box m="20px">
      <Header title="INBOX" subtitle="Track your document progress and messages" />

      <Stack spacing={3} mt="20px">
        {docs.length === 0 ? (
          <Typography variant="h5" color={colors.grey[300]} sx={{ textAlign: "center", mt: 5 }}>
            No active documents in your inbox.
          </Typography>
        ) : (
          docs.map((item) => (
            <Card key={item.id} sx={{ bgcolor: colors.primary[400], borderRadius: "8px" }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h4" fontWeight="bold" color={colors.greenAccent[500]}>
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color={colors.grey[400]}>
                      ID: {item.documentId} | Status: 
                    </Typography>
                    <Chip 
                      label={item.adminStatus || "Pending"} 
                      size="small" 
                      sx={{ ml: 1, bgcolor: colors.blueAccent[700], color: "white", fontWeight: "bold" }} 
                    />
                  </Box>
                  <IconButton onClick={() => handleArchive(item.id)} title="Archive Conversation">
                    <ArchiveIcon sx={{ color: colors.grey[100] }} />
                  </IconButton>
                </Box>
                
                <Divider sx={{ my: 2 }} />

                {/* Thread Display */}
                <Box sx={{ 
                  maxHeight: "250px", overflowY: "auto", p: 2, 
                  bgcolor: colors.primary[900], borderRadius: "8px",
                  display: "flex", flexDirection: "column", gap: 1
                }}>
                  {item.thread?.map((msg, idx) => (
                    <Box 
                      key={idx} 
                      sx={{ 
                        alignSelf: msg.sender === "User" ? "flex-end" : "flex-start",
                        maxWidth: "80%" 
                      }}
                    >
                      <Typography variant="caption" color={colors.grey[400]} sx={{ display: "block", textAlign: msg.sender === "User" ? "right" : "left" }}>
                        {msg.sender === "User" ? "You" : "Admin"}
                      </Typography>
                      <Box sx={{ 
                        bgcolor: msg.sender === "User" ? colors.blueAccent[700] : colors.primary[700],
                        p: "8px 16px", borderRadius: "12px",
                        borderBottomRightRadius: msg.sender === "User" ? 0 : "12px",
                        borderBottomLeftRadius: msg.sender === "Admin" ? 0 : "12px"
                      }}>
                        <Typography variant="body1">{msg.message}</Typography>
                      </Box>
                    </Box>
                  )) || <Typography variant="body2" sx={{ fontStyle: 'italic', color: colors.grey[400] }}>No messages yet.</Typography>}
                </Box>

                {/* Reply Input */}
                <Box display="flex" mt={2} gap={1} alignItems="center">
                  <TextField 
                    fullWidth size="small" variant="filled" placeholder="Type a reply to admin..." 
                    value={replyText[item.id] || ""}
                    onChange={(e) => setReplyText({...replyText, [item.id]: e.target.value})}
                    sx={{ bgcolor: colors.primary[900], borderRadius: "4px" }}
                  />
                  <IconButton 
                    color="secondary" 
                    onClick={() => handleSendReply(item.id)}
                    disabled={!replyText[item.id]?.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Stack>
    </Box>
  );
};

export default Inbox;