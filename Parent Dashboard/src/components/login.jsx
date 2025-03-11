import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./Authentication";
import apiService from "./apicallers";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Use parent login endpoint
      const response = await apiService.parentLogin(username, password);
      login(response);
      
      // Navigate to parent dashboard
      navigate("/parent-dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="row justify-content-center mt-5">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header text-center">
              <h3>SVIT College Portal - Parent Login</h3>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}
              
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">
                    Parent Email
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Password:</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="d-grid">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-2"
                          role="status" aria-hidden="true"></span>
                        Logging in...
                      </span>
                    ) : (
                      "Login"
                    )}
                  </button>
                </div>
              </form>
              
              <div className="mt-3 text-center">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>
              
              <div className="mt-3 text-center">
                <p>
                  Don't have an account?{" "}
                  <Link to="/register">Register</Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;