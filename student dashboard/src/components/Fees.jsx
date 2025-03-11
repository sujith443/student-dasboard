import React, { useEffect, useState } from "react";
import { useAuth } from "./Authentication";
import apiService from "./apicallers";
import { Link } from "react-router-dom";

const Fees = () => {
  const { user } = useAuth();
  const hallticketnumber = user?.data?.user?.hallticketnumber || "";
  const [feesData, setFeesData] = useState(null);
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
        if (data && typeof data === "object") {
          setFeesData(data);
        } else {
          setError("Invalid data format received.");
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

      {!loading && !error && feesData && (
        <>
          {/* Summary Card */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row text-center">
                <div className="col-md-4 mb-2">
                  <h5>Total Amount</h5>
                  <h3>₹{feesData.summary.total_amount.toLocaleString()}</h3>
                </div>
                <div className="col-md-4 mb-2">
                  <h5>Amount Paid</h5>
                  <h3 className="text-success">₹{feesData.summary.total_paid.toLocaleString()}</h3>
                </div>
                <div className="col-md-4 mb-2">
                  <h5>Amount Due</h5>
                  <h3 className={feesData.summary.total_due > 0 ? "text-danger" : ""}>
                    ₹{feesData.summary.total_due.toLocaleString()}
                  </h3>
                </div>
              </div>
              
              <div className="progress mt-3" style={{ height: "10px" }}>
                <div
                  className="progress-bar bg-success"
                  role="progressbar"
                  style={{ width: `${(feesData.summary.total_paid / feesData.summary.total_amount) * 100}%` }}
                  aria-valuenow={(feesData.summary.total_paid / feesData.summary.total_amount) * 100}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              
              <div className="row text-center mt-3">
                <div className="col-md-4">
                  <span className="badge bg-success rounded-pill">
                    {feesData.summary.paid_items} Paid
                  </span>
                </div>
                <div className="col-md-4">
                  <span className="badge bg-warning rounded-pill">
                    {feesData.summary.partial_items} Partial
                  </span>
                </div>
                <div className="col-md-4">
                  <span className="badge bg-danger rounded-pill">
                    {feesData.summary.pending_items} Pending
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fee Details Table */}
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Fee Type</th>
                  <th>Amount</th>
                  <th>Paid</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Payment Date</th>
                </tr>
              </thead>
              <tbody>
                {feesData.fees.map((fee) => (
                  <tr key={fee.id}>
                    <td><strong>{fee.fee_type}</strong></td>
                    <td>₹{fee.amount.toLocaleString()}</td>
                    <td>₹{fee.paid.toLocaleString()}</td>
                    <td className={fee.due > 0 ? "text-danger" : ""}>
                      ₹{fee.due.toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge ${
                        fee.status === "Paid" ? "bg-success" : 
                        fee.status === "Partial" ? "bg-warning" : "bg-danger"
                      }`}>
                        {fee.status}
                      </span>
                    </td>
                    <td>{new Date(fee.payment_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Due Fees Alert (if any) */}
          {feesData.summary.total_due > 0 && (
            <div className="alert alert-warning mt-3">
              <strong>Note:</strong> You have ₹{feesData.summary.total_due.toLocaleString()} pending in fees. 
              Please make the payment before the due date to avoid late fees.
            </div>
          )}
        </>
      )}

      <div className="text-center mt-4">
        <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
      </div>
    </div>
  );
};

export default Fees;