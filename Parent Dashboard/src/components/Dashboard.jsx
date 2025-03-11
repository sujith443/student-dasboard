import React, { useEffect, useState } from "react";
import { useAuth } from "./Authentication";
import { Link } from "react-router-dom";
import apiService from "./apicallers";

const Dashboard = () => {
  const { user } = useAuth();
  console.log("the user",user);
  
  const { id, name, hallticketnumber, branch, phone, email, semester, role } = user.user || {};

  // States for dashboard features
  const [notifications, setNotifications] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks] = useState([]);
  const [fees, setFees] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data when the component loads
  useEffect(() => {
    if (!hallticketnumber) return;
    
    setLoading(true);
    
    // Get notifications relevant to this student
    apiService.getNotifications("academic", branch)
      .then(data => setNotifications(data))
      .catch(console.error);
    
    // Get attendance for this semester
    apiService.getAttendance(hallticketnumber)
      .then(data => setAttendance(data))
      .catch(console.error);
    
    // Get fees
    apiService.getFees(hallticketnumber)
      .then(data => setFees(data))
      .catch(console.error);
    
    // Get marks
    apiService.getMarks(hallticketnumber, null, null, semester)
      .then(data => setMarks(data))
      .catch(console.error);
    
    // Get timetable for this student's branch and semester
    apiService.getTimetable(branch, null, semester)
      .then(data => {
        // Get current day of week
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        
        // Filter timetable to show today's classes
        const todaysClasses = data.filter(item => item.day === today);
        setTimetable(todaysClasses);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [hallticketnumber, branch, semester]);

  // Calculate attendance percentage
  const calculateAttendancePercentage = () => {
    if (attendance.length === 0) return "N/A";
    
    const latestAttendance = attendance[0]; // Assuming the latest is first
    if (!latestAttendance || !latestAttendance.percentage) return "N/A";
    
    return `${latestAttendance.percentage}%`;
  };

  if (loading) {
    return <div className="text-center my-5">Loading dashboard data...</div>;
  }

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">🎓 Welcome, {name}</h1>

      {/* First Row: Profile & Notifications */}
      <div className="row">
        {/* Profile Section */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">📌 Student Profile</div>
            <div className="card-body">
              <p><strong>Branch:</strong> {branch}</p>
              <p><strong>Hall Ticket:</strong> {hallticketnumber}</p>
              <p><strong>Email:</strong> {email}</p>
              <p><strong>Phone:</strong> {phone}</p>
              <p><strong>Semester:</strong> {semester}</p>
              <Link to="/profile" className="btn btn-primary mt-2">
                View Profile
              </Link>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">🔔 Notifications</div>
            <div className="card-body" style={{maxHeight: "250px", overflowY: "auto"}}>
              {notifications.length > 0 ? (
                <ul className="list-group list-group-flush">
                  {notifications.slice(0, 5).map((note, index) => (
                    <li key={index} className="list-group-item">
                      {note.message} - <span className="text-muted small">{new Date(note.date).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No new notifications</p>
              )}
            </div>
            <div className="card-footer">
              <Link to="/notifications" className="btn btn-primary">
                View All Notifications
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Today's Classes & Attendance */}
      <div className="row">
        {/* Today's Classes */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">🕒 Today's Classes</div>
            <div className="card-body">
              {timetable.length > 0 ? (
                <table className="table table-bordered">
                  <thead className="table-primary">
                    <tr>
                      <th>Period</th>
                      <th>Subject</th>
                      <th>Time</th>
                      <th>Teacher</th>
                    </tr>
                  </thead>
                  <tbody>
                    {timetable.map((record, index) => (
                      <tr key={index}>
                        <td>{record.period}</td>
                        <td>{record.subject}</td>
                        <td>{record.start_time} - {record.end_time}</td>
                        <td>{record.teacher}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No classes scheduled for today.</p>
              )}
              <Link to="/timetable" className="btn btn-primary mt-2">View Full Timetable</Link>
            </div>
          </div>
        </div>

        {/* Attendance Section */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">📅 Attendance Summary</div>
            <div className="card-body">
              <h3 className="text-center">{calculateAttendancePercentage()}</h3>
              <p className="text-center">Current Attendance</p>
              <div className="progress mb-3">
                <div 
                  className={`progress-bar ${parseFloat(calculateAttendancePercentage()) < 75 ? 'bg-danger' : 'bg-success'}`} 
                  role="progressbar" 
                  style={{width: calculateAttendancePercentage() !== "N/A" ? calculateAttendancePercentage() : "0%"}}
                  aria-valuenow={calculateAttendancePercentage() !== "N/A" ? parseFloat(calculateAttendancePercentage()) : 0}
                  aria-valuemin="0" 
                  aria-valuemax="100">
                  {calculateAttendancePercentage()}
                </div>
              </div>
              <Link to="/attendance" className="btn btn-primary mt-2">View Detailed Attendance</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Marks & Fees */}
      <div className="row">
        {/* Marks Section */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">📚 Recent Marks</div>
            <div className="card-body">
              {marks.length > 0 ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Exam</th>
                      <th>Marks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.slice(0, 5).map((mark, index) => (
                      <tr key={index}>
                        <td>{mark.subject}</td>
                        <td>{mark.exam_type}</td>
                        <td>{mark.marks}/{mark.max_marks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No marks available</p>
              )}
              <Link to="/marks" className="btn btn-primary">View All Marks</Link>
            </div>
          </div>
        </div>

        {/* Fees Section */}
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">💳 Fee Status</div>
            <div className="card-body">
              {fees.length > 0 ? (
                <>
                  <h5>Pending Fees</h5>
                  <ul className="list-group mb-3">
                    {fees.filter(fee => !fee.paid).map((fee, index) => (
                      <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                        {fee.fee_type}
                        <span className="badge bg-danger rounded-pill">₹{fee.amount}</span>
                      </li>
                    ))}
                    {fees.filter(fee => !fee.paid).length === 0 && (
                      <li className="list-group-item">No pending fees</li>
                    )}
                  </ul>
                </>
              ) : (
                <p>No fee information available</p>
              )}
              <Link to="/fees" className="btn btn-primary">Manage Fees</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;