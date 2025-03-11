const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose(); // Use SQLite
const db = new sqlite3.Database("./students.db"); // Ensure this file exists
const { subMonths, format } = require("date-fns"); // Import date-fns for date handling

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Debugging Middleware (Logs Every API Request)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`, req.body);
  next();
});

// ✅ Ensure `month` column exists in `attendance` table
// db.run(`ALTER TABLE attendance ADD COLUMN month TEXT`, function (err) {
//   if (err && err.message.includes("duplicate column name")) {
//     console.log("Column 'month' already exists in attendance table.");
//   } else if (err) {
//     console.error("Error adding 'month' column:", err.message);
//   } else {
//     console.log("Column 'month' added successfully to attendance table.");
//   }
// });


// // ✅ Function to Get Last 3 Months (Using `date-fns`)
// const getLastThreeMonths = () => {
//   return [0, 1, 2].map((i) => format(subMonths(new Date(), i), "MMMM yyyy"));
// }

// // ✅ Function to Insert Dummy Attendance Data
// const insertDummyAttendance = () => {
//   db.run("DELETE FROM attendance", function (err) {
//     if (err) return console.error("Error deleting old attendance:", err.message);
//     console.log("Old attendance data deleted successfully!");
//   });

//   const students = Array.from({ length: 20 }, (_, i) => `ECE2025${i + 1}`); // ECE20251 to ECE202520
//   const totalClassesPerMonth = 20;
//   const months = getLastThreeMonths(); // Get the last 3 months

//   db.serialize(() => {
//     const stmt = db.prepare(
//       `INSERT INTO attendance (student_id, month, total, present, absent) VALUES (?, ?, ?, ?, ?)`
//     );

//     students.forEach((student_id) => {
//       months.forEach((month) => {
//         const present = Math.floor(Math.random() * 6) + 10; // Random between 10-15
//         const absent = totalClassesPerMonth - present;

//         stmt.run(student_id, month, totalClassesPerMonth, present, absent, function (err) {
//           if (err) return console.error("Error inserting attendance:", err.message);
//         });
//       });
//     });

//     stmt.finalize();
//     console.log("Dummy attendance data inserted for the last 3 months!");
//   });
// };

// // ✅ Run the function to add dummy attendance data
// insertDummyAttendance();


// ✅ User Registration API
app.post("/register", (req, res) => {
  const { name, username, email, phone, branch, hallticketnumber, password } = req.body;
  if (!name || !username || !email || !phone || !branch || !hallticketnumber || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const sql = `INSERT INTO users (name, username, email, phone, branch, hallticketnumber, password) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(sql, [name, username, email, phone, branch, hallticketnumber, password], function (err) {
    if (err) return res.status(500).json({ message: "Registration failed.", error: err.message });
    res.json({ message: "Registration successful!", userId: this.lastID });
  });
});

// ✅ User Login API
app.post("/login", (req, res) => {
  const { hallTicketNumber, password } = req.body;
  if (!hallTicketNumber || !password) {
    return res.status(400).json({ message: "Hall Ticket Number and Password are required." });
  }

  db.get("SELECT * FROM users WHERE hallticketnumber = ?", [hallTicketNumber], (err, user) => {
    if (err) return res.status(500).json({ message: "Internal server error." });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Invalid Hall Ticket Number or Password." });
    }
    res.json({ message: "Login successful!", user });
  });
});

// ✅ Change Password API (Requires Old Password)
app.put("/update-password", (req, res) => {
  const { hallticketnumber, email, oldPassword, newPassword } = req.body;
  if (!hallticketnumber || !email || !oldPassword || !newPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  db.get("SELECT * FROM users WHERE hallticketnumber = ? AND email = ?", [hallticketnumber, email], (err, user) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });
    if (!user) return res.status(404).json({ message: "User not found!" });
    if (user.password !== oldPassword) return res.status(401).json({ message: "Incorrect old password!" });

    db.run("UPDATE users SET password = ? WHERE hallticketnumber = ? AND email = ?", [newPassword, hallticketnumber, email], function (err) {
      if (err) return res.status(500).json({ message: "Error updating password", error: err.message });
      res.json({ message: "Password updated successfully!" });
    });
  });
});

// ✅ Forgot Password API (Resets Password Without Old Password)
app.post("/forgot-password", (req, res) => {
  const { hallticketnumber, email, newPassword } = req.body;
  if (!hallticketnumber || !email || !newPassword) {
    return res.status(400).json({ message: "All fields are required." });
  }

  db.get("SELECT * FROM users WHERE hallticketnumber = ? AND email = ?", [hallticketnumber, email], (err, user) => {
    if (err) return res.status(500).json({ message: "Database error", error: err.message });
    if (!user) return res.status(404).json({ message: "User not found!" });

    db.run("UPDATE users SET password = ? WHERE hallticketnumber = ? AND email = ?", [newPassword, hallticketnumber, email], function (err) {
      if (err) return res.status(500).json({ message: "Error resetting password", error: err.message });
      res.json({ message: "Password reset successfully!" });
    });
  });
});

// ✅ Fetch Notifications API
app.get("/notifications", (req, res) => {
  db.all("SELECT * FROM notifications", [], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error fetching notifications.", error: err.message });
    res.json(rows);
  });
});

app.get("/timetable",(req,res)=>{
  db.all("SELECT * FROM timetable",[],(err,rows)=>{
    if(err) return res.status(500).json({message: "Error fetching timetable data.",error:err.message})
  res.json(rows)    
  })
})

// ✅ Fetch Attendance API
app.get("/attendance/:hallticketnumber", (req, res) => {
  const { hallticketnumber } = req.params;
  db.get("SELECT * FROM attendance WHERE student_id = ?", [hallticketnumber], (err, row) => {
    if (err) return res.status(500).json({ message: "Error fetching attendance.", error: err.message });
    console.log(row);
    
    res.json(row || { total: 0, present: 0, absent: 0 });
  });
});

// ✅ Fetch Marks API
app.get("/marks/:hallticketnumber", (req, res) => {
  const { hallticketnumber } = req.params;
  db.all("SELECT * FROM marks WHERE student_id = ?", [hallticketnumber], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error fetching marks.", error: err.message });
    res.json(rows);
  });
});

// ✅ Fetch Fees API
app.get("/fees/:hallticketnumber", (req, res) => {
  const { hallticketnumber } = req.params;
  console.log("Fetching fees for:", hallticketnumber); // Debugging Log

  db.all("SELECT * FROM fees WHERE student_id = ?", [hallticketnumber], (err, rows) => {
    if (err) return res.status(500).json({ message: "Error fetching fees.", error: err.message });
    console.log("Fetched Fees Data:", rows); // Debugging Log
    res.json(rows.length > 0 ? rows : []);
  });
});

// ✅ Start Server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
