const express = require("express");
const router = express.Router();

const pool = require("../db");

// GET all attendance records
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                a.attend_id,
                a.reg_no,
                s.full_name,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN student s
                ON a.reg_no = s.reg_no
            ORDER BY a.attendance_date DESC, a.reg_no
        `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching attendance:", error);

    res.status(500).json({
      message: "Failed to fetch attendance",
    });
  }
});

// POST attendance
router.post("/", async (req, res) => {
  try {
    const { reg_no, attendance_date, status } = req.body;

    const result = await pool.query(
      `
            INSERT INTO attendance (
                reg_no,
                attendance_date,
                status
            )
            VALUES ($1, $2, $3)
            RETURNING *;
            `,
      [reg_no, attendance_date, status],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding attendance:", error);

    res.status(500).json({
      message: "Failed to add attendance",
      error: error.message,
    });
  }
});

// UPDATE attendance
router.put("/:attend_id", async (req, res) => {
  try {
    const { attend_id } = req.params;
    const { attendance_date, status } = req.body;

    const result = await pool.query(
      `
            UPDATE attendance
            SET
                attendance_date = $1,
                status = $2
            WHERE attend_id = $3
            RETURNING *;
            `,
      [attendance_date, status, attend_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating attendance:", error);

    res.status(500).json({
      message: "Failed to update attendance",
      error: error.message,
    });
  }
});

// DELETE attendance
router.delete("/:attend_id", async (req, res) => {
  try {
    const { attend_id } = req.params;

    const result = await pool.query(
      `
            DELETE FROM attendance
            WHERE attend_id = $1
            RETURNING *;
            `,
      [attend_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Attendance record not found",
      });
    }

    res.json({
      message: "Attendance deleted successfully",
      attendance: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting attendance:", error);

    res.status(500).json({
      message: "Failed to delete attendance",
    });
  }
});

module.exports = router;

// GET attendance for a specific student
router.get("/:reg_no", async (req, res) => {
  try {
    const { reg_no } = req.params;

    const result = await pool.query(
      `
            SELECT
                a.attend_id,
                a.reg_no,
                s.full_name,
                a.attendance_date,
                a.status
            FROM attendance a
            JOIN student s
                ON a.reg_no = s.reg_no
            WHERE a.reg_no = $1
            ORDER BY a.attendance_date DESC
            `,
      [reg_no],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No attendance records found for this student",
      });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching student attendance:", error);

    res.status(500).json({
      message: "Failed to fetch student attendance",
    });
  }
});
