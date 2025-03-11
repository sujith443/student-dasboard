import React, { useEffect, useState } from "react";
import { useAuth } from "./Authentication";
import { Link } from "react-router-dom";
import apiService from "./apicallers";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const Dashboard = () => {
  const { user, logout } = useAuth();
  console.log(user);
  const { name, hallticketnumber, branch, phone, email } =
    user?.data?.user || {};
  console.log(name, hallticketnumber, branch, phone, email);

  // States for dashboard features
  const [notifications, setNotifications] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [marks, setMarks] = useState([]);
  const [fees, setFees] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hallticketnumber) return; // Avoid API calls if hallticketnumber is missing

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [
          notificationsData,
          attendanceData,
          feesData,
          marksData,
          timetableData,
        ] = await Promise.all([
          apiService.getNotifications(),
          apiService.getAttendance(hallticketnumber),
          apiService.getFees(hallticketnumber),
          apiService.getMarks(hallticketnumber),
          apiService.getTimetable(),
        ]);

        // Log the data from the API before setting state
        console.log("API response - notifications:", notificationsData);
        console.log("API response - attendance:", attendanceData);
        console.log("the marks data", marksData);
        console.log("the feedata", typeof feesData);

        setNotifications(notificationsData);
        setAttendance(attendanceData);
        setFees(feesData);
        setMarks(marksData);
        setTimetable(timetableData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [hallticketnumber]);

  // Calculate today's classes from timetable
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayClasses = timetable.filter((item) => item.day === today);

  // Get priority notifications (assuming first 3 are most important)
  // Prepare attendance data for chart
  const attendanceChartData = attendance
    ? [
        { name: "Present", value: attendance.overall.present },
        { name: "Absent", value: attendance.overall.absent },
      ]
    : [];

  console.log(attendance);

  const COLORS = ["#4CAF50", "#F44336"];

  // Make sure marks is an array before using map
  const marksArray = marks?.subjects || [];
  const marksChartData = marksArray
    .map((item) => ({
      subject: item.subject,
      marks: item.total_marks,
    }))
    .slice(0, 5);
  console.log(marksChartData);

  console.log(marksArray);

  // Check if attendance is below 75%
  const isAttendanceLow =
    attendance &&
    (attendance?.overall.present / attendance?.overall.total) * 100 < 75;

  // Check for pending fees
  const feesArray = fees?.fees || [];
  let anyDues = 0;
  feesArray.forEach((x) => {
    console.log(x.due); // Debugging log
    anyDues += x.due || 0; // Ensure it handles undefined/null values
  });
  console.log(anyDues);
  console.log(feesArray);

  const hasPendingFees = feesArray.some((fee) => fee.due > 0);
  console.log(hasPendingFees);
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex">
      {/* Main Content */}
      <div className="container mt-4">
        <h1 className="text-center mb-4">🎓 Welcome, {name}</h1>

        {/* Alerts Section */}
        {(isAttendanceLow || hasPendingFees) && (
          <div className="alert alert-warning d-flex align-items-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="me-2"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <div>
              {isAttendanceLow &&
                "Your attendance is below 75%. Please attend classes regularly. "}
              {hasPendingFees && "You have pending fees to be paid. "}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h3>{attendance?.total || 0}</h3>
                <p className="mb-0">Total Classes</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h3>
                  {(
                    (attendance?.overall.present / attendance?.overall.total) *
                    100
                  ).toFixed(2) + "%"}
                </h3>
                <p className="mb-0">Attendance</p>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card bg-warning text-dark">
              <div className="card-body text-center">
                <h3>₹{anyDues}</h3>
                <p className="mb-0">Pending Fees</p>
              </div>
            </div>
          </div>
        </div>

        {/* First Row: Profile & Notifications */}
        <div className="row">
          {/* Profile Section */}
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Student Profile</span>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center mb-3">
                  <div
                    className="bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center"
                    style={{
                      width: "50px",
                      height: "50px",
                      fontSize: "1.5rem",
                    }}
                  >
                    {name?.charAt(0) || "S"}
                  </div>
                  <div>
                    <h5 className="mb-0">{name}</h5>
                    <p className="text-muted mb-0">{branch}</p>
                  </div>
                </div>
                <hr />
                <p>
                  <strong>Hall Ticket:</strong> {hallticketnumber}
                </p>
                <p>
                  <strong>Email:</strong> {email}
                </p>
                <p>
                  <strong>Phone:</strong> {phone}
                </p>
                <Link to="/profile" className="btn btn-primary mt-2">
                  View Profile
                </Link>
              </div>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span>Notifications</span>
              </div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((note, index) => (
                      <li
                        key={index}
                        className="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <p className="mb-0">{note.message}</p>
                        </div>
                        <span className="badge bg-primary rounded-pill">
                          {note.date}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li className="list-group-item">No new notifications</li>
                  )}
                </ul>
              </div>
              <div className="card-footer bg-white py-3 mt-2">
                <Link to="/notifications" className="btn btn-primary">
                  View All Notifications
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Today's Schedule */}
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>Today's Schedule</span>
              </div>
              <div className="card-body">
                {todayClasses.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Subject</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todayClasses.map((cls, index) => (
                          <tr key={index}>
                            <td>{cls.subject}</td>
                            <td>
                              {cls.start_time} - {cls.end_time}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center py-3">
                    No classes scheduled for today
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <span>Attendance Overview</span>
              </div>
              <div className="card-body d-flex flex-column align-items-center justify-content-center">
                {attendance && (
                  <>
                    <div style={{ width: "100%", height: 200 }}>
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={attendanceChartData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {attendanceChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3 text-center">
                      <p>
                        <strong>Present:</strong> {attendance.present} classes
                        <span className="ms-3">
                          <strong>Absent:</strong> {attendance.absent} classes
                        </span>
                      </p>
                      <Link to="/attendance" className="btn btn-primary mt-2">
                        View Attendance
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          {/* Marks with Chart */}
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-2"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
                <span>Academic Performance</span>
              </div>
              <div className="card-body">
                {
                  <>
                    <div style={{ width: "100%", height: 200 }}>
                      <ResponsiveContainer>
                        <BarChart data={marksChartData}>
                          <XAxis dataKey="subject" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Bar dataKey="marks" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-3">
                      <Link to="/marks" className="btn btn-primary d-block">
                        View All Marks
                      </Link>
                    </div>
                  </>
                }
              </div>
            </div>
          </div>

          {/* Fees Section with visual elements */}
          <div className="col-md-6">
            <div className="card mb-4">
              <div className="card-header d-flex align-items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-2"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                  <line x1="1" y1="10" x2="23" y2="10"></line>
                </svg>
                <span>Fee Status</span>
              </div>
              <div className="card-body">
                {feesArray.length > 0 ? (
                  <>
                    <div className="row text-center mb-3">
                      <div className="col-md-4">
                        <h6>Total Fees</h6>
                        <h4>
                          ₹
                          {feesArray
                            .reduce((sum, item) => sum + item.amount, 0)
                            .toLocaleString()}
                        </h4>
                      </div>
                      <div className="col-md-4">
                        <h6>Paid</h6>
                        <h4>
                          ₹
                          {feesArray
                            .reduce((sum, item) => sum + item.paid, 0)
                            .toLocaleString()}
                        </h4>
                      </div>
                      <div className="col-md-4">
                        <h6>Due</h6>
                        <h4
                          className={
                            feesArray.some((item) => item.due > 0)
                              ? "text-danger"
                              : ""
                          }
                        >
                          ₹
                          {feesArray
                            .reduce((sum, item) => sum + item.due, 0)
                            .toLocaleString()}
                        </h4>
                      </div>
                    </div>

                    <div className="progress mb-3" style={{ height: "8px" }}>
                      <div
                        className="progress-bar bg-success"
                        role="progressbar"
                        style={{
                          width: `${
                            (feesArray.reduce(
                              (sum, item) => sum + item.paid,
                              0
                            ) /
                              feesArray.reduce(
                                (sum, item) => sum + item.amount,
                                0
                              )) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>

                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Fee Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feesArray.map((fee) => (
                            <tr key={fee.id}>
                              <td>{fee.fee_type}</td>
                              <td>₹{fee.amount.toLocaleString()}</td>
                              <td>
                                <span
                                  className={`badge ${
                                    fee.status === "Paid"
                                      ? "bg-success"
                                      : fee.status === "Partial"
                                      ? "bg-warning"
                                      : "bg-danger"
                                  }`}
                                >
                                  {fee.status}
                                </span>
                                {fee.due > 0 && (
                                  <small className="ms-1 text-danger">
                                    (₹{fee.due.toLocaleString()} due)
                                  </small>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <Link to="/fees" className="btn btn-sm btn-primary mt-2">
                      View Details
                    </Link>
                  </>
                ) : (
                  <p className="text-center py-2">
                    No fee information available
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="text-center mt-4 mb-4">
          <button className="btn btn-danger" onClick={logout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="me-2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
