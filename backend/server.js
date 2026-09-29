require("dotenv").config({
  path: __dirname + "/.env",
});

const express = require("express");
const pool = require("./db");

const studentRoutes = require("./routes/students");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/api/students", studentRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "School Management System API is running",
  });
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
