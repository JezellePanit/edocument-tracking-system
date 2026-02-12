import React, { useState, useEffect } from "react"; // Added useState and useEffect
import { Box, Typography, Modal, IconButton, Divider, Button, Chip, useTheme, Collapse } from "@mui/material"; // Added Collapse
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import HistoryIcon from '@mui/icons-material/History';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'; // Added for click indicator
import { tokens } from "../../theme";

const ViewOutboxModal = ({ open, onClose, docData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [showFullHistory, setShowFullHistory] = useState(false); // State to toggle view

  // Reset the toggle whenever the modal opens or document changes
  useEffect(() => {
    if (open) setShowFullHistory(false);
  }, [open, docData]);

  if (!docData) return null;

  const getFileExtension = (filename) => {
    return filename ? filename.split('.').pop().toUpperCase() : "FILE";
  };

  // Logic to handle both the current single recipient and the new history array
  // FIXED: Prioritize forwardingHistory and reverse it so the newest transaction is at the top
  const history = docData.forwardingHistory 
    ? [...docData.forwardingHistory].reverse() 
    : (docData.recipientName ? [{
        recipientName: docData.recipientName,
        submittedTo: docData.submittedTo,
        lastForwardedAt: docData.lastForwardedAt,
        remarks: docData.remarks
      }] : []);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 550, bgcolor: colors.primary[400],
          boxShadow: 24, p: 4, borderRadius: "8px",
          maxHeight: "90vh", overflowY: "auto",
          border: `1px solid ${colors.primary[500]}`,
        }}
      >
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" color={colors.grey[100]} fontWeight="bold">
            Document Details
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon sx={{ color: colors.grey[100] }} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box display="flex" flexDirection="column" gap="20px">
          
          {/* TOP ROW: Document Title and Priority */}
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap="20px">
            <DetailItem label="Document Title" value={docData.title} colors={colors} />
            <Box textAlign="left">
              <Typography variant="caption" color={colors.greenAccent[500]} sx={{ textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>
                Priority
              </Typography>
              <Box mt="4px">
                <Chip 
                  label={docData.priority || "Normal"} 
                  size="small"
                  sx={{ 
                    backgroundColor: docData.priority === "Urgent" ? colors.redAccent[600] : colors.blueAccent[700],
                    color: colors.grey[100],
                    fontWeight: "bold",
                  }} 
                />
              </Box>
            </Box>
          </Box>

          {/* SECOND ROW: Category and Date Uploaded */}
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap="20px">
            <DetailItem label="Category" value={docData.categoryName} colors={colors} />
            <DetailItem label="Date Uploaded" value={docData.displayDate} colors={colors} />
          </Box>

          <DetailItem label="Description" value={docData.description} colors={colors} />

          {/* FORWARDING TRACKING SECTION (CLICKABLE TO SHOW ALL) */}
          {history.length > 0 && (
            <Box 
              sx={{ 
                p: 2, 
                bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)", 
                borderRadius: "8px", 
                border: `1px solid ${colors.blueAccent[700]}`,
                cursor: "pointer", // Make it look clickable
                transition: "all 0.3s ease",
                "&:hover": { bgcolor: "rgba(255,255,255,0.08)" }
              }}
              onClick={() => setShowFullHistory(!showFullHistory)} // Toggle logic
            >
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center" gap="8px">
                  <HistoryIcon sx={{ color: colors.greenAccent[400] }} />
                  <Typography variant="h6" color={colors.greenAccent[400]} fontWeight="bold">
                    Sent Items ({history.length})
                  </Typography>
                </Box>
                <ExpandMoreIcon 
                  sx={{ 
                    color: colors.grey[100], 
                    transform: showFullHistory ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "0.3s"
                  }} 
                />
              </Box>

              {/* Show ONLY the latest recipient when collapsed */}
              {!showFullHistory && (
                <Box mt={1.5}>
                  <Typography variant="body2" color={colors.grey[300]}>
                    Last sent to: <strong>{history[0].recipientName}</strong>
                  </Typography>
                </Box>
              )}
              
              <Collapse in={showFullHistory}>
                <Box mt={2}>
                  {history.map((record, index) => (
                    <Box key={index} sx={{ mb: index !== history.length - 1 ? 2 : 0 }}>
                      <Divider sx={{ opacity: 0.3, mb: 1.5 }} />
                      <Box display="grid" gridTemplateColumns="1fr 1fr" gap="15px">
                        <DetailItem label="Forwarded To" value={record.recipientName} colors={colors} />
                        <DetailItem label="Department" value={record.submittedTo} colors={colors} />
                      </Box>

                      <Box mt={1.5}>
                        <DetailItem label="Message / Remarks" value={record.remarks} colors={colors} />
                      </Box>

                      <Box mt={1}>
                        <DetailItem 
                          label="Transaction Date" 
                          value={record.lastForwardedAt?.toDate ? record.lastForwardedAt.toDate().toLocaleString() : "Recently"} 
                          colors={colors} 
                        />
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </Box>
          )}

          {/* Files Section */}
          <Box>
            <Typography variant="h6" color={colors.greenAccent[400]} sx={{ mb: 1.5, fontWeight: "bold" }}>
              Attached Files
            </Typography>
            
            <Box display="flex" flexDirection="column" gap="10px">
              {docData.files && docData.files.length > 0 ? (
                docData.files.map((file, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    fullWidth
                    startIcon={<DownloadIcon />}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent modal toggle if clicked inside a bubble
                      window.open(file.url, "_blank");
                    }}
                    sx={{
                      color: colors.grey[100],
                      borderColor: colors.blueAccent[700],
                      justifyContent: "space-between",
                      textTransform: "none",
                      p: "12px",
                      "&:hover": { bgcolor: colors.blueAccent[800], borderColor: colors.blueAccent[500] }
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: "500" }}>
                      {file.name || `Document_${index + 1}`}
                    </Typography>
                    <Chip 
                        label={getFileExtension(file.name)} 
                        size="small" 
                        sx={{ height: "20px", fontSize: "10px", bgcolor: colors.primary[500], color: colors.greenAccent[400] }} 
                    />
                  </Button>
                ))
              ) : (
                <Typography color={colors.grey[500]} fontStyle="italic">No files attached to this document.</Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

const DetailItem = ({ label, value, colors }) => (
  <Box>
    <Typography variant="caption" color={colors.greenAccent[500]} sx={{ textTransform: "uppercase", fontWeight: "bold", letterSpacing: "0.5px" }}>
      {label}
    </Typography>
    <Typography variant="h5" color={colors.grey[100]} sx={{ mt: "2px", wordBreak: "break-word", lineHeight: 1.4 }}>
      {value || "None"}
    </Typography>
  </Box>
);

export default ViewOutboxModal;