import React, { useEffect, useState } from "react";
import { useAuth } from "./Authentication";
import { Link } from "react-router-dom";
import apiService from "./apicallers";

const ParentDashboard = () => {
  const { user } = useAuth();
  const { id, name, email, student, unreadNotifications } = user.parent || {};

  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!student?.hallticketnumber) return;
    
    setLoading(true);
    
    // Get parent dashboard summary
    apiService.getParentDashboard(student.hallticketnumber)
      .then(data => setDashboardData(data))
      .catch(console.error);
    
    // Get parent notifications
    apiService.getParentNotifications(id)
      .then(data => setNotifications(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id, student?.hallticketnumber]);

  if (loading) {
    return <div className="text-center my-5">Loading dashboard data...</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">👨‍👩‍👧‍👦 Parent Dashboard</h1>
      
      {/* Notification Badge */}
      {unreadNotifications > 0 && (
        <div className="alert alert-info text-center">
          You have {unreadNotifications} unread notification{unreadNotifications > 1 ? 's' : ''}
          <Link to="/parent-notifications" className="btn btn-sm btn-primary ms-3">
            View Notifications
          </Link>
        </div>
      )}

      {/* Parent & Student Info Row */}
      <div className="row">
        {/* Parent Info */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">👤 Parent Information</div>
            <div className="card-body">
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Relation:</strong> {user.parent?.relation || "Parent"}</p>
              <Link to="/parent-profile" className="btn btn-primary mt-2">
                Manage Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">🧑‍🎓 Student Information</div>
            <div className="card-body">
              {student ? (
                <>
                  <p><strong>Name:</strong> {student.name}</p>
                  <p><strong>Hall Ticket:</strong> {student.hallticketnumber}</p>
                  <p><strong>Branch:</strong> {student.branch}</p>
                  <p><strong>Semester:</strong> {student.semester || "N/A"}</p>
                </>
              ) : (
                <p>Student information not available</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Academic Summary */}
      {dashboardData && (
        <div className="row">
          {/* Attendance Summary */}
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header">📅 Attendance</div>
              <div className="card-body text-center">
                {dashboardData.latestAttendance ? (
                  <>
                    <h3 className={dashboardData.latestAttendance.percentage < 75 ? "text-danger" : "text-success"}>
                      {dashboardData.latestAttendance.percentage}%
                    </h3>
                    <p>Month: {dashboardData.latestAttendance.month}</p>
                    <div className="progress mb-3">
                      <div 
                        className={`progress-bar ${dashboardData.latestAttendance.percentage < 75 ? 'bg-danger' : 'bg-success'}`} 
                        role="progressbar" 
                        style={{width: `${dashboardData.latestAttendance.percentage}%`}}>
                        {dashboardData.latestAttendance.percentage}%
                      </div>
                    </div>
                  </>
                ) : (
                  <p>No attendance data available</p>
                )}
                <Link to="/parent/attendance" className="btn btn-primary mt-2">View Details</Link>
              </div>
            </div>
          </div>

          {/* Fees Summary */}
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header">💰 Fee Status</div>
              <div className="card-body text-center">
                {dashboardData.unpaidFeesCount > 0 ? (
                  <>
                    <h3 className="text-danger">{dashboardData.unpaidFeesCount}</h3>
                    <p>Unpaid Fee Items</p>
                    <Link to="/parent/fees" className="btn btn-danger mt-2">Pay Now</Link>
                  </>
                ) : (
                  <>
                    <h3 className="text-success">All Paid</h3>
                    <p>No pending fees</p>
                    <Link to="/parent/fees" className="btn btn-primary mt-2">View History</Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="col-md-4">
            <div className="card mb-4">
              <div className="card-header">📊 Academic Performance</div>
              <div className="card-body">
                {dashboardData.subjectMarks && dashboardData.subjectMarks.length > 0 ? (
                  <ul className="list-group">
                    {dashboardData.subjectMarks.map((subject, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {subject.subject}
                        <span className={`badge ${(subject.marks / subject.max_marks * 100) >= 60 ? 'bg-success' : 'bg-warning'} rounded-pill`}>
                          {subject.marks}/{subject.max_marks}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center">No marks data available</p>
                )}
                <div className="text-center">
                  <Link to="/parent/performance" className="btn btn-primary mt-3">Full Report</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Notifications & Contact Teachers */}
      <div className="row">
        {/* Recent Notifications */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">🔔 Recent Notifications</div>
            <div className="card-body" style={{maxHeight: "250px", overflowY: "auto"}}>
              {notifications.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {notifications.slice(0, 5).map((note, index) => (
                    <li key={index} className={`list-group-item ${!note.is_read ? 'list-group-item-warning' : ''}`}>
                      {note.message}
                      <div className="small text-muted mt-1">
                        {new Date(note.date).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No notifications</p>
              )}
            </div>
            <div className="card-footer">
              <Link to="/parent-notifications" className="btn btn-primary">
                View All Notifications
              </Link>
            </div>
          </div>
        </div>

        {/* Contact Teachers */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">✉️ Contact Teachers</div>
            <div className="card-body">
              <p>Have questions about your child's performance or behavior?</p>
              <p>You can send messages to teachers through our messaging system.</p>
              <Link to="/parent-messages" className="btn btn-primary mt-3">
                Open Messaging
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;