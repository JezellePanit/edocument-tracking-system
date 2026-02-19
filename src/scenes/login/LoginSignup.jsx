import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
import { doc, setDoc, getDoc, query, collection, where, getDocs } from "firebase/firestore";

import "./LoginSignup.css";
import CustomAlert from "../../modals/loginmodals/CustomAlert";
import bgImage from "../../assets/background.png";
import logo from "../../assets/CSITE_Logo.png";

// Import Divided Components
import Signin from "./Signin";
import Signup from "./Signup";
import ForgotPassword from "./ForgotPassword";

const LoginSignup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [passRequirements, setPassRequirements] = useState({});
  const [usernameAvailable, setUsernameAvailable] = useState(null); 
  const [signUpEmailExists, setSignUpEmailExists] = useState(null); 
  const [passwordStrength, setPasswordStrength] = useState(""); 
  const [isChecking, setIsChecking] = useState(false);
  const [emailExists, setEmailExists] = useState(null); 
  const [mode, setMode] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "", 
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

    if (name === "firstName" || name === "lastName") {
      const lettersOnly = value.replace(/[^a-zA-Z\s]/g, ""); 
      setFormData((prev) => ({ ...prev, [name]: lettersOnly }));
      return;
    }

    if (name === "email") {
      setEmailExists(null); 
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
            firstName: formData.firstName,
            lastName: formData.lastName,
            idNumber: formData.idNumber, 
            email: formData.email,
            department: formData.department,
            jobTitle: formData.jobTitle, 
            role: "user", 
            createdAt: new Date(),
          });

          showAlert("Account created successfully!", "success");
          setTimeout(() => switchMode("login"), 2000);
        } catch (error) {
          showAlert(error.message, "error");
        }
      }

    else if (mode === "login") {
    try {
        const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
        );

        const user = userCredential.user;
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
        alert("User record not found. Please contact admin.");
        return;
        }

        const userData = userDocSnap.data();
        showAlert(`Welcome back, ${userData.username}! Redirecting...`, "success");

        setTimeout(() => {
          if (userData.role === "admin") {
            navigate("/dashboard"); 
          } else {
            navigate("/home"); 
          }
        }, 1500);

      } catch (error) {
        showAlert("Invalid email or password. Please try again.", "error");
      }
    }

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

  const switchMode = (newMode) => {
    if (mode !== newMode) {
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        department: "",
        idNumber: "", 
        jobTitle: "", 
      });
      setUsernameAvailable(null);
      setSignUpEmailExists(null);
      setPasswordStrength("");
    }
    
    setMode(newMode);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const [alertConfig, setAlertConfig] = useState({ 
    isOpen: false, 
    message: "", 
    type: "success" 
  });

  const showAlert = (message, type = "success") => {
    setAlertConfig({ isOpen: true, message, type });
  };

  useEffect(() => {
    const checkAvailability = async () => {
      if (mode !== "signup") return;

      if (formData.username.length >= 3) {
        const q = query(collection(db, "users"), where("username", "==", formData.username));
        const snap = await getDocs(q);
        setUsernameAvailable(snap.empty); 
      } else {
        setUsernameAvailable(null);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(formData.email)) {
        const q = query(collection(db, "users"), where("email", "==", formData.email));
        const snap = await getDocs(q);
        setSignUpEmailExists(!snap.empty); 
      } else {
        setSignUpEmailExists(null);
      }
    };

    checkAvailability();

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
        
        setPassRequirements(requirements); 
      }
      }, [formData.username, formData.email, formData.password, mode]); 

  useEffect(() => {
    const checkEmail = async () => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      
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

  useEffect(() => {
    if (location.state?.fromSignUp) {
      setMode("signup");
      if (location.state.savedData) {
        setFormData(location.state.savedData);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <div className="login-page" style={{ backgroundImage: `url(${bgImage})` }}>
      <div className="overlay"></div>
      <div className="login-card">
        <div className="login-left">
          <img src={logo} alt="TESDA CSITE Logo" className="logo" />
          <h2>Human Resource <br /> Information System</h2>
        </div>

        <div className="divider"></div>

        <div className="login-right">
          <form key={mode} onSubmit={handleAuth}>
            {mode === "login" && (
              <Signin 
                formData={formData} 
                handleChange={handleChange} 
                handleAuth={handleAuth} 
                showPassword={showPassword} 
                setShowPassword={setShowPassword} 
                switchMode={switchMode} 
              />
            )}

            {mode === "signup" && (
              <Signup 
                formData={formData} 
                handleChange={handleChange} 
                usernameAvailable={usernameAvailable}
                signUpEmailExists={signUpEmailExists}
                passwordStrength={passwordStrength}
                passRequirements={passRequirements}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                showConfirmPassword={showConfirmPassword}
                setShowConfirmPassword={setShowConfirmPassword}
                navigate={navigate}
                switchMode={switchMode}
              />
            )}

            {mode === "forgot" && (
              <ForgotPassword 
                formData={formData} 
                handleChange={handleChange} 
                isChecking={isChecking}
                emailExists={emailExists}
                switchMode={switchMode}
              />
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