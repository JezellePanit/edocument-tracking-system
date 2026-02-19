import React from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import "./LoginSignup.css";

const Signin = ({ formData, handleChange, handleAuth, showPassword, setShowPassword, switchMode }) => {
  return (
    <>
      <h3>Sign in</h3>
      <input
        type="email"
        name="email"
        placeholder="Email"
        maxLength={30}
        value={formData.email}
        onChange={handleChange}
        required
      />
      <div className="password-wrapper">
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          maxLength={15}
          value={formData.password}
          onChange={handleChange}
          required
        />
        <span
          className="toggle-password"
          style={{ cursor: formData.password ? "pointer" : "not-allowed" }}
          onClick={() => { if (formData.password) setShowPassword(!showPassword); }}
        >
          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
        </span>
      </div>
      <button type="submit" className="login-btn">Log In</button>
      <span className="forgot" onClick={() => switchMode("forgot")}>Forgot Password?</span>
      <p className="switch-login">
        Don’t have an account? <span onClick={() => switchMode("signup")}>Sign up</span>
      </p>
    </>
  );
};

export default Signin;