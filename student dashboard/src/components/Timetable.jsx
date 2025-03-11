import React, { useState, useEffect } from "react";
import { useAuth } from "./Authentication"; // Import useAuth
import apiService from "./apicallers"; // Import centralized API service

const Timetable = () => {
  const { user } = useAuth();
  const hallticketnumber = user?.data?.user?.hallticketnumber || ""; // Get student ID

  const [timetable, setTimetable] = useState([]); // Stores timetable data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [searchQuery, setSearchQuery] = useState(""); // Search input

  useEffect(() => {
    if (!hallticketnumber) {
      setError("No Hall Ticket Number found.");
      setLoading(false);
      return;
    }

    apiService
      .getTimetable()
      .then((data) => {
        if (Array.isArray(data)) {
          setTimetable(data);
        } else {
          setTimetable([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching timetable:", err);
        setError("Failed to load timetable.");
      })
      .finally(() => setLoading(false));
  }, [hallticketnumber]);

  // ✅ Filter timetable based on search query
  const filteredTimetable = timetable.filter((record) =>
    record.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">🕒 Weekly Timetable</h2>

      {/* 📌 Search Bar */}
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="🔍 Search subject..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* 📌 Error Handling */}
      {error && <div className="alert alert-danger text-center">{error}</div>}
      
      {/* 📌 Loading State */}
      {loading && <div className="alert alert-info text-center">Loading timetable...</div>}

      {/* 📌 Timetable Table */}
      {!loading && !error && (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr>
                <th>Day</th>
                <th>Subject</th>
                <th>Start Time</th>
                <th>End Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredTimetable.length > 0 ? (
                filteredTimetable.map((record, index) => (
                  <tr key={index}>
                    <td>{record.day}</td>
                    <td>{record.subject}</td>
                    <td>{record.start_time}</td>
                    <td>{record.end_time}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center">
                    No matching subjects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Timetable;
