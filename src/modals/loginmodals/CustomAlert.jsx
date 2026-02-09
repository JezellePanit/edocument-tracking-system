import React, { useEffect } from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import "./CustomAlert.css";

const CustomAlert = ({ isOpen, message, type, onClose, autoClose = 0 }) => {
  // Logic for Auto-hide
  useEffect(() => {
    if (isOpen && autoClose > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoClose);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-box ${type}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          {type === "success" ? (
            <CheckCircleIcon sx={{ fontSize: 50 }} />
          ) : (
            <ErrorIcon sx={{ fontSize: 50 }} />
          )}
        </div>
        <h3>{type === "success" ? "Success!" : "Notice"}</h3>
        <p>{message}</p>
        <button className="modal-close-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
};

export default CustomAlert;