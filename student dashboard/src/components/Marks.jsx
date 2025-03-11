import React, { useEffect, useState } from "react";
import { useAuth } from "./Authentication";
import apiService from "./apicallers";
import { Link } from "react-router-dom";

const Marks = () => {
  const { user } = useAuth();
  const hallticketnumber = user?.data?.user?.hallticketnumber || "";
  const [marksData, setMarksData] = useState({
    subjects: [],
    summary: null
  });
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
        if (data && data.subjects && data.summary) {
          setMarksData(data);
        } else {
          setError("Invalid data format received.");
        }
      })
      .catch((err) => {
        console.error("Error fetching marks:", err);
        setError("Failed to load marks.");
      })
      .finally(() => setLoading(false));
  }, [hallticketnumber]);

  console.log(marksData);
 
  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📚 Marks Summary</h2>

      {loading && (
        <div className="text-center">
          <span className="spinner-border text-primary"></span> Loading...
        </div>
      )}

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {!loading && !error && marksData.subjects.length > 0 ? (
        <>
          {/* Marks Table */}
          <div className="table-responsive mb-4">
            <table className="table table-striped table-bordered">
              <thead className="table-dark">
                <tr className="text-center">
                  <th>Subject</th>
                  <th>Internal Marks</th>
                  <th>External Marks</th>
                  <th>Total Marks</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {marksData.subjects.map((subject) => (
                  <tr key={subject.id} className="text-center">
                    <td>{subject.subject}</td>
                    <td>{subject.internal_marks}</td>
                    <td>{subject.external_marks}</td>
                    <td>{subject.total_marks}</td>
                    <td>
                      <span className={`badge ${getGradeBadgeClass(subject.grade)}`}>
                        {subject.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          {marksData.summary && (
            <div className="card mb-4">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">Performance Summary</h4>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <h5 className="card-title">Total Subjects</h5>
                        <p className="card-text fs-4">{marksData.summary.total_subjects}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <h5 className="card-title">Average Marks</h5>
                        <p className="card-text fs-4">{marksData.summary.average_marks}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <h5 className="card-title">Highest Marks</h5>
                        <p className="card-text fs-4">{marksData.summary.highest_marks.marks}</p>
                        <p className="card-text text-muted">{marksData.summary.highest_marks.subject}</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card bg-light">
                      <div className="card-body text-center">
                        <h5 className="card-title">Lowest Marks</h5>
                        <p className="card-text fs-4">{marksData.summary.lowest_marks.marks}</p>
                        <p className="card-text text-muted">{marksData.summary.lowest_marks.subject}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        !loading && <div className="alert alert-info text-center">No marks available.</div>
      )}

      <div className="text-center mt-4">
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
};

// Helper function to get appropriate badge class based on grade
const getGradeBadgeClass = (grade) => {
  switch (grade) {
    case 'A+':
    case 'A':
      return 'bg-success';
    case 'B+':
    case 'B':
      return 'bg-primary';
    case 'C+':
    case 'C':
      return 'bg-warning';
    default:
      return 'bg-secondary';
  }
};

export default Marks;