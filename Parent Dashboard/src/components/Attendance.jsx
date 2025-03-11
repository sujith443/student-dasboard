import React, { useEffect, useState } from "react";
import { useAuth } from "./Authentication"; // ✅ Correct Import
import apiService from "./apicallers"; // ✅ Correct Import

const Attendance = () => {
  const { user } = useAuth();
  const hallticketnumber = user?.data?.user?.hallticketnumber || ""; // Get student ID
  const [attendance, setAttendance] = useState([]); // Ensure it's an array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!hallticketnumber) {
      setError("No Hall Ticket Number found.");
      setLoading(false);
      return;
    }

    apiService
      .getAttendance(hallticketnumber)
      .then((data) => {
        // ✅ Ensure data is an array before setting state
        if (Array.isArray(data)) {
          setAttendance(data);
        } else if (typeof data === "object" && data !== null) {
          setAttendance([data]); // Convert single object into array
        } else {
          setAttendance([]); // Set empty array if no valid data
        }
      })
      .catch((err) => {
        console.error("Error fetching attendance:", err);
        setError("Failed to load attendance.");
      })
      .finally(() => setLoading(false));
  }, [hallticketnumber]);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📅 Attendance Record</h2>

      {/* ✅ Show Loading Indicator */}
      {loading && (
        <div className="text-center">
          <span className="spinner-border text-primary"></span> Loading...
        </div>
      )}

      {/* ✅ Show Error Message */}
      {error && <div className="alert alert-danger text-center">{error}</div>}

      {/* ✅ Show Attendance Data in a Table */}
      {!loading && !error && attendance.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-hover table-bordered">
            <thead className="table-primary">
              <tr className="text-center">
                <th>Month</th>
                <th>Total Classes</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Attendance %</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => (
                <tr key={index} className="text-center">
                  <td>{record.month || "N/A"}</td>
                  <td>{record.total ?? "N/A"}</td>
                  <td className="text-success fw-bold">{record.present ?? "N/A"}</td>
                  <td className="text-danger fw-bold">{record.absent ?? "N/A"}</td>
                  <td>
                    {record.total > 0
                      ? ((record.present / record.total) * 100).toFixed(2) + "%"
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <div className="alert alert-info text-center">No attendance records available.</div>
      )}
    </div>
  );
};

export default Attendance;
