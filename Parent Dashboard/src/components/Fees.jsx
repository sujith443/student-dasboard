import React, { useEffect, useState } from "react";
import { useAuth } from "./Authentication";
import apiService from "./apicallers";
import { Link } from "react-router-dom";

const Fees = () => {
  const { user } = useAuth();
  const hallticketnumber = user?.data?.user?.hallticketnumber || "";
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Fees Data using centralized API service
  useEffect(() => {
    if (!hallticketnumber) {
      setError("No Hall Ticket Number found.");
      setLoading(false);
      return;
    }
    apiService.getFees(hallticketnumber)
      .then((data) => {
        // Ensure data is an array (if a single object, convert it into an array)
        if (Array.isArray(data)) {
          setFees(data);
        } else if (data && typeof data === "object") {
          setFees([data]);
        } else {
          setFees([]);
        }
      })
      .catch((err) => {
        console.error("Error fetching fees:", err);
        setError("Failed to load fee details.");
      })
      .finally(() => setLoading(false));
  }, [hallticketnumber]);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">💳 Fee Details</h2>

      {loading && (
        <div className="text-center">
          <span className="spinner-border text-primary"></span> Loading...
        </div>
      )}

      {error && <div className="alert alert-danger text-center">{error}</div>}

      {!loading && !error && fees.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead className="table-dark">
              <tr className="text-center">
                <th>ID</th>
                <th>Total Fees</th>
                <th>Paid Date</th>
                <th>Pending Amount</th>
                <th>Amount Paid</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee, index) => (
                <tr key={index} className="text-center">
                  <td>{fee.id}</td>
                  <td>₹{fee.total_fees || "N/A"}</td>
                  <td>{fee.paid_date || "N/A"}</td>
                  <td>₹{fee.pending || "N/A"}</td>
                  <td>₹{(fee.total_fees || 0) - (fee.pending || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && <div className="alert alert-info text-center">No fee records available.</div>
      )}

      <div className="text-center mt-4">
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default Fees;
