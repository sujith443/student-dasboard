import React, { useState, useEffect } from "react";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    // Fetch data from the server
    axios.get("http://localhost:5000/notifications")
      .then((response) => {
        console.log("API Response:", response.data);
        setNotifications(response.data);
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
      })
      .finally(() => {
        setLoading(false); // Stop loading once data is fetched
      });
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">🔔 Notifications</h2>

      {/* Show loading indicator */}
      {loading && <div className="text-center"><span className="spinner-border text-primary"></span> Loading...</div>}

      {/* Show notifications if available */}
      {!loading && notifications.length > 0 ? (
        <div className="row">
          {notifications.map((note, index) => (
            <div key={index} className="col-md-6 mb-3">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">{note.message}</h5>
                  <p className="card-text text-muted"><small>📅 {note.date}</small></p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !loading && <div className="alert alert-info text-center">No new notifications</div>
      )}
    </div>
  );
};

export default Notifications;
