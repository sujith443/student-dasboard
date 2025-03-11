import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import Notifications from "./components/Notifications";
import Attendance from "./components/Attendance";
import Timetable from "./components/Timetable";
import Fees from "./components/Fees";
import Marks from "./components/Marks";
import Login from "./components/Login";
import Registration from "./components/Registration";
import { AuthProvider } from "./components/Authentication";
import PrivateRoute from "./components/PrivateRoute";
import DashboardLayout from "./components/DashboardLayout";
import Header from "./components/header";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/registration" element={<Registration />} />

          {/* Private Routes Wrapped in Dashboard Layout */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <DashboardLayout />
              </PrivateRoute>
            }
          >
            <Route path="dashboard" element={<div><Header/><Dashboard/></div>} />
            <Route path="profile" element={<div><Header/><Profile /></div>} />
            <Route path="notifications" element={<div><Header/><Notifications /></div>} />
            <Route path="attendance" element={<div><Header/><Attendance /></div>} />
            <Route path="timetable" element={<div><Header/><Timetable /></div>} />
            <Route path="fees" element={<div><Header/><Fees /></div>} />
            <Route path="marks" element={<div><Header/><Marks /></div>} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
