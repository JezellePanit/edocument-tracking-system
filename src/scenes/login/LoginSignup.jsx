import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "firebase/firestore";

import "./LoginSignup.css";
import CustomAlert from "../../modals/loginmodals/CustomAlert";
import bgImage from "../../assets/background.png";
import logo from "../../assets/CSITE_Logo.png";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";

const LoginSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [passRequirements, setPassRequirements] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null); // null, true, false
  const [signUpEmailExists, setSignUpEmailExists] = useState(null); // null, true, false
  const [passwordStrength, setPasswordStrength] = useState(""); // Weak, Medium, Strong
  const [isChecking, setIsChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(null); // null = haven't checked, true = found, false = not found
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    idNumber: "",
    email: "",
    password: "",
    confirmPassword: "",
    department: "",
    jobTitle: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "email") {
      setEmailExists(null); // Remove the warning/red border
      // 🔥 This line clears the department field immediately
      setFormData((prev) => ({
        ...prev,
        email: value,
        department: mode === "forgot" ? "" : prev.department,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Validation Logic
  const validateForm = () => {
    const { username, email, password, confirmPassword } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (mode === "signup") {
      if (username.length > 15) {
        alert("Username must be 15 characters or less.");
        return false;
      }
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address.");
        return false;
      }
      if (passwordStrength !== "Strong") {
        alert("Please meet all password requirements.");
        return false;
      }
      if (password.length < 6 || password.length > 15) {
        alert("Password must be between 6 and 15 characters.");
        return false;
      }
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return false;
      }
      return true;
    }

    if (mode === "forgot") {
      if (!emailRegex.test(formData.email)) {
        alert("Please enter a valid registered email.");
        return false;
      }
      if (!formData.department) {
        alert("Please select your department.");
        return false;
      }
    }

    return true;
  };

  const handleAuth = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // SIGN UP
    if (mode === "signup") {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
            username: formData.username,
            idNumber: formData.idNumber, // Added
            email: formData.email,
            department: formData.department,
            jobTitle: formData.jobTitle, // Changed from static "user" to dynamic
            role: "user", // 🔒 HARD-CODED: Everyone who signs up is a standard user
            createdAt: new Date(),
          });

          showAlert("Account created successfully!", "success");
          setTimeout(() => switchMode("login"), 2000);
        } catch (error) {
          showAlert(error.message, "error");
        }
      }

    // LOGIN
    else if (mode === "login") {
    try {
        const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
        );

        const user = userCredential.user;

        // 🔥 Fetch user data from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
        alert("User record not found. Please contact admin.");
        return;
        }

        const userData = userDocSnap.data();
        console.log("Logged in user:", userData);

        // ✅ Personalized Welcome Alert
        showAlert(`Welcome back, ${userData.username}! Redirecting...`, "success");

        // 🔥 LOGIC FIXED: Redirection happens here based on role
        setTimeout(() => {
          if (userData.role === "admin") {
            navigate("/dashboard"); // Change to your actual admin route
          } else {
            navigate("/home"); // Standard employee dashboard
          }
        }, 1500);

      } catch (error) {
        showAlert("Invalid email or password. Please try again.", "error");
      }
    }

    // FORGOT PASSWORD (ADMIN APPROVAL)
    else if (mode === "forgot") {
      try {
        await setDoc(doc(db, "passwordResetRequests", formData.email), {
          email: formData.email,
          department: formData.department,
          status: "pending",
          requestedAt: new Date(),
        });

        showAlert("Reset request submitted! Please wait for Admin approval.", "success");
        setTimeout(() => switchMode("login"), 2500);
      } catch (error) {
        showAlert("Failed to send request. Check your connection.", "error");
      }
    }
  };

  // Switch between modes
  const switchMode = (newMode) => {
    // Only clear the form if we are toggling between different auth states
    // (e.g., switching from login to signup or vice versa)
    if (mode !== newMode) {
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        department: "",
        idNumber: "", // Add this
        jobTitle: "", // Add this
      });
      // Reset validation states too
      setUsernameAvailable(null);
      setSignUpEmailExists(null);
      setPasswordStrength("");
    }
    
    setMode(newMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  //CUSTOM ALERT HANDLER
  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    message: "", 
    type: "success" 
  });

  const showAlert = (message, type = "success") => {
    setAlertConfig({ isOpen: true, message, type });
  };

  //HANDLE USERNAME & EMAIL AVAILABILITY CHECKING FOR SIGNUP AND PASSWORD STRENGTH
  useEffect(() => {
    const checkAvailability = async () => {
      if (mode !== "signup") return;

      // 1. Check Username Availability
      if (formData.username.length >= 3) {
        const q = query(collection(db, "users"), where("username", "==", formData.username));
        const snap = await getDocs(q);
        setUsernameAvailable(snap.empty); // true if no one has it
      } else {
        setUsernameAvailable(null);
      }

      // 2. Check if Email is already registered
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(formData.email)) {
        const q = query(collection(db, "users"), where("email", "==", formData.email));
        const snap = await getDocs(q);
        setSignUpEmailExists(!snap.empty); // true if someone has it
      } else {
        setSignUpEmailExists(null);
      }
    };

    checkAvailability();

      // 3. Simple Password Strength Logic
      const pass = formData.password;
      if (!pass) {
        setPasswordStrength("");
      } else {
        const requirements = {
          hasUpperCase: /[A-Z]/.test(pass),
          hasLowerCase: /[a-z]/.test(pass),
          hasNumber: /[0-9]/.test(pass),
          hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
          isLongEnough: pass.length >= 8 && pass.length <= 15,
        };

        const strengthScore = Object.values(requirements).filter(Boolean).length;

        if (strengthScore <= 2) setPasswordStrength("Weak");
        else if (strengthScore <= 4) setPasswordStrength("Medium");
        else setPasswordStrength("Strong");
        
        // We store these requirements to show in the UI
        setPassRequirements(requirements); 
      }
      }, [formData.username, formData.email, formData.password, mode]); 

  //HANDLE EMAIL CHECKING FOR FORGOT PASSWORD
  useEffect(() => {
    const checkEmail = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
      // If the email is not valid yet, make sure department is empty
      if (mode === "forgot" && !emailRegex.test(formData.email)) {
        setFormData(prev => ({ ...prev, department: "" }));
        setEmailExists(null);
        return;
      }

      if (mode === "forgot" && emailRegex.test(formData.email)) {
        setIsChecking(true);
        try {
          const q = query(collection(db, "users"), where("email", "==", formData.email));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setFormData(prev => ({ ...prev, department: userData.department }));
            setEmailExists(true);
          } else {
            setFormData(prev => ({ ...prev, department: "" }));
            setEmailExists(false); 
          }
        } catch (error) {
          console.error("Error fetching user:", error);
        } finally {
          setIsChecking(false);
        }
      }
    };

  const timeoutId = setTimeout(() => checkEmail(), 800);
  return () => clearTimeout(timeoutId);
}, [formData.email, mode]);

  // HANDLE NAVIGATION FROM TERMS/PRIVACY BACK TO SIGNUP
  useEffect(() => {
    if (location.state?.fromSignUp) {
      setMode("signup");
      if (location.state.savedData) {
        setFormData(location.state.savedData);
      }
      // Clear the state so it doesn't stay on signup forever if they refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div
      className="login-page"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="overlay"></div>

      <div className="login-card">
        {/* LEFT SIDE */}
        <div className="login-left">
          <img src={logo} alt="TESDA CSITE Logo" className="logo" />
          <h2>
            Human Resource <br /> Information System
          </h2>
        </div>

        <div className="divider"></div>

        {/* RIGHT SIDE */}
        <div className="login-right">
          <form key={mode} onSubmit={handleAuth}>
            {mode === "login" && (
              <>
                {/* 🔥 Syntax error fixed: Logic was removed from here and moved to handleAuth */}
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
            )}

            {mode === "signup" && (
              <>
                <h3>Sign up</h3>
                

                {/* USERNAME */}
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
                  {usernameAvailable === false && (
                    <div className="status-message error-text">
                      <ErrorIcon sx={{ fontSize: 16 }} /> <span>Username taken</span>
                    </div>
                  )}
                  {usernameAvailable === true && (
                    <div className="status-message success-text">
                      <CheckCircleIcon sx={{ fontSize: 16 }} /> <span>Username available</span>
                    </div>
                  )}
                </div>

                {/* ID NUMBER*/}
                <div className="input-group">
                  <input
                    type="text"
                    name="idNumber"
                    placeholder="ID Number (e.g., 2024-0001)"
                    maxLength={20}
                    value={formData.idNumber}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* EMAIL WITH REAL-TIME FORMAT CHECK */}
                <div className="input-group">
                  <div className="input-container">
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      maxLength={50}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      style={{ 
                        border: (signUpEmailExists === true || (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))) 
                        ? "1.5px solid #d32f2f" : "" 
                      }}
                    />
                  </div>
                  {/* Show error if email format is wrong */}
                  {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                    <div className="status-message error-text">
                      <ErrorIcon sx={{ fontSize: 16 }} /> <span>Invalid email format</span>
                    </div>
                  )}
                  {/* Show error if email already exists in DB */}
                  {signUpEmailExists === true && (
                    <div className="status-message error-text">
                      <ErrorIcon sx={{ fontSize: 16 }} /> <span>Email already registered</span>
                    </div>
                  )}
                </div>

                {/* PASSWORD WITH STRENGTH & REQUIREMENTS */}
                <div className="input-group">
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
                    <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </span>
                  </div>

                  {/* Strength Indicator Label */}
                  {passwordStrength && (
                    <div className={`status-message strength-${passwordStrength.toLowerCase()}`}>
                      <InfoIcon sx={{ fontSize: 16 }} />
                      <span>Strength: <strong>{passwordStrength}</strong></span>
                    </div>
                  )}

                  {/* Requirement Checklist - Turns Green when met */}
                  {formData.password && passwordStrength !== "Strong" && (
                    <div className="password-checklist">
                      <p className={passRequirements.isLongEnough ? "met" : "unmet"}>
                        {passRequirements.isLongEnough ? "✓" : "•"} 8-15 Characters
                      </p>
                      <p className={(passRequirements.hasUpperCase && passRequirements.hasLowerCase) ? "met" : "unmet"}>
                        {(passRequirements.hasUpperCase && passRequirements.hasLowerCase) ? "✓" : "•"} Upper & Lowercase
                      </p>
                      <p className={passRequirements.hasNumber ? "met" : "unmet"}>
                        {passRequirements.hasNumber ? "✓" : "•"} At least one Number
                      </p>
                      <p className={passRequirements.hasSpecial ? "met" : "unmet"}>
                        {passRequirements.hasSpecial ? "✓" : "•"} Special Character (!@#$)
                      </p>
                    </div>
                  )}
                  {/* Optional: Show a "Success" message when strong */}
                  {passwordStrength === "Strong" && (
                    <div className="status-message success-text" style={{ marginTop: "0px" }}>
                      <CheckCircleIcon sx={{ fontSize: 16 }} /> <span>Password is secure!</span>
                    </div>
                  )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="input-group">
                  <div className="password-wrapper">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      maxLength={15}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      style={{ 
                        border: formData.confirmPassword && formData.password !== formData.confirmPassword ? "1.5px solid #d32f2f" : "" 
                      }}
                    />
                    <span className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </span>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <div className="status-message error-text">
                      <ErrorIcon sx={{ fontSize: 16 }} /> <span>Passwords do not match</span>
                    </div>
                  )}
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

                {/* ROLE INPUT (User types this manually) */}
                <div className="input-group">
                  <input
                    type="text"
                    name="jobTitle"
                    placeholder="Job Title (e.g. Instructor)"
                    maxLength={30}
                    value={formData.jobTitle}
                    onChange={handleChange}
                    required
                  />
                </div>

                <p className="policy-text">
                  By clicking Create New Account, you agree to our{" "}
                  <span className="policy-link" onClick={() => navigate("../policies/Terms", { state: { fromSignUp: true, savedData: formData } })}>
                    Terms
                  </span>{" "}
                  and{" "}
                  <span className="policy-link" onClick={() => navigate("../policies/PrivacyPolicy", { state: { fromSignUp: true, savedData: formData } })}>
                    Privacy Policy
                  </span>.
                </p>

                <button
                  type="submit"
                  className="login-btn"
                  disabled={
                    !usernameAvailable || 
                    signUpEmailExists || 
                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) || 
                    !formData.idNumber || // Ensure ID Number is present
                    !formData.jobTitle ||     // Ensure Job Title is present
                    passwordStrength !== "Strong" || 
                    formData.password !== formData.confirmPassword ||
                    !formData.department
                  }
                >
                  Create New Account
                </button>

                <p className="switch-signup">
                  Already have an account?{" "}
                  <span onClick={() => switchMode("login")}>Sign in</span>
                </p>
              </>
            )}

            {mode === "forgot" && (
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
                  
                  {/* ERROR MESSAGE */}
                  {emailExists === false && !isChecking && (
                    <p className="status-message error-text">
                        <ErrorIcon sx={{ fontSize: 16}} /> 
                        Email not found. Please enter a registered email.
                      </p>
                  )}
                </div>

                {/* SELECT DEPARTMENT (Locked) */}
                <div style={{ pointerEvents: 'none', opacity: emailExists ? 1 : 0.6 }}>
                  <select
                    name="department"
                    value={formData.department}
                    readOnly
                    tabIndex="-1" 
                    style={{ 
                      backgroundColor: "#f4f4f4", 
                      cursor: "not-allowed",
                      border: emailExists ? "2px solid #0a2a66" : "1px solid #ccc"
                    }}
                  >
                    <option value="" disabled hidden>
                      {emailExists ? "Department Identified" : "Department"}
                    </option>
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


                <button 
                  type="submit" 
                  className="login-btn" 
                  disabled={isChecking || !emailExists}
                  style={{ opacity: (isChecking || !emailExists) ? 0.5 : 1 }}
                >
                  {isChecking ? "Verifying..." : "Send Request"}
                </button>

                <p className="switch-login">
                  Back to{" "}
                  <span onClick={() => switchMode("login")}>
                    Sign in
                  </span>
                </p>
              </>
            )}
          </form>
        </div>
      </div>
      
      <CustomAlert 
        isOpen={alertConfig.isOpen} 
        message={alertConfig.message} 
        type={alertConfig.type} 
        autoClose={3000} 
        onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} 
      />

      <footer>
        © 2026 – Developed by CSITE TESDA Main Campus Interns –
        BS Information Technology from STI College of Baguio City
        <br />
        All rights reserved.
      </footer>
    </div>
  );
};

export default LoginSignup;
