import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./ResetPassword.css";

const ResetPassword = () => {
  const { requestId } = useParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [expired, setExpired] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    validateResetLink();
  }, []);

  const validateResetLink = async () => {
    try {
      const response = await fetch(
        `http://localhost:4000/reset-password/verify?requestId=${requestId}`
      );
      const data = await response.json();

      if (!response.ok) {
        setExpired(true);
        setError(data.message || "Invalid or expired reset link");
      }
    } catch (err) {
      setExpired(true);
      setError("Failed to validate reset link. Please try again.");
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:4000/reset-password/resetPassword",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            requestId,
            password,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage(data.message);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const retryValidation = () => {
    setValidating(true);
    setError("");
    setExpired(false);
    validateResetLink();
  };

  if (validating) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="loading-spinner"></div>
          <p className="loading-text">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (expired) {
    return (
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="error-icon">⚠</div>
          <h2>Link Expired</h2>
          <p className="error-description">{error}</p>
          <button onClick={retryValidation} className="retry-button">
            Retry Validation
          </button>
          <a href="/forgot-password" className="retry-button">
            Request New Link
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        {!success ? (
          <>
            <h2>Reset Your Password</h2>
            <p className="description">
              Enter your new password below. Make sure it meets the required
              criteria.
            </p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="password">New Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                  disabled={loading}
                />
              </div>
              {error && <div className="error-message">{error}</div>}
              <button
                type="submit"
                disabled={loading}
                className="submit-button"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </>
        ) : (
          <div className="success-container">
            <div className="success-icon">✓</div>
            <h2>Password Reset Successful!</h2>
            <p className="success-description">
              Your password has been successfully reset. You can now login with
              your new password.
            </p>
            <a href="/" className="login-button">
              Go to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
