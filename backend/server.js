require("dotenv").config({
  path: __dirname + "/.env",
});

const express = require("express");
const cors = require("cors");
const pool = require("./db");

const studentRoutes = require("./routes/students");

const attendanceRoutes = require("./routes/attendance");

const marksRoutes = require("./routes/marks");

const reportsRoutes = require("./routes/reports");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use("/api/students", studentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "School Management System API is running",
  });
});

// Dashboard statistics
app.get("/api/dashboard", async (req, res) => {
  try {
    const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM student) AS total_students,
        (SELECT COUNT(*) FROM marks) AS total_marks,
        (SELECT COUNT(*) FROM attendance) AS total_attendance,
        (
          SELECT COALESCE(ROUND(AVG(average), 2), 0)
          FROM student_reports
        ) AS average_marks;
    `;

    const classQuery = `
      SELECT
        class,
        COUNT(*) AS student_count
      FROM student
      GROUP BY class
      ORDER BY class;
    `;

    const [statsResult, classResult] = await Promise.all([
      pool.query(statsQuery),
      pool.query(classQuery),
    ]);

    res.json({
      statistics: statsResult.rows[0],
      students_by_class: classResult.rows,
    });
  } catch (error) {
    console.error("Dashboard query error:", error);

    res.status(500).json({
      message: "Failed to load dashboard statistics",
    });
  }
});

// Attendance percentage report
app.get("/api/attendance-report", async (req, res) => {
  try {
    const query = `
      SELECT
        s.reg_no,
        s.full_name,
        s.class,
        COUNT(a.attend_id) AS total_days,
        COUNT(*) FILTER (
          WHERE a.status = 'Present'
        ) AS present_days,
        COUNT(*) FILTER (
          WHERE a.status = 'Absent'
        ) AS absent_days,
        ROUND(
          (
            COUNT(*) FILTER (
              WHERE a.status = 'Present'
            )::numeric
            / NULLIF(COUNT(a.attend_id), 0)
          ) * 100,
          2
        ) AS attendance_percentage
      FROM student s
      LEFT JOIN attendance a
        ON s.reg_no = a.reg_no
      GROUP BY
        s.reg_no,
        s.full_name,
        s.class
      ORDER BY s.reg_no;
    `;

    const result = await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error("Attendance report error:", error);

    res.status(500).json({
      message: "Failed to generate attendance report",
    });
  }
});

// Student search and filtering
app.get("/api/student-search", async (req, res) => {
  try {
    const { reg_no, name, class_name, gender } = req.query;

    let query = `
      SELECT
        reg_no,
        full_name,
        class,
        date_of_birth,
        gender,
        phone,
        email,
        house_no,
        city,
        pin
      FROM student
      WHERE 1 = 1
    `;

    const values = [];
    let parameterIndex = 1;

    if (reg_no && reg_no.trim() !== "") {
      query += ` AND reg_no ILIKE $${parameterIndex}`;
      values.push(`%${reg_no.trim()}%`);
      parameterIndex++;
    }

    if (name && name.trim() !== "") {
      query += ` AND full_name ILIKE $${parameterIndex}`;
      values.push(`%${name.trim()}%`);
      parameterIndex++;
    }

    if (class_name && class_name.trim() !== "") {
      query += ` AND class = $${parameterIndex}`;
      values.push(class_name.trim());
      parameterIndex++;
    }

    if (gender && gender.trim() !== "") {
      query += ` AND gender = $${parameterIndex}`;
      values.push(gender.trim());
      parameterIndex++;
    }

    query += ` ORDER BY reg_no`;

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (error) {
    console.error("Student search error:", error);

    res.status(500).json({
      message: "Failed to search students",
    });
  }
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      message: "PostgreSQL connection successful",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
