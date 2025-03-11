import React, { useState } from "react";
import axios from "axios";

const Registration = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    branch: "",
    hallticketnumber: "",
    password: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:5000/register", formData);
      console.log("Response:", response.data);
      setMessage(response.data.message || "Registration successful!");
    } catch (error) {
      console.error("Error during registration:", error);
      setMessage(
        error.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="p-5 m-5" >
      <div className="login-container p-4 bg-white shadow rounded">
        <h2 className="login-title text-center mb-4">Student Registration Form</h2>
        {message && <div className="alert alert-info">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              placeholder="Enter your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className="form-control"
              placeholder="Enter your username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              type="text"
              id="phone"
              name="phone"
              className="form-control"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="branch" className="form-label">Branch</label>
            <input
              type="text"
              id="branch"
              name="branch"
              className="form-control"
              placeholder="Enter your branch"
              value={formData.branch}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="hallticketnumber" className="form-label">Hall Ticket</label>
            <input
              type="text"
              id="hallticketnumber"
              name="hallticketnumber"
              className="form-control"
              placeholder="Enter your hall ticket number"
              value={formData.hallticketnumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Register Student
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registration;
