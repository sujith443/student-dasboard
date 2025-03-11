import React, { useEffect, useState } from "react";
import { useAuth } from "./Authentication";
import apiService from "./apicallers";

const Attendance = () => {
  const { user } = useAuth();
  const hallticketnumber = user?.data?.user?.hallticketnumber || "";
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overall");

  useEffect(() => {
    if (!hallticketnumber) {
      setError("No Hall Ticket Number found.");
      setLoading(false);
      return;
    }

    apiService
      .getAttendance(hallticketnumber)
      .then((data) => {
        if (data && typeof data === "object") {
          setAttendanceData(data);
        } else {
          setError("Invalid data format received.");
        }
      })
      .catch((err) => {
        console.error("Error fetching attendance:", err);
        setError("Failed to load attendance.");
      })
      .finally(() => setLoading(false));
  }, [hallticketnumber]);

  const getStatusColor = (percentage) => {
    if (percentage >= 75) return "success";
    if (percentage >= 60) return "warning";
    return "danger";
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📅 Attendance Summary</h2>

      {loading && (
        <div className="text-center">
          <span className="spinner-border text-primary"></span> Loading...
        </div>
      )}

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {!loading && !error && attendanceData && (
        <>
          {/* Overall Summary Card */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row text-center">
                <div className="col-3">
                  <h5>Total Classes</h5>
                  <h3>{attendanceData.overall.total}</h3>
                </div>
                <div className="col-3">
                  <h5>Present</h5>
                  <h3 className="text-success">{attendanceData.overall.present}</h3>
                </div>
                <div className="col-3">
                  <h5>Absent</h5>
                  <h3 className="text-danger">{attendanceData.overall.absent}</h3>
                </div>
                <div className="col-3">
                  <h5>Overall</h5>
                  <h3 className={`text-${getStatusColor(attendanceData.overall.percentage)}`}>
                    {attendanceData.overall.percentage}%
                  </h3>
                </div>
              </div>
              <div className="progress mt-3" style={{ height: "10px" }}>
                <div
                  className={`progress-bar bg-${getStatusColor(attendanceData.overall.percentage)}`}
                  role="progressbar"
                  style={{ width: `${attendanceData.overall.percentage}%` }}
                  aria-valuenow={attendanceData.overall.percentage}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <ul className="nav nav-tabs mb-3">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "overall" ? "active" : ""}`}
                onClick={() => setActiveTab("overall")}
              >
                Monthly Overview
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === "subjects" ? "active" : ""}`}
                onClick={() => setActiveTab("subjects")}
              >
                Subject-wise
              </button>
            </li>
          </ul>

          {/* Monthly Overview Table */}
          {activeTab === "overall" && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Month</th>
                    <th>Classes</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Percentage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.monthly.map((month, index) => (
                    <tr key={index}>
                      <td><strong>{month.month}</strong></td>
                      <td>{month.total}</td>
                      <td>{month.present}</td>
                      <td>{month.absent}</td>
                      <td>{month.percentage}%</td>
                      <td>
                        <span className={`badge bg-${getStatusColor(month.percentage)}`}>
                          {month.percentage >= 75 ? "Good" : month.percentage >= 60 ? "Warning" : "Low"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Subject-wise Table */}
          {activeTab === "subjects" && (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Subject</th>
                    <th>Classes</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Percentage</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.subjects.map((subject, index) => (
                    <tr key={index}>
                      <td><strong>{subject.subject}</strong></td>
                      <td>{subject.total}</td>
                      <td>{subject.present}</td>
                      <td>{subject.absent}</td>
                      <td>{subject.percentage}%</td>
                      <td>
                        <span className={`badge bg-${getStatusColor(subject.percentage)}`}>
                          {subject.percentage >= 75 ? "Good" : subject.percentage >= 60 ? "Warning" : "Low"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Attendance;