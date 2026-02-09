import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/whitelogo.png";
import "./terms.css";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-container">
      <div className="policy-card">
        <header className="policy-header">
          <img src={logo} alt="TESDA Logo" className="policy-logo" />
          <h1>Terms and Conditions</h1>
          <p>Document Tracking System - TESDA CSITE Baguio</p>
        </header>

        <section className="policy-content">
          <p className="last-updated">Last Updated: February 2026</p>

          <h3>1. Acceptance of Terms</h3>
          <p>
            By accessing and using the CSITE Document Tracking System (DTS), you acknowledge that you are an authorized personnel of TESDA and agree to comply with these terms.
          </p>

          <h3>2. Authorized Use</h3>
          <p>
            This system is intended solely for tracking official documents within TESDA CSITE. Users must:
          </p>
          <ul>
            <li>Use their assigned institutional credentials only.</li>
            <li>Ensure the accuracy of the metadata entered for every document.</li>
            <li>Maintain the confidentiality of sensitive information contained within tracked documents.</li>
          </ul>

          <h3>3. Data Privacy & Confidentiality</h3>
          <p>
            In compliance with the <strong>Data Privacy Act of 2012</strong>, all personnel are prohibited from unauthorized disclosure of personal or sensitive information found in documents (e.g., student records, payroll, or procurement bids).
          </p>

          <h3>4. Document Integrity</h3>
          <p>
            Users are responsible for ensuring that the status updates (e.g., "Received", "Forwarded", "Approved") accurately reflect the physical movement of the documents to ensure the reliability of the tracking trail.
          </p>

          <h3>5. System Security</h3>
          <p>
            Unauthorized attempts to bypass security features, modify logs, or access documents outside of your assigned department are strictly prohibited and may be subject to administrative disciplinary action.
          </p>
        </section>

        <footer className="policy-footer">
          <button className="back-btn" onClick={() => navigate("/", { state: { fromSignUp: true } })}>
            I Understand & Go Back
          </button>
        </footer>
      </div>
    </div>
  );
};

export default Terms;