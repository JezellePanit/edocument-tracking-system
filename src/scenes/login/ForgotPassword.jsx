import React from "react";
import ErrorIcon from "@mui/icons-material/Error";
import "./LoginSignup.css";

const ForgotPassword = ({ formData, handleChange, isChecking, emailExists, switchMode }) => {
  return (
    <>
      <h3>Request Password Reset</h3>
      <div style={{ position: 'relative' }}>
        <input
          type="email"
          name="email"
          placeholder="Registered Email"
          value={formData.email}
          onChange={handleChange}
          required
          style={{ 
            border: emailExists === false ? "2px solid #ff4d4d" : "1px solid #ccc",
            paddingRight: isChecking ? '40px' : '12px' 
          }}
        />
        {isChecking && <div className="spinner-small"></div>}
        {emailExists === false && !isChecking && (
          <p className="status-message error-text">
            <ErrorIcon sx={{ fontSize: 16}} /> Email not found. Please enter a registered email.
          </p>
        )}
      </div>

      <div style={{ pointerEvents: 'none', opacity: emailExists ? 1 : 0.6 }}>
        <select
          name="department"
          value={formData.department}
          readOnly
          tabIndex="-1" 
          style={{ backgroundColor: "#f4f4f4", cursor: "not-allowed", border: emailExists ? "2px solid #0a2a66" : "1px solid #ccc" }}
        >
          <option value="" disabled hidden>{emailExists ? "Department Identified" : "Department"}</option>
          <option value="Executive Office">Executive Office</option>
          <option value="Administrative Section">Administrative Section</option>      
          <option value="Records Section">Records Section</option>
          <option value="Procurement">Procurement</option>
          <option value="Finance">Finance</option>
          <option value="Training Section">Training Section</option>
          <option value="Assessment Section">Assessment Section</option>
          <option value="IT / System Admin">IT / System Admin</option>
        </select>
      </div>

      <button type="submit" className="login-btn" disabled={isChecking || !emailExists} style={{ opacity: (isChecking || !emailExists) ? 0.5 : 1 }}>
        {isChecking ? "Verifying..." : "Send Request"}
      </button>

      <p className="switch-login">Back to <span onClick={() => switchMode("login")}>Sign in</span></p>
    </>
  );
};

export default ForgotPassword;