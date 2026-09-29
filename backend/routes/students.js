const express = require("express");
const router = express.Router();

const pool = require("../db");

// GET all students
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT *
            FROM student_details
            ORDER BY reg_no
        `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching students:", error);

    res.status(500).json({
      message: "Failed to fetch students",
    });
  }
});

// POST a new student
router.post("/", async (req, res) => {
  try {
    const {
      reg_no,
      full_name,
      class: studentClass,
      date_of_birth,
      gender,
      phone,
      email,
      admin_id,
      house_no,
      city,
      pin,
    } = req.body;

    const result = await pool.query(
      `
            INSERT INTO student (
                reg_no,
                full_name,
                class,
                date_of_birth,
                gender,
                phone,
                email,
                admin_id,
                house_no,
                city,
                pin
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
            `,
      [
        reg_no,
        full_name,
        studentClass,
        date_of_birth,
        gender,
        phone,
        email,
        admin_id,
        house_no,
        city,
        pin,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding student:", error);

    res.status(500).json({
      message: "Failed to add student",
      error: error.message,
    });
  }
});

// GET a student by registration number
router.get("/:reg_no", async (req, res) => {
  try {
    const { reg_no } = req.params;

    const result = await pool.query(
      `
            SELECT *
            FROM student_details
            WHERE reg_no = $1
            `,
      [reg_no],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching student:", error);

    res.status(500).json({
      message: "Failed to fetch student",
    });
  }
});

// UPDATE a student
router.put("/:reg_no", async (req, res) => {
  try {
    const { reg_no } = req.params;

    const {
      full_name,
      class: studentClass,
      date_of_birth,
      gender,
      phone,
      email,
      admin_id,
      house_no,
      city,
      pin,
    } = req.body;

    const result = await pool.query(
      `
            UPDATE student
            SET
                full_name = $1,
                class = $2,
                date_of_birth = $3,
                gender = $4,
                phone = $5,
                email = $6,
                admin_id = $7,
                house_no = $8,
                city = $9,
                pin = $10
            WHERE reg_no = $11
            RETURNING *;
            `,
      [
        full_name,
        studentClass,
        date_of_birth,
        gender,
        phone,
        email,
        admin_id,
        house_no,
        city,
        pin,
        reg_no,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating student:", error);

    res.status(500).json({
      message: "Failed to update student",
      error: error.message,
    });
  }
});

// DELETE a student
router.delete("/:reg_no", async (req, res) => {
  try {
    const { reg_no } = req.params;

    const result = await pool.query(
      `
            DELETE FROM student
            WHERE reg_no = $1
            RETURNING *;
            `,
      [reg_no],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Student not found",
      });
    }

    res.json({
      message: "Student deleted successfully",
      student: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting student:", error);

    res.status(500).json({
      message: "Failed to delete student",
      error: error.message,
    });
  }
});

module.exports = router;
