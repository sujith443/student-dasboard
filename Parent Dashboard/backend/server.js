const express = require("express");
  const cors = require("cors");
  const db = require("./database"); // Use our updated database module
  const { subMonths, format } = require("date-fns"); // Import date-fns for date handling

  const app = express();
  app.use(cors());
  app.use(express.json());

  // ✅ Debugging Middleware (Logs Every API Request)
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.url}`, req.body);
    next();
  });

  // ✅ User Registration API (Support for students and parents)
  app.post("/register", (req, res) => {
    const { name, username, email, phone, branch, hallticketnumber, password, role } = req.body;
    if (!name || !username || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Default role to 'student' if not specified
    const userRole = role || 'student';
    
    // For students, we need branch and hall ticket
    if (userRole === 'student' && (!branch || !hallticketnumber)) {
      return res.status(400).json({ message: "Branch and Hall Ticket Number are required for students." });
    }

    const sql = `INSERT INTO users (name, username, email, phone, branch, hallticketnumber, password, role) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [name, username, email, phone, branch || '', hallticketnumber || '', password, userRole], function (err) {
      if (err) return res.status(500).json({ message: "Registration failed.", error: err.message });
      
      // If registering a student, also add to students table
      if (userRole === 'student') {
        db.run(
          "INSERT INTO students (name, email, hallticketnumber, branch) VALUES (?, ?, ?, ?)",
          [name, email, hallticketnumber, branch],
          (err) => {
            if (err) console.error("Error adding to students table:", err.message);
          }
        );
      }
      
      res.json({ message: "Registration successful!", userId: this.lastID });
    });
  });

  // ✅ Parent Registration API
  app.post("/register/parent", (req, res) => {
    const { name, email, phone, password, student_hallticketnumber, relation } = req.body;
    if (!name || !email || !phone || !password || !student_hallticketnumber) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // First, find the student by hall ticket number
    db.get("SELECT id FROM students WHERE hallticketnumber = ?", [student_hallticketnumber], (err, student) => {
      if (err) return res.status(500).json({ message: "Database error", error: err.message });
      if (!student) return res.status(404).json({ message: "Student not found with the provided hall ticket number." });

      // Insert the parent with reference to student
      const sql = `INSERT INTO parents (name, email, phone, password, student_id, relation) VALUES (?, ?, ?, ?, ?, ?)`;
      db.run(sql, [name, email, phone, password, student.id, relation || 'Parent'], function (err) {
        if (err) return res.status(500).json({ message: "Parent registration failed.", error: err.message });
        res.json({ message: "Parent registration successful!", parentId: this.lastID });
      });
    });
  });

  // ✅ User Login API (For students, parents, and admin)
  app.post("/login", (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and Password are required." });
    }

    // If role is specified, add it to the query
    let sql = "SELECT * FROM users WHERE (username = ? OR email = ? OR hallticketnumber = ?) AND password = ?";
    let params = [username, username, username, password];

    if (role) {
      sql = "SELECT * FROM users WHERE (username = ? OR email = ? OR hallticketnumber = ?) AND password = ? AND role = ?";
      params.push(role);
    }

    db.get(sql, params, (err, user) => {
      if (err) return res.status(500).json({ message: "Internal server error.", error: err.message });
      if (!user) {
        // If not found in users table and username looks like an email, try parents table
        if (username.includes('@')) {
          db.get("SELECT * FROM parents WHERE email = ? AND password = ?", [username, password], (err, parent) => {
            if (err) return res.status(500).json({ message: "Internal server error.", error: err.message });
            if (!parent) return res.status(401).json({ message: "Invalid credentials." });
            
            // Get student info for this parent
            db.get("SELECT s.*, u.branch, u.semester FROM students s JOIN users u ON s.hallticketnumber = u.hallticketnumber WHERE s.id = ?", 
              [parent.student_id], (err, student) => {
              if (err) return res.status(500).json({ message: "Internal server error.", error: err.message });
              
              parent.role = 'parent';
              parent.student = student;
              
              // Get unread notifications count
              db.get("SELECT COUNT(*) as unread FROM parent_notifications WHERE parent_id = ? AND is_read = 0", 
                [parent.id], (err, notificationCount) => {
                if (err) console.error("Error getting notification count:", err.message);
                
                parent.unreadNotifications = notificationCount ? notificationCount.unread : 0;
                res.json({ message: "Login successful!", user: parent });
              });
            });
          });
        } else {
          return res.status(401).json({ message: "Invalid credentials." });
        }
      } else {
        res.json({ message: "Login successful!", user });
      }
    });
  });

  // ✅ Parent Login API (Dedicated endpoint)
  app.post("/login/parent", (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and Password are required." });
    }

    db.get("SELECT * FROM parents WHERE email = ? AND password = ?", [email, password], (err, parent) => {
      if (err) return res.status(500).json({ message: "Internal server error.", error: err.message });
      if (!parent) return res.status(401).json({ message: "Invalid parent credentials." });
      
      // Get student info for this parent
      db.get("SELECT s.*, u.branch, u.semester FROM students s JOIN users u ON s.hallticketnumber = u.hallticketnumber WHERE s.id = ?", 
        [parent.student_id], (err, student) => {
        if (err) return res.status(500).json({ message: "Internal server error.", error: err.message });
        
        // Get unread notifications count
        db.get("SELECT COUNT(*) as unread FROM parent_notifications WHERE parent_id = ? AND is_read = 0", 
          [parent.id], (err, notificationCount) => {
          if (err) console.error("Error getting notification count:", err.message);
          
          res.json({ 
            message: "Parent login successful!", 
            parent: {
              ...parent,
              role: 'parent',
              unreadNotifications: notificationCount ? notificationCount.unread : 0
            },
            student
          });
        });
      });
    });
  });

  // ✅ Change Password API (Requires Old Password)
  app.put("/update-password", (req, res) => {
    const { identifier, oldPassword, newPassword, role } = req.body;
    if (!identifier || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (role === 'parent') {
      // Update parent password
      db.get("SELECT * FROM parents WHERE email = ? AND password = ?", [identifier, oldPassword], (err, parent) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (!parent) return res.status(404).json({ message: "Parent not found or incorrect old password!" });

        db.run("UPDATE parents SET password = ? WHERE email = ?", [newPassword, identifier], function (err) {
          if (err) return res.status(500).json({ message: "Error updating password", error: err.message });
          res.json({ message: "Password updated successfully!" });
        });
      });
    } else {
      // Update student/user password
      db.get("SELECT * FROM users WHERE (email = ? OR username = ? OR hallticketnumber = ?) AND password = ?", 
        [identifier, identifier, identifier, oldPassword], (err, user) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (!user) return res.status(404).json({ message: "User not found or incorrect old password!" });

        db.run("UPDATE users SET password = ? WHERE id = ?", [newPassword, user.id], function (err) {
          if (err) return res.status(500).json({ message: "Error updating password", error: err.message });
          res.json({ message: "Password updated successfully!" });
        });
      });
    }
  });

  // ✅ Forgot Password API (Resets Password Without Old Password)
  app.post("/forgot-password", (req, res) => {
    const { identifier, newPassword, role } = req.body;
    if (!identifier || !newPassword) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (role === 'parent') {
      // Reset parent password
      db.get("SELECT * FROM parents WHERE email = ?", [identifier], (err, parent) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (!parent) return res.status(404).json({ message: "Parent not found!" });

        db.run("UPDATE parents SET password = ? WHERE email = ?", [newPassword, identifier], function (err) {
          if (err) return res.status(500).json({ message: "Error resetting password", error: err.message });
          res.json({ message: "Password reset successfully!" });
        });
      });
    } else {
      // Reset student/user password
      db.get("SELECT * FROM users WHERE email = ? OR username = ? OR hallticketnumber = ?", 
        [identifier, identifier, identifier], (err, user) => {
        if (err) return res.status(500).json({ message: "Database error", error: err.message });
        if (!user) return res.status(404).json({ message: "User not found!" });

        db.run("UPDATE users SET password = ? WHERE id = ?", [newPassword, user.id], function (err) {
          if (err) return res.status(500).json({ message: "Error resetting password", error: err.message });
          res.json({ message: "Password reset successfully!" });
        });
      });
    }
  });

  // ✅ Fetch Notifications API (For students and general notifications)
  app.get("/notifications", (req, res) => {
    const { category, target } = req.query;
    
    let sql = "SELECT * FROM notifications";
    let params = [];
    let conditions = [];
    
    if (category) {
      conditions.push("category = ?");
      params.push(category);
    }
    
    if (target) {
      conditions.push("(target = ? OR target = 'all')");
      params.push(target);
    }
    
    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    
    sql += " ORDER BY date DESC";
    
    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ message: "Error fetching notifications.", error: err.message });
      res.json(rows);
    });
  });

  // ✅ Fetch Timetable API
  app.get("/timetable", (req, res) => {
    const { branch, day, semester } = req.query;
    
    let sql = "SELECT * FROM timetable";
    let params = [];
    let conditions = [];
    
    if (branch) {
      conditions.push("branch = ?");
      params.push(branch);
    }
    
    if (day) {
      conditions.push("day = ?");
      params.push(day);
    }
    
    if (semester) {
      conditions.push("semester = ?");
      params.push(semester);
    }
    
    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    
    sql += " ORDER BY day, period";
    
    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ message: "Error fetching timetable.", error: err.message });
      res.json(rows);
    });
  });

  // ✅ Fetch Student Attendance API
  app.get("/attendance/:studentId", (req, res) => {
    const { studentId } = req.params;
    const { month } = req.query;
    
    let sql = "SELECT * FROM attendance WHERE student_id = ?";
    let params = [studentId];
    
    if (month) {
      sql += " AND month = ?";
      params.push(month);
    }
    
    sql += " ORDER BY month DESC";
    
    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ message: "Error fetching attendance.", error: err.message });
      res.json(rows);
    });
  });

  // ✅ Fetch Student Marks API
  app.get("/marks/:studentId", (req, res) => {
    const { studentId } = req.params;
    const { subject, examType, semester } = req.query;
    
    let sql = "SELECT * FROM marks WHERE student_id = ?";
    let params = [studentId];
    
    if (subject) {
      sql += " AND subject = ?";
      params.push(subject);
    }
    
    if (examType) {
      sql += " AND exam_type = ?";
      params.push(examType);
    }
    
    if (semester) {
      sql += " AND semester = ?";
      params.push(semester);
    }
    
    sql += " ORDER BY subject, exam_type";
    
    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ message: "Error fetching marks.", error: err.message });
      res.json(rows);
    });
  });

  // ✅ Fetch Student Fees API
  app.get("/fees/:studentId", (req, res) => {
    const { studentId } = req.params;
    const { feeType, paid } = req.query;
    
    let sql = "SELECT * FROM fees WHERE student_id = ?";
    let params = [studentId];
    
    if (feeType) {
      sql += " AND fee_type = ?";
      params.push(feeType);
    }
    
    if (paid !== undefined) {
      sql += " AND paid = ?";
      params.push(paid === 'true' ? 1 : 0);
    }
    
    sql += " ORDER BY due_date";
    
    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ message: "Error fetching fees.", error: err.message });
      res.json(rows);
    });
  });

  // ✅ Parent Notifications API
  app.get("/parent-notifications/:parentId", (req, res) => {
    const { parentId } = req.params;
    const { isRead } = req.query;
    
    let sql = "SELECT * FROM parent_notifications WHERE parent_id = ?";
    let params = [parentId];
    
    if (isRead !== undefined) {
      sql += " AND is_read = ?";
      params.push(isRead === 'true' ? 1 : 0);
    }
    
    sql += " ORDER BY date DESC";
    
    db.all(sql, params, (err, rows) => {
      if (err) return res.status(500).json({ message: "Error fetching parent notifications.", error: err.message });
      res.json(rows);
    });
  });

  // ✅ Mark Parent Notification As Read API
  app.put("/parent-notifications/:notificationId/read", (req, res) => {
    const { notificationId } = req.params;
    
    db.run("UPDATE parent_notifications SET is_read = 1 WHERE id = ?", [notificationId], function (err) {
      if (err) return res.status(500).json({ message: "Error updating notification.", error: err.message });
      res.json({ message: "Notification marked as read successfully!" });
    });
  });

  // ✅ Parent Messages API
  app.get("/parent-messages/:parentId", (req, res) => {
    const { parentId } = req.params;
    
    db.all("SELECT * FROM parent_messages WHERE parent_id = ? ORDER BY timestamp DESC", [parentId], (err, rows) => {
      if (err) return res.status(500).json({ message: "Error fetching parent messages.", error: err.message });
      res.json(rows);
    });
  });

  // ✅ Send Parent Message API
  app.post("/parent-messages", (req, res) => {
    const { parentId, teacherId, message } = req.body;
    if (!parentId || !message) {
      return res.status(400).json({ message: "Parent ID and message are required." });
    }
    
    const timestamp = new Date().toISOString();
    
    db.run(
      "INSERT INTO parent_messages (parent_id, teacher_id, message, timestamp, is_read) VALUES (?, ?, ?, ?, 0)",
      [parentId, teacherId || null, message, timestamp],
      function (err) {
        if (err) return res.status(500).json({ message: "Error sending message.", error: err.message });
        res.json({ message: "Message sent successfully!", messageId: this.lastID });
      }
    );
  });

  // ✅ Get Summary Statistics for Parent Dashboard
  app.get("/parent-dashboard/:studentId", (req, res) => {
    const { studentId } = req.params;
    
    // Get student details
    db.get("SELECT s.*, u.branch, u.semester FROM students s JOIN users u ON s.hallticketnumber = u.hallticketnumber WHERE s.hallticketnumber = ?", 
      [studentId], (err, student) => {
      if (err) return res.status(500).json({ message: "Error fetching student details.", error: err.message });
      if (!student) return res.status(404).json({ message: "Student not found." });
      
      // Get latest attendance
      db.get("SELECT * FROM attendance WHERE student_id = ? ORDER BY month DESC LIMIT 1", [studentId], (err, attendance) => {
        if (err) console.error("Error fetching attendance:", err.message);
        
        // Get unpaid fees count
        db.get("SELECT COUNT(*) as count FROM fees WHERE student_id = ? AND paid = 0", [studentId], (err, unpaidFees) => {
          if (err) console.error("Error fetching unpaid fees:", err.message);
          
          // Get upcoming exams (simplified - just returning latest marks instead)
          db.all("SELECT subject, MAX(marks) as marks, MAX(max_marks) as max_marks FROM marks WHERE student_id = ? GROUP BY subject", 
            [studentId], (err, marks) => {
            if (err) console.error("Error fetching marks:", err.message);
            
            res.json({
              student: student,
              latestAttendance: attendance || null,
              unpaidFeesCount: unpaidFees ? unpaidFees.count : 0,
              subjectMarks: marks || []
            });
          });
        });
      });
    });
  });

  // ✅ Get Student Performance Analytics
  app.get("/student-performance/:studentId", (req, res) => {
    const { studentId } = req.params;
    
    // Get attendance over time
    db.all("SELECT month, percentage FROM attendance WHERE student_id = ? ORDER BY month", [studentId], (err, attendance) => {
      if (err) return res.status(500).json({ message: "Error fetching attendance data.", error: err.message });
      
      // Get marks by exam type and subject
      db.all(
        `SELECT subject, exam_type, marks, max_marks, 
         ROUND(marks * 100.0 / max_marks, 2) as percentage 
         FROM marks WHERE student_id = ? 
         ORDER BY subject, exam_type`,
        [studentId],
        (err, marks) => {
          if (err) return res.status(500).json({ message: "Error fetching marks data.", error: err.message });
          
          // Calculate overall performance
          const overallPerformance = {};
          
          // Group marks by subject
          const subjectMarks = {};
          marks.forEach(mark => {
            if (!subjectMarks[mark.subject]) {
              subjectMarks[mark.subject] = [];
            }
            subjectMarks[mark.subject].push(mark);
          });
          
          // Calculate subject averages
          Object.keys(subjectMarks).forEach(subject => {
            const subjectExams = subjectMarks[subject];
            const totalPercentage = subjectExams.reduce((sum, exam) => sum + exam.percentage, 0);
            overallPerformance[subject] = +(totalPercentage / subjectExams.length).toFixed(2);
          });
          
          res.json({
            attendance: attendance,
            marks: marks,
            subjectPerformance: overallPerformance
          });
        }
      );
    });
  });

  // ✅ Upload Fee Payment Proof (would need file upload middleware like multer in a real app)
  app.post("/pay-fee/:feeId", (req, res) => {
    const { feeId } = req.params;
    const { transactionId } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({ message: "Transaction ID is required." });
    }
    
    const paidDate = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    db.run(
      "UPDATE fees SET paid = 1, paid_date = ?, transaction_id = ? WHERE id = ?",
      [paidDate, transactionId, feeId],
      function (err) {
        if (err) return res.status(500).json({ message: "Error updating fee payment.", error: err.message });
        if (this.changes === 0) return res.status(404).json({ message: "Fee record not found." });
        res.json({ message: "Fee payment recorded successfully!" });
      }
    );
  });

  // ✅ Get Student Subjects
  app.get("/subjects/:branch/:semester", (req, res) => {
    const { branch, semester } = req.params;
    
    db.all(
      "SELECT DISTINCT subject FROM timetable WHERE branch = ? AND semester = ? ORDER BY subject",
      [branch, semester],
      (err, rows) => {
        if (err) return res.status(500).json({ message: "Error fetching subjects.", error: err.message });
        res.json(rows.map(row => row.subject));
      }
    );
  });

  // ✅ Get Teachers List
  app.get("/teachers/:branch", (req, res) => {
    const { branch } = req.params;
    
    db.all(
      "SELECT DISTINCT teacher FROM timetable WHERE branch = ? ORDER BY teacher",
      [branch],
      (err, rows) => {
        if (err) return res.status(500).json({ message: "Error fetching teachers.", error: err.message });
        res.json(rows.map(row => row.teacher));
      }
    );
  });

  // Start the server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));