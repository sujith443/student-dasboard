const sqlite3 = require("sqlite3").verbose();

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database("btech_college.db", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to SQLite database.");

    // Create tables if they don't exist
    db.run(
      `CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        hallticketnumber TEXT NOT NULL UNIQUE,
        branch TEXT NOT NULL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS parents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        password TEXT NOT NULL,
        student_id INTEGER,
        relation TEXT DEFAULT 'Parent',
        FOREIGN KEY (student_id) REFERENCES students(id)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL,
        branch TEXT NOT NULL,
        hallticketnumber TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        semester INTEGER DEFAULT 8
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT,
        total INTEGER,
        present INTEGER,
        absent INTEGER,
        month TEXT,
        percentage REAL,
        FOREIGN KEY (student_id) REFERENCES users(hallticketnumber)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        target TEXT DEFAULT 'all'
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS marks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT,
        subject TEXT NOT NULL,
        marks INTEGER,
        max_marks INTEGER DEFAULT 100,
        exam_type TEXT DEFAULT 'regular',
        semester INTEGER DEFAULT 8,
        FOREIGN KEY (student_id) REFERENCES users(hallticketnumber)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT,
        fee_type TEXT NOT NULL,
        amount REAL NOT NULL,
        due_date TEXT NOT NULL,
        paid BOOLEAN DEFAULT 0,
        paid_date TEXT,
        transaction_id TEXT,
        FOREIGN KEY (student_id) REFERENCES users(hallticketnumber)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS timetable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day TEXT NOT NULL,
        period INTEGER NOT NULL,
        subject TEXT NOT NULL,
        teacher TEXT NOT NULL,
        room TEXT NOT NULL,
        branch TEXT NOT NULL,
        semester INTEGER DEFAULT 8
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS parent_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER,
        teacher_id INTEGER,
        message TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        reply TEXT,
        reply_timestamp TEXT,
        FOREIGN KEY (parent_id) REFERENCES parents(id)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS parent_notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        is_read BOOLEAN DEFAULT 0,
        FOREIGN KEY (parent_id) REFERENCES parents(id)
      )`
    );

    // Check if students table already has data
    db.get("SELECT COUNT(*) as count FROM students", (err, row) => {
      if (err) {
        console.error("Error checking students table:", err.message);
      } else if (row.count === 0) {
        // Insert data only if the table is empty
        db.run(
          `INSERT INTO students (name, email, hallticketnumber, branch) VALUES 
           ('Rajesh Kumar', 'rajesh@example.com', '19BD1A05J1', 'CSE'), 
           ('Priya Sharma', 'priya@example.com', '19BD1A05K2', 'ECE'),
           ('Venkat Reddy', 'venkat@example.com', '19BD1A05L3', 'MECH'),
           ('Ananya Devi', 'ananya@example.com', '19BD1A05M4', 'IT'),
           ('Suresh Babu', 'suresh@example.com', '19BD1A05N5', 'CIVIL')`
        );

        db.run(
          `INSERT INTO users (name, username, email, phone, branch, hallticketnumber, password, role, semester) VALUES 
           ('Rajesh Kumar', 'rajesh', 'rajesh@example.com', '9876543210', 'CSE', '19BD1A05J1', 'password123', 'student', 8),
           ('Priya Sharma', 'priya', 'priya@example.com', '8765432109', 'ECE', '19BD1A05K2', 'password123', 'student', 8),
           ('Venkat Reddy', 'venkat', 'venkat@example.com', '7654321098', 'MECH', '19BD1A05L3', 'password123', 'student', 8),
           ('Ananya Devi', 'ananya', 'ananya@example.com', '6543210987', 'IT', '19BD1A05M4', 'password123', 'student', 8),
           ('Suresh Babu', 'suresh', 'suresh@example.com', '5432109876', 'CIVIL', '19BD1A05N5', 'password123', 'student', 8),
           ('Admin User', 'admin', 'admin@college.edu', '9999999999', 'ADMIN', 'ADMIN001', 'admin123', 'admin', 0)`
        );

        db.run(
          `INSERT INTO parents (name, email, phone, password, student_id, relation) VALUES 
           ('Ramesh Kumar', 'ramesh@example.com', '9876543211', 'parent123', 1, 'Father'), 
           ('Sunita Sharma', 'sunita@example.com', '8765432119', 'parent123', 2, 'Mother'),
           ('Prakash Reddy', 'prakash@example.com', '7654321099', 'parent123', 3, 'Father'),
           ('Lakshmi Devi', 'lakshmi@example.com', '6543210988', 'parent123', 4, 'Mother'),
           ('Venkatesh Babu', 'venkatesh@example.com', '5432109877', 'parent123', 5, 'Father')`
        );

        // CSE subjects for 8th semester
        const cseSubjects = ['Machine Learning', 'Cloud Computing', 'Data Analytics', 'Information Security', 'Internet of Things', 'Project Work'];
        
        // ECE subjects for 8th semester
        const eceSubjects = ['VLSI Design', 'Wireless Communication', 'Embedded Systems', 'Optical Communication', 'Satellite Communication', 'Project Work'];
        
        // MECH subjects for 8th semester
        const mechSubjects = ['Advanced Manufacturing', 'Robotics', 'Automobile Engineering', 'Industrial Engineering', 'CAD/CAM', 'Project Work'];
        
        // IT subjects for 8th semester
        const itSubjects = ['Big Data Analytics', 'Artificial Intelligence', 'Mobile Computing', 'Blockchain Technology', 'Software Testing', 'Project Work'];
        
        // CIVIL subjects for 8th semester
        const civilSubjects = ['Advanced Structural Design', 'Environmental Engineering', 'Transportation Engineering', 'Construction Management', 'Remote Sensing and GIS', 'Project Work'];

        // Add attendance data
        const months = ['January 2025', 'February 2025'];
        const students = [
          { id: '19BD1A05J1', branch: 'CSE' },
          { id: '19BD1A05K2', branch: 'ECE' },
          { id: '19BD1A05L3', branch: 'MECH' },
          { id: '19BD1A05M4', branch: 'IT' },
          { id: '19BD1A05N5', branch: 'CIVIL' }
        ];

        students.forEach(student => {
          months.forEach(month => {
            const total = 100;
            const present = Math.floor(Math.random() * 15) + 80; // Random between 80-94
            const absent = total - present;
            const percentage = (present / total) * 100;
            
            db.run(
              `INSERT INTO attendance (student_id, total, present, absent, month, percentage) VALUES 
               (?, ?, ?, ?, ?, ?)`,
              [student.id, total, present, absent, month, percentage]
            );
          });
        });

        // Add marks data
        const examTypes = ['Mid Term 1', 'Mid Term 2', 'External'];
        
        students.forEach(student => {
          let subjects;
          switch (student.branch) {
            case 'CSE': subjects = cseSubjects; break;
            case 'ECE': subjects = eceSubjects; break;
            case 'MECH': subjects = mechSubjects; break;
            case 'IT': subjects = itSubjects; break;
            case 'CIVIL': subjects = civilSubjects; break;
            default: subjects = cseSubjects;
          }
          
          subjects.forEach(subject => {
            examTypes.forEach(examType => {
              const maxMarks = examType === 'External' ? 70 : 30;
              const marks = Math.floor(Math.random() * 11) + (maxMarks - 15); // Random between (maxMarks-15) and maxMarks-5
              
              db.run(
                `INSERT INTO marks (student_id, subject, marks, max_marks, exam_type, semester) VALUES 
                 (?, ?, ?, ?, ?, 8)`,
                [student.id, subject, marks, maxMarks, examType]
              );
            });
          });
        });

        // Add fees data
        const feeTypes = ['Tuition Fee', 'Exam Fee', 'Library Fee', 'Lab Fee', 'Hostel Fee'];
        const amounts = [45000, 5000, 3000, 7000, 35000];
        
        students.forEach(student => {
          feeTypes.forEach((feeType, index) => {
            const isPaid = index < 3 ? 1 : 0; // First 3 are paid
            const paidDate = isPaid ? '2025-01-15' : null;
            const transactionId = isPaid ? `TXN${Math.floor(Math.random() * 1000000)}` : null;
            
            db.run(
              `INSERT INTO fees (student_id, fee_type, amount, due_date, paid, paid_date, transaction_id) VALUES 
               (?, ?, ?, '2025-01-31', ?, ?, ?)`,
              [student.id, feeType, amounts[index], isPaid, paidDate, transactionId]
            );
          });
        });

        // Add notifications
        db.run(
          `INSERT INTO notifications (message, date, category, target) VALUES 
           ('Final semester project presentations scheduled for Feb 15-20, 2025', '2025-01-10', 'academic', 'all'), 
           ('Fee payment deadline extended to Jan 31, 2025', '2025-01-05', 'fee', 'all'),
           ('Campus recruitment drive by TCS on Feb 5, 2025', '2025-01-15', 'placement', 'students'),
           ('Parent-Teacher Meeting scheduled for Feb 10, 2025', '2025-02-01', 'meeting', 'parents'),
           ('Special workshop on React JS on Jan 25, 2025', '2025-01-12', 'workshop', 'students')`
        );

        // Add timetable
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        const teachers = {
          'CSE': ['Dr. Ramakrishna', 'Prof. Lakshmi Narayana', 'Dr. Padma Priya', 'Prof. Venkatesh', 'Dr. Subramaniam'],
          'ECE': ['Dr. Nageshwar Rao', 'Prof. Indira Devi', 'Dr. Vijay Kumar', 'Prof. Radha Krishna', 'Dr. Murali Mohan'],
          'MECH': ['Dr. Prasad Rao', 'Prof. Harish Chandra', 'Dr. Vijaya Lakshmi', 'Prof. Srinivasa Rao', 'Dr. Gopal Krishna'],
          'IT': ['Dr. Sundaresh', 'Prof. Priya Darshini', 'Dr. Ravi Kiran', 'Prof. Sai Krishna', 'Dr. Lakshmi Prasad'],
          'CIVIL': ['Dr. Narayana Murthy', 'Prof. Shankar Rao', 'Dr. Lalitha Kumari', 'Prof. Satya Narayana', 'Dr. Durga Prasad']
        };
        const rooms = ['A101', 'A102', 'A103', 'A104', 'A105', 'B201', 'B202', 'B203', 'B204', 'B205'];

        // For each branch
        Object.keys(teachers).forEach(branch => {
          let subjects;
          switch (branch) {
            case 'CSE': subjects = cseSubjects.slice(0, 5); break; // Excluding project work
            case 'ECE': subjects = eceSubjects.slice(0, 5); break;
            case 'MECH': subjects = mechSubjects.slice(0, 5); break;
            case 'IT': subjects = itSubjects.slice(0, 5); break;
            case 'CIVIL': subjects = civilSubjects.slice(0, 5); break;
            default: subjects = [];
          }
          
          // For each day
          days.forEach((day, dayIndex) => {
            // 5 periods per day
            for (let period = 1; period <= 5; period++) {
              const subject = subjects[(dayIndex + period - 1) % subjects.length];
              const teacher = teachers[branch][(dayIndex + period - 1) % teachers[branch].length];
              const room = rooms[(dayIndex * 5 + period - 1) % rooms.length];
              
              db.run(
                `INSERT INTO timetable (day, period, subject, teacher, room, branch, semester) VALUES 
                 (?, ?, ?, ?, ?, ?, 8)`,
                [day, period, subject, teacher, room, branch]
              );
            }
          });
        });

        // Add parent messages
        db.run(
          `INSERT INTO parent_messages (parent_id, teacher_id, message, timestamp, is_read, reply, reply_timestamp) VALUES 
           (1, NULL, 'I would like to discuss Rajesh\'s progress in Machine Learning. When can we schedule a meeting?', '2025-01-05 10:30:00', 0, NULL, NULL),
           (2, NULL, 'Priya has been sick this week, please excuse her absence for the VLSI Design class.', '2025-01-07 09:15:00', 1, 'Thank you for informing. I will make a note of it. - Dr. Nageshwar Rao', '2025-01-07 14:25:00'),
           (3, NULL, 'Is there any additional preparation Venkat should do for the upcoming Robotics exam?', '2025-01-10 11:45:00', 1, 'Please advise him to review the lab assignments and chapter 5. - Prof. Harish Chandra', '2025-01-10 16:30:00'),
           (4, NULL, 'Requesting information about Ananya\'s project work status.', '2025-01-12 13:20:00', 0, NULL, NULL),
           (5, NULL, 'When is the last date for paying the remaining fees?', '2025-01-15 10:10:00', 1, 'The deadline is January 31, 2025. - Admin', '2025-01-15 12:45:00')`
        );

        // Add parent notifications
        db.run(
          `INSERT INTO parent_notifications (parent_id, message, date, is_read) VALUES 
           (1, 'Rajesh scored 85% in Machine Learning mid-term exam', '2025-01-12', 0),
           (2, 'Priya has less than 75% attendance in Wireless Communication', '2025-01-15', 1),
           (3, 'Venkat has been selected for internship at L&T', '2025-01-18', 0),
           (4, 'Ananya\'s project has been shortlisted for state-level competition', '2025-01-20', 1),
           (5, 'Reminder: Complete the pending fee payment by Jan 31', '2025-01-25', 0)`
        );

        console.log("Sample data for BTech college inserted successfully.");
      } else {
        console.log("Students table already contains data. Skipping inserts.");
      }
    });
  }
});

module.exports = db;