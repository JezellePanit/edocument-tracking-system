import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/whitelogo.png";
import "./PrivacyPolicy.css";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="policy-container">
      <div className="policy-card">
        <header className="policy-header">
          <img src={logo} alt="TESDA Logo" className="policy-logo" />
          <h1>Privacy Policy</h1>
          <p>Data Privacy Statement for DTS Users</p>
        </header>

        <section className="policy-content">
          <p className="last-updated">Last Updated: February 2026</p>

          <h3>1. Data Collection</h3>
          <p>
            The Document Tracking System (DTS) collects the following personal and institutional data:
          </p>
          <ul>
            <li><strong>Account Information:</strong> Full name, institutional email address, and department.</li>
            <li><strong>Document Metadata:</strong> Tracking numbers, document titles, and transaction history.</li>
            <li><strong>System Logs:</strong> Timestamps of logins and document status updates.</li>
          </ul>

          <h3>2. Purpose of Collection</h3>
          <p>
            Information is collected solely for the purpose of monitoring the flow of documents to the <strong>Executive Office</strong>, ensuring accountability, and improving the efficiency of administrative services within TESDA CSITE Baguio City.
          </p>

          <h3>3. Data Disclosure & Access</h3>
          <p>
            Access to tracked data is restricted based on the "Principle of Least Privilege":
          </p>
          <ul>
            <li><strong>Executive Office:</strong> Can view all document movement.</li>
            <li><strong>Department Users:</strong> Can only track documents related to their specific section.</li>
            <li><strong>System Admins:</strong> Can manage accounts but are prohibited from accessing document content without authorization.</li>
          </ul>

          <h3>4. Data Retention</h3>
          <p>
            Document logs are retained for as long as necessary to fulfill the tracking purpose or as required by the National Archives of the Philippines (NAP) and COA regulations.
          </p>

          <h3>5. Your Rights</h3>
          <p>
            Under the <strong>Data Privacy Act of 2012</strong>, you have the right to access your account data, request corrections for any inaccuracies, and report any unauthorized processing of your information.
          </p>

          <h3>6. Security Measures</h3>
          <p>
            We implement technical security measures, including data encryption via Firebase and role-based access control, to prevent unauthorized access or data breaches.
          </p>
        </section>

        <footer className="policy-footer">
          <button className="back-btn" onClick={() => navigate("/", { state: { fromSignUp: true } })}>
            I Agree & Go Back
          </button>
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;