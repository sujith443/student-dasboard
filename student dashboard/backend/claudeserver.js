const express = require("express");
const cors = require("cors");
const db = require("./database"); // Using the optimized database.js
const { body, param, validationResult } = require("express-validator");
const path = require("path");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const compression = require("compression");
const { subMonths, format } = require("date-fns");
const morgan = require("morgan");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan("dev")); // Request logging

// Static files folder (for future use)
app.use('/static', express.static(path.join(__dirname, 'public')));

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later"
});
app.use("/api/", apiLimiter);

// Input validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

// API response helper
const sendResponse = (res, status, success, data, message = null) => {
  const response = { success };
  if (message) response.message = message;
  if (data) response.data = data;
  return res.status(status).json(response);
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  sendResponse(res, 500, false, null, "Internal server error");
});

// ======== AUTHENTICATION ROUTES ========

// Register new user
app.post("/api/auth/register", [
  body("name").notEmpty().withMessage("Name is required"),
  body("username").notEmpty().withMessage("Username is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("branch").notEmpty().withMessage("Branch is required"),
  body("hallticketnumber").notEmpty().withMessage("Hall ticket number is required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
], validate, (req, res) => {
  const { name, username, email, phone, branch, hallticketnumber, password } = req.body;
  
  const sql = `INSERT INTO users (name, username, email, phone, branch, hallticketnumber, password) 
               VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(sql, [name, username, email, phone, branch, hallticketnumber, password], function(err) {
    if (err) {
      if (err.message.includes("UNIQUE constraint failed")) {
        return sendResponse(res, 409, false, null, "User already exists with this email, username, or hall ticket number");
      }
      return sendResponse(res, 500, false, null, "Registration failed: " + err.message);
    }
    
    sendResponse(res, 201, true, { userId: this.lastID }, "Registration successful");
  });
});

// Login user
app.post("/api/auth/login", [
  body("hallticketnumber").notEmpty().withMessage("Hall ticket number is required"),
  body("password").notEmpty().withMessage("Password is required")
], validate, (req, res) => {
  const { hallticketnumber, password } = req.body;
  
  db.get(
    "SELECT id, name, username, email, phone, branch, hallticketnumber, profile_image FROM users WHERE hallticketnumber = ? AND password = ?",
    [hallticketnumber, password],
    (err, user) => {
      if (err) return sendResponse(res, 500, false, null, "Login failed: " + err.message);
      if (!user) return sendResponse(res, 401, false, null, "Invalid credentials");
      
      sendResponse(res, 200, true, { user }, "Login successful");
    }
  );
});

// Change password
app.put("/api/auth/update-password", [
  body("hallticketnumber").notEmpty().withMessage("Hall ticket number is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("oldPassword").notEmpty().withMessage("Old password is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
], validate, (req, res) => {
  const { hallticketnumber, email, oldPassword, newPassword } = req.body;
  
  db.get(
    "SELECT id FROM users WHERE hallticketnumber = ? AND email = ? AND password = ?",
    [hallticketnumber, email, oldPassword],
    (err, user) => {
      if (err) return sendResponse(res, 500, false, null, "Database error: " + err.message);
      if (!user) return sendResponse(res, 401, false, null, "Invalid credentials");
      
      db.run(
        "UPDATE users SET password = ? WHERE hallticketnumber = ? AND email = ?",
        [newPassword, hallticketnumber, email],
        function(err) {
          if (err) return sendResponse(res, 500, false, null, "Password update failed: " + err.message);
          
          sendResponse(res, 200, true, null, "Password updated successfully");
        }
      );
    }
  );
});

// Reset password (forgot password)
app.post("/api/auth/forgot-password", [
  body("hallticketnumber").notEmpty().withMessage("Hall ticket number is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("newPassword").isLength({ min: 6 }).withMessage("New password must be at least 6 characters")
], validate, (req, res) => {
  const { hallticketnumber, email, newPassword } = req.body;
  
  db.get(
    "SELECT id FROM users WHERE hallticketnumber = ? AND email = ?",
    [hallticketnumber, email],
    (err, user) => {
      if (err) return sendResponse(res, 500, false, null, "Database error: " + err.message);
      if (!user) return sendResponse(res, 404, false, null, "User not found");
      
      db.run(
        "UPDATE users SET password = ? WHERE hallticketnumber = ? AND email = ?",
        [newPassword, hallticketnumber, email],
        function(err) {
          if (err) return sendResponse(res, 500, false, null, "Password reset failed: " + err.message);
          
          sendResponse(res, 200, true, null, "Password reset successfully");
        }
      );
    }
  );
});

// ======== USER PROFILE ROUTES ========

// Get user profile
app.get("/api/profile/:hallticketnumber", [
  param("hallticketnumber").notEmpty().withMessage("Hall ticket number is required")
], validate, (req, res) => {
  const { hallticketnumber } = req.params;
  
  db.get(
    "SELECT id, name, username, email, phone, branch, hallticketnumber, profile_image FROM users WHERE hallticketnumber = ?",
    [hallticketnumber],
    (err, user) => {
      if (err) return sendResponse(res, 500, false, null, "Failed to fetch profile: " + err.message);
      if (!user) return sendResponse(res, 404, false, null, "User not found");
      
      sendResponse(res, 200, true, { user });
    }
  );
});

// Update user profile
app.put("/api/profile/:hallticketnumber", [
  param("hallticketnumber").notEmpty().withMessage("Hall ticket number is required"),
  body("name").optional(),
  body("phone").optional(),
  body("email").optional().isEmail().withMessage("Valid email is required")
], validate, (req, res) => {
  const { hallticketnumber } = req.params;
  const { name, phone, email } = req.body;
  
  // Build dynamic SQL update based on provided fields
  const updates = [];
  const params = [];
  
  if (name) {
    updates.push("name = ?");
    params.push(name);
  }
  
  if (phone) {
    updates.push("phone = ?");
    params.push(phone);
  }
  
  if (email) {
    updates.push("email = ?");
    params.push(email);
  }
  
  if (updates.length === 0) {
    return sendResponse(res, 400, false, null, "No fields to update");
  }
  
  params.push(hallticketnumber);
  
  db.run(
    `UPDATE users SET ${updates.join(", ")} WHERE hallticketnumber = ?`,
    params,
    function(err) {
      if (err) {
        if (err.message.includes("UNIQUE constraint failed")) {
          return sendResponse(res, 409, false, null, "Email already in use");
        }
        return sendResponse(res, 500, false, null, "Profile update failed: " + err.message);
      }
      
      if (this.changes === 0) {
        return sendResponse(res, 404, false, null, "User not found");
      }
      
      sendResponse(res, 200, true, null, "Profile updated successfully");
    }
  );
});

// ======== ACADEMIC ROUTES ========

// Get attendance for a student
app.get("/api/attendance/:hallticketnumber", [
  param("hallticketnumber").notEmpty().withMessage("Hall ticket number is required")
], validate, (req, res) => {
  const { hallticketnumber } = req.params;
  const { month } = req.query;
  
  let sql = `
    SELECT a.*, s.name as subject_name, s.code as subject_code 
    FROM attendance a
    JOIN subjects s ON a.subject_id = s.id
    WHERE a.student_id = ?
  `;
  
  const params = [hallticketnumber];
  
  if (month) {
    sql += " AND a.month = ?";
    params.push(month);
  }
  
  db.all(sql, params, (err, rows) => {
    if (err) return sendResponse(res, 500, false, null, "Failed to fetch attendance: " + err.message);
    
    // Calculate attendance percentage and aggregate by subject if no month specified
    let attendanceData = rows;
    
    if (!month) {
      // Group by subject and calculate averages
      const subjectMap = {};
      
      rows.forEach(row => {
        if (!subjectMap[row.subject_id]) {
          subjectMap[row.subject_id] = {
            subject_id: row.subject_id,
            subject_name: row.subject_name,
            subject_code: row.subject_code,
            total: 0,
            present: 0,
            absent: 0,
            monthly_data: []
          };
        }
        
        subjectMap[row.subject_id].total += row.total;
        subjectMap[row.subject_id].present += row.present;
        subjectMap[row.subject_id].absent += row.absent;
        subjectMap[row.subject_id].monthly_data.push({
          month: row.month,
          total: row.total,
          present: row.present,
          absent: row.absent,
          percentage: ((row.present / row.total) * 100).toFixed(2)
        });
      });
      
      attendanceData = Object.values(subjectMap).map(subject => ({
        ...subject,
        percentage: ((subject.present / subject.total) * 100).toFixed(2)
      }));
    }
    
    // Calculate overall attendance
    let overallTotal = 0;
    let overallPresent = 0;
    
    rows.forEach(row => {
      overallTotal += row.total;
      overallPresent += row.present;
    });
    
    const overallPercentage = overallTotal > 0 ? ((overallPresent / overallTotal) * 100).toFixed(2) : 0;
    
    sendResponse(res, 200, true, { 
      attendance: attendanceData,
      overall: {
        total: overallTotal,
        present: overallPresent,
        absent: overallTotal - overallPresent,
        percentage: overallPercentage
      }
    });
  });
});

// Get marks for a student
app.get("/api/marks/:hallticketnumber", [
  param("hallticketnumber").notEmpty().withMessage("Hall ticket number is required")
], validate, (req, res) => {
  const { hallticketnumber } = req.params;
  
  db.all(`
    SELECT m.*, s.name as subject_name, s.code as subject_code 
    FROM marks m
    JOIN subjects s ON m.subject_id = s.id
    WHERE m.student_id = ?
    ORDER BY m.subject_id, m.exam_type
  `, [hallticketnumber], (err, rows) => {
    if (err) return sendResponse(res, 500, false, null, "Failed to fetch marks: " + err.message);
    
    // Group marks by subject
    const subjectMap = {};
    
    rows.forEach(row => {
      if (!subjectMap[row.subject_id]) {
        subjectMap[row.subject_id] = {
          subject_id: row.subject_id,
          subject_name: row.subject_name,
          subject_code: row.subject_code,
          exams: []
        };
      }
      
      subjectMap[row.subject_id].exams.push({
        exam_type: row.exam_type,
        marks: row.marks,
        max_marks: row.max_marks,
        percentage: ((row.marks / row.max_marks) * 100).toFixed(2),
        exam_date: row.exam_date
      });
    });
    
    // Calculate total marks for each subject
    const marksData = Object.values(subjectMap).map(subject => {
      let totalMarks = 0;
      let totalMaxMarks = 0;
      
      subject.exams.forEach(exam => {
        totalMarks += exam.marks;
        totalMaxMarks += exam.max_marks;
      });
      
      return {
        ...subject,
        total_marks: totalMarks,
        total_max_marks: totalMaxMarks,
        percentage: ((totalMarks / totalMaxMarks) * 100).toFixed(2)
      };
    });
    
    // Calculate overall performance
    let overallMarks = 0;
    let overallMaxMarks = 0;
    
    rows.forEach(row => {
      overallMarks += row.marks;
      overallMaxMarks += row.max_marks;
    });
    
    const overallPercentage = overallMaxMarks > 0 ? ((overallMarks / overallMaxMarks) * 100).toFixed(2) : 0;
    
    sendResponse(res, 200, true, { 
      marks: marksData,
      overall: {
        total_marks: overallMarks,
        total_max_marks: overallMaxMarks,
        percentage: overallPercentage
      }
    });
  });
});

// Get timetable
app.get("/api/timetable", [
  body("branch").optional(),
  body("semester").optional()
], validate, (req, res) => {
  const { branch, semester } = req.query;
  
  let sql = `
    SELECT t.*, s.name as subject_name, s.code as subject_code 
    FROM timetable t
    LEFT JOIN subjects s ON t.subject_id = s.id
  `;
  
  const params = [];
  const conditions = [];
  
  if (branch) {
    conditions.push("t.branch = ?");
    params.push(branch);
  }
  
  if (semester) {
    conditions.push("t.semester = ?");
    params.push(semester);
  }
  
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  
  sql += " ORDER BY CASE t.day " +
         "WHEN 'Monday' THEN 1 " +
         "WHEN 'Tuesday' THEN 2 " +
         "WHEN 'Wednesday' THEN 3 " +
         "WHEN 'Thursday' THEN 4 " +
         "WHEN 'Friday' THEN 5 " +
         "WHEN 'Saturday' THEN 6 " +
         "ELSE 7 END, t.period";
  
  db.all(sql, params, (err, rows) => {
    if (err) return sendResponse(res, 500, false, null, "Failed to fetch timetable: " + err.message);
    
    // Organize timetable by day and period
    const timetableByDay = {};
    
    rows.forEach(row => {
      if (!timetableByDay[row.day]) {
        timetableByDay[row.day] = {};
      }
      
      timetableByDay[row.day][row.period] = {
        subject_id: row.subject_id,
        subject_name: row.subject_name || "Free Period",
        subject_code: row.subject_code || "-",
        room_number: row.room_number,
        start_time: row.start_time,
        end_time: row.end_time
      };
    });
    
    sendResponse(res, 200, true, { timetable: timetableByDay });
  });
});

// Get fees for a student
app.get("/api/fees/:hallticketnumber", [
  param("hallticketnumber").notEmpty().withMessage("Hall ticket number is required")
], validate, (req, res) => {
  const { hallticketnumber } = req.params;
  
  db.all(`
    SELECT * FROM fees 
    WHERE student_id = ? 
    ORDER BY academic_year DESC, semester DESC
  `, [hallticketnumber], (err, rows) => {
    if (err) return sendResponse(res, 500, false, null, "Failed to fetch fees: " + err.message);
    
    // Group fees by academic year and semester
    const feesByYearSem = {};
    
    rows.forEach(row => {
      const key = `${row.academic_year}_${row.semester}`;
      
      if (!feesByYearSem[key]) {
        feesByYearSem[key] = {
          academic_year: row.academic_year,
          semester: row.semester,
          fees: [],
          total_amount: 0,
          total_paid: 0,
          total_due: 0
        };
      }
      
      const due = row.amount - row.paid_amount;
      
      feesByYearSem[key].fees.push({
        id: row.id,
        fee_type: row.fee_type,
        amount: row.amount,
        paid_amount: row.paid_amount,
        due_amount: due,
        due_date: row.due_date,
        payment_status: row.payment_status,
        payment_date: row.payment_date,
        transaction_id: row.transaction_id
      });
      
      feesByYearSem[key].total_amount += row.amount;
      feesByYearSem[key].total_paid += row.paid_amount;
      feesByYearSem[key].total_due += due;
    });
    
    const feesData = Object.values(feesByYearSem);
    
    // Calculate overall fee statistics
    let totalAmount = 0;
    let totalPaid = 0;
    
    rows.forEach(row => {
      totalAmount += row.amount;
      totalPaid += row.paid_amount;
    });
    
    sendResponse(res, 200, true, { 
      fees: feesData,
      overall: {
        total_amount: totalAmount,
        total_paid: totalPaid,
        total_due: totalAmount - totalPaid,
        payment_progress: totalAmount > 0 ? ((totalPaid / totalAmount) * 100).toFixed(2) : 0
      }
    });
  });
});

// Get notifications
app.get("/api/notifications", (req, res) => {
  const { category, limit = 10 } = req.query;
  
  let sql = "SELECT * FROM notifications";
  const params = [];
  
  if (category) {
    sql += " WHERE category = ?";
    params.push(category);
  }
  
  sql += " ORDER BY priority DESC, date DESC LIMIT ?";
  params.push(parseInt(limit));
  
  db.all(sql, params, (err, rows) => {
    if (err) return sendResponse(res, 500, false, null, "Failed to fetch notifications: " + err.message);
    
    sendResponse(res, 200, true, { notifications: rows });
  });
});

// Get assignments for a student's branch and semester
app.get("/api/assignments", (req, res) => {
  const { branch, semester } = req.query;
  
  let sql = `
    SELECT a.*, s.name as subject_name, s.code as subject_code 
    FROM assignments a
    JOIN subjects s ON a.subject_id = s.id
  `;
  
  const params = [];
  const conditions = [];
  
  if (branch) {
    conditions.push("a.branch = ?");
    params.push(branch);
  }
  
  if (semester) {
    conditions.push("a.semester = ?");
    params.push(semester);
  }
  
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  
  sql += " ORDER BY a.due_date ASC";
  
  db.all(sql, params, (err, rows) => {
    if (err) return sendResponse(res, 500, false, null, "Failed to fetch assignments: " + err.message);
    
    sendResponse(res, 200, true, { assignments: rows });
  });
});

// Get assignment submissions for a student
app.get("/api/assignment-submissions/:hallticketnumber", [
  param("hallticketnumber").notEmpty().withMessage("Hall ticket number is required")
], validate, (req, res) => {
  const { hallticketnumber } = req.params;
  
  db.all(`
    SELECT s.*, a.title as assignment_title, a.description as assignment_description, 
           a.due_date, a.max_marks, sub.name as subject_name, sub.code as subject_code
    FROM assignment_submissions s
    JOIN assignments a ON s.assignment_id = a.id
    JOIN subjects sub ON a.subject_id = sub.id
    WHERE s.student_id = ?
    ORDER BY s.submission_date DESC
  `, [hallticketnumber], (err, rows) => {
    if (err) return sendResponse(res, 500, false, null, "Failed to fetch submissions: " + err.message);
    
    sendResponse(res, 200, true, { submissions: rows });
  });
});

// Submit an assignment
app.post("/api/assignment-submissions", [
  body("student_id").notEmpty().withMessage("Student ID is required"),
  body("assignment_id").notEmpty().withMessage("Assignment ID is required")
], validate, (req, res) => {
  const { student_id, assignment_id, file_path } = req.body;
  const submission_date = new Date().toISOString().split('T')[0];
  
  // Check if assignment exists and is not past due date
  db.get("SELECT * FROM assignments WHERE id = ?", [assignment_id], (err, assignment) => {
    if (err) return sendResponse(res, 500, false, null, "Database error: " + err.message);
    if (!assignment) return sendResponse(res, 404, false, null, "Assignment not found");
    
    const dueDate = new Date(assignment.due_date);
    const today = new Date();
    const isLate = today > dueDate;
    
    // Check if student has already submitted this assignment
    db.get(
      "SELECT * FROM assignment_submissions WHERE student_id = ? AND assignment_id = ?",
      [student_id, assignment_id],
      (err, existingSubmission) => {
        if (err) return sendResponse(res, 500, false, null, "Database error: " + err.message);
        
        if (existingSubmission) {
          return sendResponse(res, 409, false, null, "You have already submitted this assignment");
        }
        
        // Create new submission
        db.run(
          "INSERT INTO assignment_submissions (assignment_id, student_id, submission_date, file_path) VALUES (?, ?, ?, ?)",
          [assignment_id, student_id, submission_date, file_path || null],
          function(err) {
            if (err) return sendResponse(res, 500, false, null, "Submission failed: " + err.message);
            
            sendResponse(res, 201, true, { 
              submission_id: this.lastID,
              is_late: isLate
            }, isLate ? "Assignment submitted successfully (late submission)" : "Assignment submitted successfully");
          }
        );
      }
    );
  });
});

// ======== DASHBOARD SUMMARY ROUTE ========

// Get dashboard summary for a student
app.get("/api/dashboard/:hallticketnumber", [
  param("hallticketnumber").notEmpty().withMessage("Hall ticket number is required")
], validate, (req, res) => {
  const { hallticketnumber } = req.params;
  
  // Get user profile
  db.get(
    "SELECT id, name, username, email, phone, branch, hallticketnumber FROM users WHERE hallticketnumber = ?",
    [hallticketnumber],
    (err, user) => {
      if (err) return sendResponse(res, 500, false, null, "Failed to fetch user: " + err.message);
      if (!user) return sendResponse(res, 404, false, null, "User not found");
      
      // Get attendance summary
      db.all(
        "SELECT SUM(total) as total_classes, SUM(present) as classes_attended FROM attendance WHERE student_id = ?",
        [hallticketnumber],
        (err, attendanceData) => {
          if (err) return sendResponse(res, 500, false, null, "Failed to fetch attendance: " + err.message);
          
          const attendance = attendanceData[0];
          const attendancePercentage = attendance.total_classes > 0 
            ? ((attendance.classes_attended / attendance.total_classes) * 100).toFixed(2) 
            : 0;
          
          // Get marks summary
          db.all(
            "SELECT SUM(marks) as total_marks, SUM(max_marks) as total_max_marks FROM marks WHERE student_id = ?",
            [hallticketnumber],
            (err, marksData) => {
              if (err) return sendResponse(res, 500, false, null, "Failed to fetch marks: " + err.message);
              
              const marks = marksData[0];
              const marksPercentage = marks.total_max_marks > 0 
                ? ((marks.total_marks / marks.total_max_marks) * 100).toFixed(2) 
                : 0;
              
              // Get fees summary
              db.all(
                "SELECT SUM(amount) as total_amount, SUM(paid_amount) as total_paid FROM fees WHERE student_id = ?",
                [hallticketnumber],
                (err, feesData) => {
                  if (err) return sendResponse(res, 500, false, null, "Failed to fetch fees: " + err.message);
                  
                  const fees = feesData[0];
                  const feesDue = fees.total_amount - fees.total_paid;
                  
                  // Get recent notifications
                  db.all(
                    "SELECT * FROM notifications ORDER BY priority DESC, date DESC LIMIT 5",
                    [],
                    (err, notifications) => {
                      if (err) return sendResponse(res, 500, false, null, "Failed to fetch notifications: " + err.message);
                      
                      // Get upcoming assignments
                      db.all(
                        `SELECT a.*, s.name as subject_name, s.code as subject_code 
                         FROM assignments a
                         JOIN subjects s ON a.subject_id = s.id
                         WHERE a.branch = ? AND a.due_date >= DATE('now')
                         ORDER BY a.due_date ASC LIMIT 5`,
                        [user.branch],
                        (err, assignments) => {
                          if (err) return sendResponse(res, 500, false, null, "Failed to fetch assignments: " + err.message);
                          
                          // Get today's timetable
                          const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                          
                          db.all(
                            `SELECT t.*, s.name as subject_name, s.code as subject_code 
                             FROM timetable t
                             LEFT JOIN subjects s ON t.subject_id = s.id
                             WHERE t.day = ? AND t.branch = ?
                             ORDER BY t.period ASC`,
                            [today, user.branch],
                            (err, timetable) => {
                              if (err) return sendResponse(res, 500, false, null, "Failed to fetch timetable: " + err.message);
                              
                              // Return the dashboard summary
                              sendResponse(res, 200, true, {
                                user,
                                attendance: {
                                  total_classes: attendance.total_classes,
                                  classes_attended: attendance.classes_attended,
                                  classes_missed: attendance.total_classes - attendance.classes_attended,
                                  percentage: attendancePercentage
                                },
                                marks: {
                                  total_marks: marks.total_marks,
                                  total_max_marks: marks.total_max_marks,
                                  percentage: marksPercentage
                                },
                                fees: {
                                  total_amount: fees.total_amount,
                                  total_paid: fees.total_paid,
                                  total_due: feesDue,
                                  payment_progress: fees.total_amount > 0 ? ((fees.total_paid / fees.total_amount) * 100).toFixed(2) : 0
                                },
                                recent_notifications: notifications,
                                upcoming_assignments: assignments,
                                todays_timetable: timetable
                              });
                            }
                          );
                        }
                      );
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Handle unexpected errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});