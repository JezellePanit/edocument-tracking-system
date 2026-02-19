import { Box, Typography, Modal, IconButton, Divider, Button, Chip, useTheme } from "@mui/material"; 
import CloseIcon from "@mui/icons-material/Close";
import DownloadIcon from "@mui/icons-material/Download";
import { tokens } from "../../theme";

const DocumentDetailModal = ({ open, onClose, docData }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  if (!docData) return null;

  // Helper function to get individual colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical": return colors.redAccent[600];
      case "Urgent": return "#ef6c00"; // Deep Orange
      case "Low": return colors.greenAccent[600];
      default: return colors.blueAccent[700]; // Normal
    }
  };
  
  const getFileExtension = (filename) => {
    return filename ? filename.split('.').pop().toUpperCase() : "FILE";
  };

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
                    backgroundColor: getPriorityColor(docData.priority),
                    color: colors.grey[100],
                    fontWeight: "bold",
                    borderRadius: "4px"
                  }} 
                />
              </Box>
            </Box>
          </Box>

          {/* SECOND ROW: Only Date Uploaded (Category Removed) */}
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap="20px">
            <DetailItem label="Document ID" value={docData.documentId} colors={colors} />
            <DetailItem label="Date Uploaded" value={docData.displayDate} colors={colors} />
          </Box>

          <DetailItem label="Description" value={docData.description} colors={colors} />

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
                      e.stopPropagation();
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

export default DocumentDetailModal;