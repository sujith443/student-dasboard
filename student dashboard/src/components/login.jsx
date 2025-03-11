import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./Authentication";
import axios from "axios";

const Login = () => {
  const [hallTicketNumber, setHallTicketNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const userdata = await axios.post("http://localhost:5000/login", {
        hallTicketNumber,
        password,
      });
      
      if (userdata.data.message === "Login successful!") {
        console.log("userdata",userdata); // the data is coming from backend
        login(userdata); // Save user in context        
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(
        error.response?.data?.message || 
        "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card border-0 shadow-lg rounded-3 overflow-hidden">
              <div className="card-header bg-primary text-white text-center py-4">
                <img 
                  src="https://svitatp.ac.in/public/assets/admin/images/sitesetting/664263736b243_SVIT%20LOGO.png" 
                  alt="SVIT Logo" 
                  height="80" 
                  className="mb-3"
                />
                <h4 className="fw-bold mb-0">Student Dashboard</h4>
              </div>
              
              <div className="card-body p-4 p-md-5">
                <h5 className="card-title text-center mb-4 text-secondary fw-bold">Sign In to Your Account</h5>
                
                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
                
                <form onSubmit={handleSubmit}>
                  <div className="form-floating mb-3">
                    <input
                      type="text"
                      className="form-control"
                      id="hallTicketNumber"
                      placeholder="Enter hall ticket number"
                      value={hallTicketNumber}
                      onChange={(e) => setHallTicketNumber(e.target.value)}
                      required
                    />
                    <label htmlFor="hallTicketNumber">Hall Ticket Number</label>
                  </div>
                  
                  <div className="form-floating mb-4">
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <label htmlFor="password">Password</label>
                  </div>
                  
                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-lg fw-bold py-3"
                      disabled={loading}
                    >
                      {loading ? (
                        <span>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </span>
                      ) : (
                        "Sign In"
                      )}
                    </button>
                  </div>
                  
                  <div className="text-center mt-4">
                    <a href="#" className="text-decoration-none text-secondary">
                      Forgot your password?
                    </a>
                  </div>
                </form>
              </div>
              
              <div className="card-footer bg-light py-3 text-center">
                <small className="text-muted">
                  © {new Date().getFullYear()} SVIT Student Portal. All rights reserved.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;