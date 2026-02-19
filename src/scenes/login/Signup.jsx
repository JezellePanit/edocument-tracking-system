import React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import "./LoginSignup.css";

const Signup = ({ 
  formData, handleChange, usernameAvailable, signUpEmailExists, 
  passwordStrength, passRequirements, showPassword, setShowPassword, 
  showConfirmPassword, setShowConfirmPassword, navigate, switchMode 
}) => {
  return (
    <>
      <h3>Sign up</h3>
      <div className="name-row" style={{ display: "flex", gap: "10px" }}>
        <div className="input-group" style={{ flex: 1 }}>
          <input type="text" name="firstName" placeholder="First Name" maxLength={20} value={formData.firstName} onChange={handleChange} required />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <input type="text" name="lastName" placeholder="Family Name" maxLength={20} value={formData.lastName} onChange={handleChange} required />
        </div>
      </div>

      <div className="input-group">
        <div className="input-container">
          <input
            type="text"
            name="username"
            placeholder="Username"
            maxLength={15}
            value={formData.username}
            onChange={handleChange}
            required
            style={{ border: usernameAvailable === false ? "1.5px solid #d32f2f" : "" }}
          />
          <span className={`char-counter ${formData.username.length >= 15 ? 'limit' : ''}`}>
            {formData.username.length}/15
          </span>
        </div>
        {usernameAvailable === false && <div className="status-message error-text"><ErrorIcon sx={{ fontSize: 16 }} /> <span>Username taken</span></div>}
        {usernameAvailable === true && <div className="status-message success-text"><CheckCircleIcon sx={{ fontSize: 16 }} /> <span>Username available</span></div>}
      </div>

      <div className="input-group">
        <input type="text" name="idNumber" placeholder="ID Number (e.g., 2024-0001)" maxLength={20} value={formData.idNumber} onChange={handleChange} required />
      </div>

      <div className="input-group">
        <input
          type="email"
          name="email"
          placeholder="Email"
          maxLength={50}
          value={formData.email}
          onChange={handleChange}
          required
          style={{ border: (signUpEmailExists === true || (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))) ? "1.5px solid #d32f2f" : "" }}
        />
        {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && <div className="status-message error-text"><ErrorIcon sx={{ fontSize: 16 }} /> <span>Invalid email format</span></div>}
        {signUpEmailExists === true && <div className="status-message error-text"><ErrorIcon sx={{ fontSize: 16 }} /> <span>Email already registered</span></div>}
      </div>

      <div className="input-group">
        <div className="password-wrapper">
          <input type={showPassword ? "text" : "password"} name="password" placeholder="Password" maxLength={15} value={formData.password} onChange={handleChange} required />
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</span>
        </div>
        {passwordStrength && (
          <div className={`status-message strength-${passwordStrength.toLowerCase()}`}>
            <InfoIcon sx={{ fontSize: 16 }} /> <span>Strength: <strong>{passwordStrength}</strong></span>
          </div>
        )}
        {formData.password && passwordStrength !== "Strong" && (
          <div className="password-checklist">
            <p className={passRequirements.isLongEnough ? "met" : "unmet"}>{passRequirements.isLongEnough ? "✓" : "•"} 8-15 Characters</p>
            <p className={(passRequirements.hasUpperCase && passRequirements.hasLowerCase) ? "met" : "unmet"}>{(passRequirements.hasUpperCase && passRequirements.hasLowerCase) ? "✓" : "•"} Upper & Lowercase</p>
            <p className={passRequirements.hasNumber ? "met" : "unmet"}>{passRequirements.hasNumber ? "✓" : "•"} At least one Number</p>
            <p className={passRequirements.hasSpecial ? "met" : "unmet"}>{passRequirements.hasSpecial ? "✓" : "•"} Special Character (!@#$)</p>
          </div>
        )}
        {passwordStrength === "Strong" && <div className="status-message success-text"><CheckCircleIcon sx={{ fontSize: 16 }} /> <span>Password is secure!</span></div>}
      </div>

      <div className="input-group">
        <div className="password-wrapper">
          <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required
            style={{ border: formData.confirmPassword && formData.password !== formData.confirmPassword ? "1.5px solid #d32f2f" : "" }} />
          <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</span>
        </div>
        {formData.confirmPassword && formData.password !== formData.confirmPassword && <div className="status-message error-text"><ErrorIcon sx={{ fontSize: 16 }} /> <span>Passwords do not match</span></div>}
      </div>

      <select name="department" value={formData.department} onChange={handleChange} required>
        <option value="" disabled hidden>Select Department</option>
        <option value="executive">Executive Office</option>
        <option value="administrative">Administrative Section</option>      
        <option value="records">Records Section</option>
        <option value="procurement">Procurement</option>
        <option value="finance">Finance</option>
        <option value="training">Training Section</option>
        <option value="assessment">Assessment Section</option>
        <option value="it">IT / System Admin</option>
      </select>

      {formData.department && (
        <input type="text" name="jobTitle" placeholder="Job Title (e.g. Attorney)" value={formData.jobTitle} onChange={handleChange} required />
      )}

      <p className="policy-text">
        By clicking Create New Account, you agree to our{" "}
        <span className="policy-link" onClick={() => navigate("../policies/Terms", { state: { fromSignUp: true, savedData: formData } })}>Terms</span> and{" "}
        <span className="policy-link" onClick={() => navigate("../policies/PrivacyPolicy", { state: { fromSignUp: true, savedData: formData } })}>Privacy Policy</span>.
      </p>

      <button type="submit" className="login-btn" disabled={!usernameAvailable || !formData.firstName || !formData.lastName || signUpEmailExists || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || !formData.idNumber || !formData.jobTitle || passwordStrength !== "Strong" || formData.password !== formData.confirmPassword || !formData.department}>
        Create New Account
      </button>

      <p className="switch-signup">Already have an account? <span onClick={() => switchMode("login")}>Sign in</span></p>
    </>
  );
};

export default Signup;