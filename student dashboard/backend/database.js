const sqlite3 = require("sqlite3").verbose();

// Connect to SQLite database (or create it if it doesn't exist)
const db = new sqlite3.Database("teststudentdata.db", (err) => {
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
        branch TEXT NOT NULL,
        section TEXT NOT NULL,
        year INTEGER NOT NULL,
        semester INTEGER NOT NULL,
        phone TEXT,
        address TEXT,
        dob TEXT
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
        password TEXT NOT NULL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS parents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL,
        father_name TEXT NOT NULL,
        father_occupation TEXT,
        father_phone TEXT,
        mother_name TEXT NOT NULL,
        mother_occupation TEXT,
        mother_phone TEXT,
        address TEXT,
        FOREIGN KEY (student_id) REFERENCES students(hallticketnumber)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        total_classes INTEGER NOT NULL,
        present INTEGER NOT NULL,
        absent INTEGER NOT NULL,
        FOREIGN KEY (student_id) REFERENCES students(hallticketnumber)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        message TEXT NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS marks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL,
        subject TEXT NOT NULL,
        internal_marks REAL,
        external_marks REAL,
        total_marks REAL,
        grade TEXT,
        FOREIGN KEY (student_id) REFERENCES students(hallticketnumber)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS fees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT NOT NULL,
        fee_type TEXT NOT NULL,
        amount REAL NOT NULL,
        paid REAL NOT NULL,
        due REAL NOT NULL,
        due_date TEXT NOT NULL,
        status TEXT NOT NULL,
        payment_date TEXT,
        transaction_id TEXT,
        FOREIGN KEY (student_id) REFERENCES students(hallticketnumber)
      )`
    );

    db.run(
      `CREATE TABLE IF NOT EXISTS timetable (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        branch TEXT NOT NULL,
        section TEXT NOT NULL,
        day TEXT NOT NULL,
        period INTEGER NOT NULL,
        subject TEXT NOT NULL,
        faculty TEXT NOT NULL,
        room TEXT NOT NULL
      )`
    );

    // Check if students table already has data
    db.get("SELECT COUNT(*) as count FROM students", (err, row) => {
      if (err) {
        console.error("Error checking students table:", err.message);
      } else if (row.count === 0) {
        // Insert data only if the table is empty
        
        // Insert BTech 4th year students
        db.run(
          `INSERT INTO students (name, email, hallticketnumber, branch, section, year, semester, phone, address, dob) VALUES 
           ('Rahul Sharma', 'rahul.sharma@example.com', 'ECE202501', 'ECE', 'A', 4, 7, '9876543201', '123 College Road, Hyderabad', '2002-05-15'),
           ('Priya Patel', 'priya.patel@example.com', 'ECE202502', 'ECE', 'A', 4, 7, '9876543202', '456 University Ave, Hyderabad', '2002-07-22'),
           ('Amit Kumar', 'amit.kumar@example.com', 'ECE202503', 'ECE', 'A', 4, 7, '9876543203', '789 Campus Street, Hyderabad', '2002-03-10'),
           ('Sneha Reddy', 'sneha.reddy@example.com', 'ECE202504', 'ECE', 'A', 4, 7, '9876543204', '234 College Lane, Hyderabad', '2002-11-05'),
           ('Vikram Singh', 'vikram.singh@example.com', 'ECE202505', 'ECE', 'B', 4, 7, '9876543205', '567 Education Road, Hyderabad', '2001-09-18')`
        );

        // Insert users for login
        db.run(
          `INSERT INTO users (name, username, email, phone, branch, hallticketnumber, password) VALUES 
           ('Rahul Sharma', 'rahul_s', 'rahul.sharma@example.com', '9876543201', 'ECE', 'ECE202501', 'password123'),
           ('Priya Patel', 'priya_p', 'priya.patel@example.com', '9876543202', 'ECE', 'ECE202502', 'password123'),
           ('Amit Kumar', 'amit_k', 'amit.kumar@example.com', '9876543203', 'ECE', 'ECE202503', 'password123'),
           ('Sneha Reddy', 'sneha_r', 'sneha.reddy@example.com', '9876543204', 'ECE', 'ECE202504', 'password123'),
           ('Vikram Singh', 'vikram_s', 'vikram.singh@example.com', '9876543205', 'ECE', 'ECE202505', 'password123')`
        );

        // Insert parents data
        db.run(
          `INSERT INTO parents (student_id, father_name, father_occupation, father_phone, mother_name, mother_occupation, mother_phone, address) VALUES 
           ('ECE202501', 'Rajesh Sharma', 'Engineer', '9876543301', 'Sunita Sharma', 'Teacher', '9876543302', '123 College Road, Hyderabad'),
           ('ECE202502', 'Suresh Patel', 'Business Owner', '9876543303', 'Meena Patel', 'Doctor', '9876543304', '456 University Ave, Hyderabad'),
           ('ECE202503', 'Manoj Kumar', 'Government Officer', '9876543305', 'Rekha Kumar', 'Homemaker', '9876543306', '789 Campus Street, Hyderabad'),
           ('ECE202504', 'Venkat Reddy', 'Professor', '9876543307', 'Lakshmi Reddy', 'Banker', '9876543308', '234 College Lane, Hyderabad'),
           ('ECE202505', 'Harinder Singh', 'Lawyer', '9876543309', 'Gurpreet Singh', 'Entrepreneur', '9876543310', '567 Education Road, Hyderabad')`
        );

        // Insert attendance data - subject-wise monthly data for the last 3 months
        const subjects = ['Microprocessors', 'Digital Signal Processing', 'Antenna Theory', 'Communication Systems', 'VLSI Design'];
        const months = ['January', 'February', 'March'];
        
        let attendanceQuery = `INSERT INTO attendance (student_id, subject, month, year, total_classes, present, absent) VALUES `;
        let values = [];
        
        for (let i = 1; i <= 5; i++) {
          const hallTicket = `ECE20250${i}`;
          
          subjects.forEach(subject => {
            months.forEach(month => {
              const totalClasses = Math.floor(Math.random() * 5) + 16; // 16-20 classes per month
              const present = Math.floor(Math.random() * 6) + (totalClasses - 8); // Between (totalClasses-8) to (totalClasses-3)
              const absent = totalClasses - present;
              
              values.push(`('${hallTicket}', '${subject}', '${month}', 2025, ${totalClasses}, ${present}, ${absent})`);
            });
          });
        }
        
        db.run(attendanceQuery + values.join(','));

        // Insert notifications
        db.run(
          `INSERT INTO notifications (message, date, category) VALUES 
           ('End Semester Examinations start from April 15, 2025', '2025-03-01', 'Exam'),
           ('Fee payment for final semester due by March 25, 2025', '2025-03-05', 'Fee'),
           ('Campus Placement Drive by TCS on March 20, 2025', '2025-03-10', 'Placement'),
           ('Project submission deadline extended to April 5, 2025', '2025-03-12', 'Academic'),
           ('Guest lecture on "Future of AI" on March 18 in Auditorium', '2025-03-14', 'Event'),
           ('Registration for GATE coaching starts from March 22', '2025-03-15', 'Academic'),
           ('College Annual Day celebrations on April 2, 2025', '2025-03-18', 'Event'),
           ('Mid-semester feedback submission due by March 30', '2025-03-20', 'Academic')`
        );

        // Insert marks data
        db.run(
          `INSERT INTO marks (student_id, subject, internal_marks, external_marks, total_marks, grade) VALUES 
           ('ECE202501', 'Microprocessors', 28, 65, 93, 'A'),
           ('ECE202501', 'Digital Signal Processing', 25, 58, 83, 'B'),
           ('ECE202501', 'Antenna Theory', 27, 61, 88, 'B+'),
           ('ECE202501', 'Communication Systems', 29, 63, 92, 'A'),
           ('ECE202501', 'VLSI Design', 26, 59, 85, 'B+'),
           
           ('ECE202502', 'Microprocessors', 29, 67, 96, 'A+'),
           ('ECE202502', 'Digital Signal Processing', 27, 61, 88, 'B+'),
           ('ECE202502', 'Antenna Theory', 26, 58, 84, 'B'),
           ('ECE202502', 'Communication Systems', 28, 64, 92, 'A'),
           ('ECE202502', 'VLSI Design', 30, 68, 98, 'A+'),
           
           ('ECE202503', 'Microprocessors', 26, 60, 86, 'B+'),
           ('ECE202503', 'Digital Signal Processing', 28, 64, 92, 'A'),
           ('ECE202503', 'Antenna Theory', 25, 58, 83, 'B'),
           ('ECE202503', 'Communication Systems', 27, 62, 89, 'B+'),
           ('ECE202503', 'VLSI Design', 29, 66, 95, 'A'),
           
           ('ECE202504', 'Microprocessors', 27, 63, 90, 'A'),
           ('ECE202504', 'Digital Signal Processing', 26, 59, 85, 'B+'),
           ('ECE202504', 'Antenna Theory', 28, 64, 92, 'A'),
           ('ECE202504', 'Communication Systems', 25, 57, 82, 'B'),
           ('ECE202504', 'VLSI Design', 27, 61, 88, 'B+'),
           
           ('ECE202505', 'Microprocessors', 28, 65, 93, 'A'),
           ('ECE202505', 'Digital Signal Processing', 30, 68, 98, 'A+'),
           ('ECE202505', 'Antenna Theory', 27, 62, 89, 'B+'),
           ('ECE202505', 'Communication Systems', 26, 60, 86, 'B+'),
           ('ECE202505', 'VLSI Design', 29, 66, 95, 'A')`
        );

        // Insert fees data
        db.run(
          `INSERT INTO fees (student_id, fee_type, amount, paid, due, due_date, status, payment_date, transaction_id) VALUES 
           ('ECE202501', 'Tuition Fee', 65000, 65000, 0, '2024-08-15', 'Paid', '2024-08-10', 'TXN123456'),
           ('ECE202501', 'Hostel Fee', 45000, 45000, 0, '2024-08-15', 'Paid', '2024-08-10', 'TXN123457'),
           ('ECE202501', 'Exam Fee', 5000, 5000, 0, '2025-03-25', 'Paid', '2025-03-15', 'TXN789012'),
           ('ECE202501', 'Lab Fee', 8000, 4000, 4000, '2025-03-25', 'Partial', '2025-03-15', 'TXN789013'),
           
           ('ECE202502', 'Tuition Fee', 65000, 65000, 0, '2024-08-15', 'Paid', '2024-08-12', 'TXN234567'),
           ('ECE202502', 'Hostel Fee', 45000, 45000, 0, '2024-08-15', 'Paid', '2024-08-12', 'TXN234568'),
           ('ECE202502', 'Exam Fee', 5000, 0, 5000, '2025-03-25', 'Pending', null, null),
           ('ECE202502', 'Lab Fee', 8000, 0, 8000, '2025-03-25', 'Pending', null, null),
           
           ('ECE202503', 'Tuition Fee', 65000, 65000, 0, '2024-08-15', 'Paid', '2024-08-11', 'TXN345678'),
           ('ECE202503', 'Hostel Fee', 45000, 45000, 0, '2024-08-15', 'Paid', '2024-08-11', 'TXN345679'),
           ('ECE202503', 'Exam Fee', 5000, 5000, 0, '2025-03-25', 'Paid', '2025-03-10', 'TXN890123'),
           ('ECE202503', 'Lab Fee', 8000, 8000, 0, '2025-03-25', 'Paid', '2025-03-10', 'TXN890124'),
           
           ('ECE202504', 'Tuition Fee', 65000, 32500, 32500, '2024-08-15', 'Partial', '2024-08-14', 'TXN456789'),
           ('ECE202504', 'Hostel Fee', 45000, 45000, 0, '2024-08-15', 'Paid', '2024-08-14', 'TXN456790'),
           ('ECE202504', 'Exam Fee', 5000, 0, 5000, '2025-03-25', 'Pending', null, null),
           ('ECE202504', 'Lab Fee', 8000, 0, 8000, '2025-03-25', 'Pending', null, null),
           
           ('ECE202505', 'Tuition Fee', 65000, 65000, 0, '2024-08-15', 'Paid', '2024-08-09', 'TXN567890'),
           ('ECE202505', 'Hostel Fee', 45000, 45000, 0, '2024-08-15', 'Paid', '2024-08-09', 'TXN567891'),
           ('ECE202505', 'Exam Fee', 5000, 5000, 0, '2025-03-25', 'Paid', '2025-03-20', 'TXN901234'),
           ('ECE202505', 'Lab Fee', 8000, 4000, 4000, '2025-03-25', 'Partial', '2025-03-20', 'TXN901235')`
        );

        // Insert timetable data for ECE 4th year
        db.run(
          `INSERT INTO timetable (branch, section, day, period, subject, faculty, room) VALUES 
           ('ECE', 'A', 'Monday', 1, 'Microprocessors', 'Dr. Rajan Verma', 'ECE-401'),
           ('ECE', 'A', 'Monday', 2, 'Digital Signal Processing', 'Dr. Priya Sharma', 'ECE-401'),
           ('ECE', 'A', 'Monday', 3, 'Antenna Theory', 'Prof. Sunil Kumar', 'ECE-401'),
           ('ECE', 'A', 'Monday', 4, 'Communication Systems', 'Dr. Meera Gupta', 'ECE-401'),
           ('ECE', 'A', 'Monday', 5, 'VLSI Design', 'Dr. Anil Srivastava', 'ECE-401'),
           
           ('ECE', 'A', 'Tuesday', 1, 'Digital Signal Processing', 'Dr. Priya Sharma', 'ECE-401'),
           ('ECE', 'A', 'Tuesday', 2, 'VLSI Design', 'Dr. Anil Srivastava', 'ECE-401'),
           ('ECE', 'A', 'Tuesday', 3, 'Digital Signal Processing Lab', 'Dr. Priya Sharma', 'ECE-Lab2'),
           ('ECE', 'A', 'Tuesday', 4, 'Digital Signal Processing Lab', 'Dr. Priya Sharma', 'ECE-Lab2'),
           ('ECE', 'A', 'Tuesday', 5, 'Project Work', 'Various Guides', 'Project Lab'),
           
           ('ECE', 'A', 'Wednesday', 1, 'Antenna Theory', 'Prof. Sunil Kumar', 'ECE-401'),
           ('ECE', 'A', 'Wednesday', 2, 'Communication Systems', 'Dr. Meera Gupta', 'ECE-401'),
           ('ECE', 'A', 'Wednesday', 3, 'Microprocessors', 'Dr. Rajan Verma', 'ECE-401'),
           ('ECE', 'A', 'Wednesday', 4, 'VLSI Design Lab', 'Dr. Anil Srivastava', 'ECE-Lab3'),
           ('ECE', 'A', 'Wednesday', 5, 'VLSI Design Lab', 'Dr. Anil Srivastava', 'ECE-Lab3'),
           
           ('ECE', 'A', 'Thursday', 1, 'Communication Systems', 'Dr. Meera Gupta', 'ECE-401'),
           ('ECE', 'A', 'Thursday', 2, 'Microprocessors', 'Dr. Rajan Verma', 'ECE-401'),
           ('ECE', 'A', 'Thursday', 3, 'Microprocessors Lab', 'Dr. Rajan Verma', 'ECE-Lab1'),
           ('ECE', 'A', 'Thursday', 4, 'Microprocessors Lab', 'Dr. Rajan Verma', 'ECE-Lab1'),
           ('ECE', 'A', 'Thursday', 5, 'Project Work', 'Various Guides', 'Project Lab'),
           
           ('ECE', 'A', 'Friday', 1, 'VLSI Design', 'Dr. Anil Srivastava', 'ECE-401'),
           ('ECE', 'A', 'Friday', 2, 'Antenna Theory', 'Prof. Sunil Kumar', 'ECE-401'),
           ('ECE', 'A', 'Friday', 3, 'Communication Systems Lab', 'Dr. Meera Gupta', 'ECE-Lab4'),
           ('ECE', 'A', 'Friday', 4, 'Communication Systems Lab', 'Dr. Meera Gupta', 'ECE-Lab4'),
           ('ECE', 'A', 'Friday', 5, 'Project Work', 'Various Guides', 'Project Lab'),
           
           ('ECE', 'B', 'Monday', 1, 'VLSI Design', 'Dr. Anil Srivastava', 'ECE-402'),
           ('ECE', 'B', 'Monday', 2, 'Microprocessors', 'Dr. Rajan Verma', 'ECE-402'),
           ('ECE', 'B', 'Monday', 3, 'Digital Signal Processing', 'Dr. Priya Sharma', 'ECE-402'),
           ('ECE', 'B', 'Monday', 4, 'Antenna Theory', 'Prof. Sunil Kumar', 'ECE-402'),
           ('ECE', 'B', 'Monday', 5, 'Communication Systems', 'Dr. Meera Gupta', 'ECE-402')`
        );

        console.log("Sample data inserted successfully.");
      } else {
        console.log("Students table already contains data. Skipping inserts.");
      }
    });
  }
});

module.exports = db;