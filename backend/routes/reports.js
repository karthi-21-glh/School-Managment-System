const express = require("express");
const router = express.Router();

const pool = require("../db");

// GET all student reports
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT *
            FROM student_reports
            ORDER BY reg_no, report_id
        `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching reports:", error);

    res.status(500).json({
      message: "Failed to fetch reports",
    });
  }
});

// GET reports for a specific student
router.get("/:reg_no", async (req, res) => {
  try {
    const { reg_no } = req.params;

    const result = await pool.query(
      `
            SELECT *
            FROM student_reports
            WHERE reg_no = $1
            ORDER BY report_id
            `,
      [reg_no],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No reports found for this student",
      });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching student reports:", error);

    res.status(500).json({
      message: "Failed to fetch student reports",
    });
  }
});

module.exports = router;
