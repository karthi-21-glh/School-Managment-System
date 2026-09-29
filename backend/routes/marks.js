const express = require("express");
const router = express.Router();

const pool = require("../db");

// GET all marks
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
            SELECT
                m.mark_id,
                m.reg_no,
                s.full_name,
                m.exam_type,
                m.first_language,
                m.second_language,
                m.mathematics,
                m.science,
                m.arts,
                m.others
            FROM marks m
            JOIN student s
                ON m.reg_no = s.reg_no
            ORDER BY m.mark_id
        `);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching marks:", error);

    res.status(500).json({
      message: "Failed to fetch marks",
    });
  }
});

// POST marks
router.post("/", async (req, res) => {
  try {
    const {
      reg_no,
      exam_type,
      first_language,
      second_language,
      mathematics,
      science,
      arts,
      others,
    } = req.body;

    const result = await pool.query(
      `
            INSERT INTO marks (
                reg_no,
                exam_type,
                first_language,
                second_language,
                mathematics,
                science,
                arts,
                others
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
            `,
      [
        reg_no,
        exam_type,
        first_language,
        second_language,
        mathematics,
        science,
        arts,
        others,
      ],
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding marks:", error);

    res.status(500).json({
      message: "Failed to add marks",
      error: error.message,
    });
  }
});

// GET marks for a specific student
router.get("/:reg_no", async (req, res) => {
  try {
    const { reg_no } = req.params;

    const result = await pool.query(
      `
            SELECT
                m.mark_id,
                m.reg_no,
                s.full_name,
                m.exam_type,
                m.first_language,
                m.second_language,
                m.mathematics,
                m.science,
                m.arts,
                m.others
            FROM marks m
            JOIN student s
                ON m.reg_no = s.reg_no
            WHERE m.reg_no = $1
            ORDER BY m.mark_id
            `,
      [reg_no],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No marks found for this student",
      });
    }

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching student marks:", error);

    res.status(500).json({
      message: "Failed to fetch student marks",
    });
  }
});

// UPDATE marks
router.put("/:mark_id", async (req, res) => {
  try {
    const { mark_id } = req.params;

    const {
      exam_type,
      first_language,
      second_language,
      mathematics,
      science,
      arts,
      others,
    } = req.body;

    const result = await pool.query(
      `
            UPDATE marks
            SET
                exam_type = $1,
                first_language = $2,
                second_language = $3,
                mathematics = $4,
                science = $5,
                arts = $6,
                others = $7
            WHERE mark_id = $8
            RETURNING *;
            `,
      [
        exam_type,
        first_language,
        second_language,
        mathematics,
        science,
        arts,
        others,
        mark_id,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Marks record not found",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating marks:", error);

    res.status(500).json({
      message: "Failed to update marks",
      error: error.message,
    });
  }
});

// DELETE marks
router.delete("/:mark_id", async (req, res) => {
  try {
    const { mark_id } = req.params;

    const result = await pool.query(
      `
            DELETE FROM marks
            WHERE mark_id = $1
            RETURNING *;
            `,
      [mark_id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Marks record not found",
      });
    }

    res.json({
      message: "Marks deleted successfully",
      marks: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting marks:", error);

    res.status(500).json({
      message: "Failed to delete marks",
    });
  }
});

module.exports = router;
