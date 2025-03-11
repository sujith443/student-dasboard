import React, { useState } from "react";
import { useAuth } from "./Authentication";
import axios from "axios";

const Profile = () => {
  const { user } = useAuth();
  const { name, hallticketnumber, branch, phone, email } = user.data.user;

  // State for password change
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // ✅ Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    try {
      const response = await axios.put("http://localhost:5000/update-password", {
        hallticketnumber,
        email,
        oldPassword,
        newPassword,
      });

      setMessage(response.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error updating password");
      setMessage("");
    }
  };

  // ✅ Handle Forgot Password Reset
  const handleForgotPassword = async (e) => {
    e.preventDefault();

    if (!forgotNewPassword) {
      setError("New password is required.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/forgot-password", {
        hallticketnumber,
        email,
        newPassword: forgotNewPassword,
      });

      setMessage(response.data.message);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Error resetting password");
      setMessage("");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">👤 Profile</h2>

      {/* Profile Details */}
      <div className="card">
        <div className="card-header">📌 User Information</div>
        <div className="card-body">
          <p><strong>Name:</strong> {name}</p>
          <p><strong>Branch:</strong> {branch}</p>
          <p><strong>Hall Ticket:</strong> {hallticketnumber}</p>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Phone:</strong> {phone}</p>
        </div>
      </div>

      {/* Password Change Form */}
      {!isForgotPassword ? (
        <div className="card mt-4">
          <div className="card-header">🔑 Change Password</div>
          <div className="card-body">
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handlePasswordChange}>
              <div className="mb-3">
                <label className="form-label">Old Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary w-100">Update Password</button>
            </form>

            {/* Forgot Password Option */}
            <div className="text-center mt-3">
              <button className="btn btn-link" onClick={() => setIsForgotPassword(true)}>
                Forgot Password?
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card mt-4">
          <div className="card-header">🔒 Forgot Password</div>
          <div className="card-body">
            {message && <div className="alert alert-success">{message}</div>}
            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleForgotPassword}>
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={forgotNewPassword}
                  onChange={(e) => setForgotNewPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-danger w-100">Reset Password</button>
            </form>

            <div className="text-center mt-3">
              <button className="btn btn-link" onClick={() => setIsForgotPassword(false)}>
                Back to Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
