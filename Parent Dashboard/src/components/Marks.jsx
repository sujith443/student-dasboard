import React, { useEffect, useState } from "react";
import { useAuth } from "./Authentication";
import apiService from "./apicallers";
import { Link } from "react-router-dom";

const Marks = () => {
  const { user } = useAuth();
  const hallticketnumber = user?.data?.user?.hallticketnumber || "";
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Marks Data using centralized API service
  useEffect(() => {
    if (!hallticketnumber) {
      setError("No Hall Ticket Number found.");
      setLoading(false);
      return;
    }
    apiService.getMarks(hallticketnumber)
      .then((data) => {
        // Ensure data is an array (if a single object, convert it into an array)
        if (Array.isArray(data)) {
          setMarks(data);
        } else if (data && typeof data === "object") {
          setMarks([data]);
        } else {
          setMarks([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching marks:", err);
        setError("Failed to load marks.");
      })
      .finally(() => setLoading(false));
  }, [hallticketnumber]);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📚 Marks</h2>

      {loading && (
        <div className="text-center">
          <span className="spinner-border text-primary"></span> Loading...
        </div>
      )}

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {!loading && !error && marks.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr className="text-center">
                <th>Subject</th>
                <th>Marks</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {marks.map((record, index) => (
                <tr key={index} className="text-center">
                  <td>{record.subject}</td>
                  <td>{record.marks}</td>
                  <td>100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <div className="alert alert-info text-center">No marks available.</div>
      )}

      <div className="text-center mt-4">
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default Marks;
