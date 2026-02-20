import React from "react";
import {
  Modal,
  Box,
  Typography,
  useTheme,
  IconButton,
  Divider,
  Stack,
  Chip,
  Button,
  Grid
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { tokens } from "../../theme";

const DocumentDetailsModal = ({ open, onClose, docData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (!docData) return null;

  // --- DATE FORMATTING LOGIC (Matched to DocumentManagement.jsx) ---
  const dateValue = docData.lastForwardedAt || docData.createdAt;
  let formattedDate = "N/A";

  if (dateValue) {
    // If it's a Firestore Timestamp, use toDate(), otherwise create a new Date object
    const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
    formattedDate = date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical": return colors.redAccent[600];
      case "Urgent": return "#ef6c00"; 
      case "Low": return colors.greenAccent[600];
      default: return colors.blueAccent[700]; 
    }
  };
  
  const getFileExtension = (filename) => {
    return filename ? filename.split('.').pop().toUpperCase() : "FILE";
  };

  // Helper to format the department names consistently
  const formatDepartmentName = (dept) => {
    if (!dept) return "N/A";
    const deptMap = {
      "executive": "Executive Office",
      "it": "IT / System Admin",
      "admin": "Administrative Section",
      "records": "Records Management Office",
      "procurement": "Procurement Section",
      "finance": "Finance Section",
      "training": "Training Section",
      "assessment": "Assessment Section",
    };
    const searchKey = dept.toLowerCase().trim();
    return deptMap[searchKey] || dept.charAt(0).toUpperCase() + dept.slice(1).toLowerCase();
  };

  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 600,
    maxHeight: "90vh",
    bgcolor: colors.primary[400],
    boxShadow: 24,
    p: 4,
    borderRadius: "8px",
    border: `1px solid ${colors.primary[500]}`,
    overflowY: "auto",
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        {/* HEADER */}
        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="flex-start" // Aligns items to the top so long titles don't push the X button down
          mb={2}
        >
          {/* Left Side: Icon + Title & ID Stacked */}
          <Box display="flex" gap="12px">
            <VisibilityIcon sx={{ color: colors.blueAccent[100], fontSize: "28px", mt: "4px" }} />
            <Box>
              <Typography variant="h3" color={colors.grey[100]} fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                Document Details
              </Typography>
              <Typography variant="subtitle2" color={colors.greenAccent[500]} fontWeight="bold">
                ID: {docData.documentId}
              </Typography>
            </Box>
          </Box>

          {/* Right Side: Close Button */}
          <IconButton onClick={onClose} sx={{ mt: -1, mr: -1 }}>
            <CloseIcon sx={{ color: colors.grey[100] }} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Stack spacing={3}>
          {/* SECTION: SENDER INFORMATION */}
          <Box>
            <Typography variant="h5" color={colors.blueAccent[400]} fontWeight="bold" mb={2} sx={{ textTransform: "uppercase" }}>
              Sender Information
            </Typography>
            <Grid container spacing={2} gridTemplateColumns="1fr 1fr" gap="20px">
              <Grid item xs={6}>
                <DetailItem label="Email Address" value={docData.senderEmail} colors={colors} />
              </Grid>
              <Grid item xs={6} sx={{ ml: "110px" }}>
                <DetailItem label="Sender Department" value={formatDepartmentName(docData.senderDepartment)} colors={colors} />
              </Grid>
              
              {/* ADDED: SENDER REMARKS/MESSAGE */}
              {docData.remarks && (
                <Grid item xs={12} mt={1}>
                  <Box sx={{ p: 1, bgcolor: colors.primary[400], borderRadius: "4px", borderLeft: `4px solid ${colors.greenAccent[500]}` }}>
                    <DetailItem label="Sender's Remarks / Message" value={docData.remarks} colors={colors} />
                  </Box>
                </Grid>
              )}
            </Grid>
          </Box>

          <Divider sx={{ opacity: 0.5 }} />

          {/* SECTION: DOCUMENT CONTENT */}
          <Box>
            <Typography variant="h5" color={colors.blueAccent[400]} fontWeight="bold" mb={2} sx={{ textTransform: "uppercase" }}>
              Content Details
            </Typography>
            <Stack spacing={2}>
              <DetailItem label="Subject / Title" value={docData.title} colors={colors} />
              
              <Box display="grid" gridTemplateColumns="1fr 1fr" gap="20px">
                <Box>
                  <Typography variant="caption" color={colors.greenAccent[500]} sx={{ fontWeight: "bold", textTransform: "uppercase" }}>
                    Priority
                  </Typography>
                  <Box mt="4px">
                    <Chip 
                      label={docData.priority || "Normal"} 
                      size="small" 
                      sx={{ 
                        backgroundColor: docData.priority === "Critical" ? colors.redAccent[600] : colors.blueAccent[700],
                        color: "#fff", fontWeight: "bold", borderRadius: "4px" 
                      }} 
                    />
                  </Box>
                </Box>
                <DetailItem label="Category" value={docData.categoryName} colors={colors} />
              </Box>

              <DetailItem label="Date Sent" value={formattedDate} colors={colors} />
              <DetailItem label="Description" value={docData.description} colors={colors} />
            </Stack>
          </Box>

          <Divider sx={{ opacity: 0.5 }} />

          {/* SECTION: ATTACHMENTS */}
          <Box>
            <Typography variant="h5" color={colors.blueAccent[400]} fontWeight="bold" mb={2} sx={{ textTransform: "uppercase" }}>
              Attachments
            </Typography>
            <Stack spacing={1}>
              {docData.files && docData.files.length > 0 ? (
                docData.files.map((file, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    onClick={() => window.open(file.url, "_blank")}
                    sx={{
                      justifyContent: "flex-start",
                      color: colors.grey[100],
                      borderColor: colors.blueAccent[700],
                      textTransform: "none",
                      "&:hover": { bgcolor: colors.primary[900] }
                    }}
                  >
                    {file.name || `Attachment ${index + 1}`}
                  </Button>
                ))
              ) : (
                <Typography variant="body2" color={colors.grey[500]} fontStyle="italic">
                  No files attached.
                </Typography>
              )}
            </Stack>
          </Box>

          {/* SECTION: ADMIN REMARKS (If any) */}
          {(docData.adminRemarks || docData.adminReply) && (
            <>
              <Divider sx={{ opacity: 0.5 }} />
              <Box>
                <Typography variant="h5" color={colors.redAccent[400]} fontWeight="bold" mb={2}>
                  Admin Feedback
                </Typography>
                <Stack spacing={2}>
                  {docData.adminRemarks && <DetailItem label="Revision Remarks" value={docData.adminRemarks} colors={colors} />}
                  {docData.adminReply && <DetailItem label="Admin Message" value={docData.adminReply} colors={colors} />}
                </Stack>
              </Box>
            </>
          )}
        </Stack>

        <Box mt={4} display="flex" justifyContent="flex-end">
          <Button 
            variant="contained" 
            onClick={onClose}
            sx={{ 
              backgroundColor: colors.blueAccent[700], 
              color: colors.grey[100],
              fontWeight: "bold",
              px: 4
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

// Sub-component for clean vertical layout
const DetailItem = ({ label, value, colors }) => (
  <Box>
    <Typography 
      variant="caption" 
      color={colors.greenAccent[500]} 
      sx={{ textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}
    >
      {label}
    </Typography>
    <Typography 
      variant="h5" 
      color={colors.grey[100]} 
      sx={{ mt: "4px", lineHeight: 1.5, wordBreak: "break-word" }}
    >
      {value || "N/A"}
    </Typography>
  </Box>
);

export default DocumentDetailsModal;