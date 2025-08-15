import React, { useState } from "react";
import "./ForgotPassword.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:4000/reset-password/sendMail",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setSubmitted(true);
      } else {
        setError(data.message || "Failed to send reset email");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        {!submitted ? (
          <>
            <p className="description">
              Enter your registered email address and we'll send you a link to
              reset your password.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <div className="back-to-login">
              <a href="/">Back to Login</a>
            </div>
          </>
        ) : (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <div className="success-message">{message}</div>
            <p className="success-description">
              Please check your email inbox and follow the instructions to reset
              your password. The link will expire in 5 minutes.
            </p>
            <a href="/login" className="back-button">
              Back to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
