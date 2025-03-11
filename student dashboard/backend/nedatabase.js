const sqlite3 = require("sqlite3").verbose();


// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database("newcollege.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
    
    // Use a single transaction for multiple table creation operations
    db.serialize(() => {
      // Create tables with proper constraints and indexes
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          username TEXT NOT NULL UNIQUE,
          email TEXT NOT NULL UNIQUE,
          phone TEXT NOT NULL,
          branch TEXT NOT NULL,
          hallticketnumber TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          profile_image TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id TEXT NOT NULL,
          subject_id INTEGER NOT NULL,
          month TEXT NOT NULL,
          total INTEGER NOT NULL DEFAULT 0,
          present INTEGER NOT NULL DEFAULT 0,
          absent INTEGER NOT NULL DEFAULT 0,
          FOREIGN KEY (student_id) REFERENCES users(hallticketnumber),
          FOREIGN KEY (subject_id) REFERENCES subjects(id),
          UNIQUE(student_id, subject_id, month)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS subjects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          branch TEXT NOT NULL,
          semester INTEGER NOT NULL,
          credits INTEGER NOT NULL DEFAULT 4
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS marks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id TEXT NOT NULL,
          subject_id INTEGER NOT NULL,
          exam_type TEXT NOT NULL,
          marks INTEGER NOT NULL,
          max_marks INTEGER NOT NULL DEFAULT 100,
          exam_date TEXT NOT NULL,
          FOREIGN KEY (student_id) REFERENCES users(hallticketnumber),
          FOREIGN KEY (subject_id) REFERENCES subjects(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'general',
          priority INTEGER DEFAULT 0,
          date TEXT NOT NULL,
          expiry_date TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS timetable (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          day TEXT NOT NULL,
          period INTEGER NOT NULL,
          branch TEXT NOT NULL,
          semester INTEGER NOT NULL,
          subject_id INTEGER,
          room_number TEXT,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          FOREIGN KEY (subject_id) REFERENCES subjects(id),
          UNIQUE(day, period, branch, semester)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS fees (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          student_id TEXT NOT NULL,
          fee_type TEXT NOT NULL,
          amount REAL NOT NULL,
          paid_amount REAL DEFAULT 0,
          due_date TEXT NOT NULL,
          payment_status TEXT DEFAULT 'pending',
          payment_date TEXT,
          transaction_id TEXT,
          academic_year TEXT NOT NULL,
          semester INTEGER NOT NULL,
          FOREIGN KEY (student_id) REFERENCES users(hallticketnumber)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS assignments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subject_id INTEGER NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          due_date TEXT NOT NULL,
          max_marks INTEGER NOT NULL DEFAULT 10,
          branch TEXT NOT NULL,
          semester INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (subject_id) REFERENCES subjects(id)
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS assignment_submissions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          assignment_id INTEGER NOT NULL,
          student_id TEXT NOT NULL,
          submission_date TEXT NOT NULL,
          file_path TEXT,
          marks INTEGER,
          remarks TEXT,
          FOREIGN KEY (assignment_id) REFERENCES assignments(id),
          FOREIGN KEY (student_id) REFERENCES users(hallticketnumber),
          UNIQUE(assignment_id, student_id)
        )
      `);

      // Create indexes for frequently queried columns
      db.run("CREATE INDEX IF NOT EXISTS idx_student_id ON attendance(student_id)");
      db.run("CREATE INDEX IF NOT EXISTS idx_student_marks ON marks(student_id)");
      db.run("CREATE INDEX IF NOT EXISTS idx_student_fees ON fees(student_id)");
      db.run("CREATE INDEX IF NOT EXISTS idx_notifications_date ON notifications(date)");
      
      // Check if sample data needs to be inserted
      db.get("SELECT COUNT(*) as count FROM users", (err, row) => {
        if (err) {
          console.error("Error checking users table:", err.message);
        } else if (row.count === 0) {
          console.log("Inserting sample data...");
          insertSampleData();
        } else {
          console.log("Database already contains data. Skipping sample data insertion.");
        }
      });
    });
  }
});

// Function to insert sample data
function insertSampleData() {
  // Sample branches and semesters
  const branches = ["CSE", "ECE", "MECH", "CIVIL", "IT"];
  const currentDate = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthDate = nextMonth.toISOString().split('T')[0];
  
  // Insert sample subjects
  const subjects = [
    { code: "MA101", name: "Engineering Mathematics", branch: "CSE", semester: 1, credits: 4 },
    { code: "CS101", name: "Introduction to Programming", branch: "CSE", semester: 1, credits: 4 },
    { code: "PH101", name: "Engineering Physics", branch: "CSE", semester: 1, credits: 3 },
    { code: "CS201", name: "Data Structures", branch: "CSE", semester: 3, credits: 4 },
    { code: "CS202", name: "Database Systems", branch: "CSE", semester: 3, credits: 4 },
    { code: "EC101", name: "Basic Electronics", branch: "ECE", semester: 1, credits: 4 }
  ];
  
  const stmt1 = db.prepare("INSERT INTO subjects (code, name, branch, semester, credits) VALUES (?, ?, ?, ?, ?)");
  subjects.forEach(subject => {
    stmt1.run(subject.code, subject.name, subject.branch, subject.semester, subject.credits);
  });
  stmt1.finalize();
  
  // Insert sample users
  const users = [
    { name: "John Doe", username: "johndoe", email: "john@example.com", phone: "9876543210", branch: "CSE", hallticketnumber: "CSE20251", password: "password123" },
    { name: "Jane Smith", username: "janesmith", email: "jane@example.com", phone: "9876543211", branch: "CSE", hallticketnumber: "CSE20252", password: "password123" },
    { name: "Raj Patel", username: "rajpatel", email: "raj@example.com", phone: "9876543212", branch: "ECE", hallticketnumber: "ECE20251", password: "password123" }
  ];
  
  const stmt2 = db.prepare("INSERT INTO users (name, username, email, phone, branch, hallticketnumber, password) VALUES (?, ?, ?, ?, ?, ?, ?)");
  users.forEach(user => {
    stmt2.run(user.name, user.username, user.email, user.phone, user.branch, user.hallticketnumber, user.password);
  });
  stmt2.finalize();
  
  // Insert sample attendance data
  const months = ["January 2025", "February 2025", "March 2025"];
  const stmt3 = db.prepare("INSERT INTO attendance (student_id, subject_id, month, total, present, absent) VALUES (?, ?, ?, ?, ?, ?)");
  
  users.forEach(user => {
    // Get relevant subjects for the user's branch
    const relevantSubjects = subjects.filter(s => s.branch === user.branch || s.branch === "ALL");
    
    relevantSubjects.forEach((subject, index) => {
      months.forEach(month => {
        const total = 20;
        const present = Math.floor(Math.random() * 6) + 15; // 15-20 classes present
        const absent = total - present;
        
        stmt3.run(user.hallticketnumber, index + 1, month, total, present, absent);
      });
    });
  });
  stmt3.finalize();
  
  // Insert sample marks data
  const examTypes = ["Mid Term 1", "Mid Term 2", "Assignment 1", "Assignment 2", "Final Exam"];
  const stmt4 = db.prepare("INSERT INTO marks (student_id, subject_id, exam_type, marks, max_marks, exam_date) VALUES (?, ?, ?, ?, ?, ?)");
  
  users.forEach(user => {
    const relevantSubjects = subjects.filter(s => s.branch === user.branch || s.branch === "ALL");
    
    relevantSubjects.forEach((subject, index) => {
      examTypes.forEach(examType => {
        const maxMarks = examType.includes("Final") ? 100 : (examType.includes("Mid") ? 50 : 20);
        const marks = Math.floor(Math.random() * (maxMarks * 0.3)) + Math.floor(maxMarks * 0.7); // 70-100% marks
        stmt4.run(user.hallticketnumber, index + 1, examType, marks, maxMarks, currentDate);
      });
    });
  });
  stmt4.finalize();
  
  // Insert sample notifications
  const notifications = [
    { title: "Mid Term Exams", message: "Mid Term exams start from March 15, 2025", category: "exams", priority: 2, date: currentDate },
    { title: "Fee Payment", message: "Last date for fee payment is April 10, 2025", category: "fees", priority: 1, date: currentDate },
    { title: "Holiday Notice", message: "College will remain closed on March 20, 2025 for Holi", category: "general", priority: 0, date: currentDate },
    { title: "Placement Drive", message: "Microsoft campus recruitment drive on March 25, 2025", category: "placement", priority: 2, date: nextMonthDate }
  ];
  
  const stmt5 = db.prepare("INSERT INTO notifications (title, message, category, priority, date) VALUES (?, ?, ?, ?, ?)");
  notifications.forEach(notification => {
    stmt5.run(notification.title, notification.message, notification.category, notification.priority, notification.date);
  });
  stmt5.finalize();
  
  // Insert sample timetable data
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const startTimes = ["9:00", "10:00", "11:00", "12:00", "13:30", "14:30", "15:30", "16:30"];
  const endTimes = ["10:00", "11:00", "12:00", "13:00", "14:30", "15:30", "16:30", "17:30"];
  
  const stmt6 = db.prepare("INSERT INTO timetable (day, period, branch, semester, subject_id, room_number, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  
  branches.forEach(branch => {
    days.forEach(day => {
      periods.forEach((period, index) => {
        // Randomly assign subjects
        const randomSubjectIndex = Math.floor(Math.random() * subjects.length);
        stmt6.run(
          day,
          period,
          branch,
          1, // Semester 1
          randomSubjectIndex + 1,
          `${branch}-${Math.floor(Math.random() * 10) + 1}`,
          startTimes[index],
          endTimes[index]
        );
      });
    });
  });
  stmt6.finalize();
  
  // Insert sample fees data
  const feeTypes = ["Tuition Fee", "Examination Fee", "Library Fee", "Hostel Fee"];
  const academicYear = "2024-2025";
  
  const stmt7 = db.prepare("INSERT INTO fees (student_id, fee_type, amount, paid_amount, due_date, payment_status, academic_year, semester) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
  
  users.forEach(user => {
    feeTypes.forEach(feeType => {
      let amount = 0;
      if (feeType === "Tuition Fee") amount = 45000;
      else if (feeType === "Examination Fee") amount = 5000;
      else if (feeType === "Library Fee") amount = 2000;
      else if (feeType === "Hostel Fee") amount = 35000;
      
      // Some fees fully paid, some partially paid
      const paidAmount = Math.random() > 0.5 ? amount : Math.floor(amount * 0.5);
      const paymentStatus = paidAmount === amount ? "paid" : "partial";
      
      stmt7.run(
        user.hallticketnumber,
        feeType,
        amount,
        paidAmount,
        nextMonthDate,
        paymentStatus,
        academicYear,
        1 // Semester 1
      );
    });
  });
  stmt7.finalize();
  
  // Insert sample assignments
  const assignments = [
    { title: "Programming Assignment 1", description: "Implement a linked list in C++", due_date: nextMonthDate },
    { title: "Database Design", description: "Design an ER diagram for a library management system", due_date: nextMonthDate },
    { title: "Physics Lab Report", description: "Submit the lab report for the pendulum experiment", due_date: currentDate }
  ];
  
  const stmt8 = db.prepare("INSERT INTO assignments (subject_id, title, description, due_date, branch, semester) VALUES (?, ?, ?, ?, ?, ?)");
  
  assignments.forEach((assignment, index) => {
    stmt8.run(
      index + 1, // Subject ID
      assignment.title,
      assignment.description,
      assignment.due_date,
      "CSE", // Branch
      1 // Semester
    );
  });
  stmt8.finalize();
  
  console.log("Sample data inserted successfully!");
}

process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});

module.exports = db;