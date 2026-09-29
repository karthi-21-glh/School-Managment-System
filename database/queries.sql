-- ============================================================
-- SCHOOL MANAGEMENT SYSTEM
-- DBMS SQL QUERY DEMONSTRATION
-- Database: school_management
-- ============================================================


-- ============================================================
-- 1. BASIC SELECT QUERIES
-- ============================================================

-- Display all students
SELECT *
FROM student;

-- Display selected student details
SELECT reg_no, full_name, class, gender
FROM student;


-- ============================================================
-- 2. WHERE CLAUSE
-- ============================================================

-- Find a particular student
SELECT *
FROM student
WHERE reg_no = 'STU001';

-- Find students belonging to a particular class
SELECT reg_no, full_name, class
FROM student
WHERE class = '10 A';


-- ============================================================
-- 3. LIKE / ILIKE
-- ============================================================

-- Search students whose name contains 'Rahul'
SELECT reg_no, full_name, class
FROM student
WHERE full_name ILIKE '%Rahul%';


-- ============================================================
-- 4. ORDER BY
-- ============================================================

-- Display students alphabetically
SELECT reg_no, full_name, class
FROM student
ORDER BY full_name ASC;

-- Display marks from highest mathematics mark to lowest
SELECT reg_no, mathematics
FROM marks
ORDER BY mathematics DESC;


-- ============================================================
-- 5. INSERT
-- ============================================================

-- Example student insertion
-- Run only when a test student is required.

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
VALUES (
    'STU999',
    'Test Student',
    '9 A',
    '2012-05-10',
    'Male',
    '9000000000',
    'test.student@school.com',
    'ADM001',
    '10B',
    'Kollam',
    '691001'
);


-- ============================================================
-- 6. UPDATE
-- ============================================================

-- Example update
UPDATE student
SET phone = '9111111111'
WHERE reg_no = 'STU999';


-- ============================================================
-- 7. DELETE
-- ============================================================

-- Delete the test student
-- Related marks/attendance must be deleted first if they exist.

DELETE FROM student
WHERE reg_no = 'STU999';


-- ============================================================
-- 8. AGGREGATE FUNCTIONS
-- ============================================================

-- Count total students
SELECT COUNT(*) AS total_students
FROM student;

-- Count total marks records
SELECT COUNT(*) AS total_marks_records
FROM marks;

-- Calculate average mathematics mark
SELECT ROUND(AVG(mathematics), 2) AS average_mathematics
FROM marks;

-- Find highest mathematics mark
SELECT MAX(mathematics) AS highest_mathematics
FROM marks;

-- Find lowest mathematics mark
SELECT MIN(mathematics) AS lowest_mathematics
FROM marks;


-- ============================================================
-- 9. GROUP BY
-- ============================================================

-- Count students in each class
SELECT
    class,
    COUNT(*) AS student_count
FROM student
GROUP BY class
ORDER BY class;

-- Count students by gender
SELECT
    gender,
    COUNT(*) AS student_count
FROM student
GROUP BY gender;


-- ============================================================
-- 10. INNER JOIN
-- ============================================================

-- Display students along with their marks
SELECT
    s.reg_no,
    s.full_name,
    s.class,
    m.exam_type,
    m.mathematics,
    m.science
FROM student s
INNER JOIN marks m
    ON s.reg_no = m.reg_no;


-- ============================================================
-- 11. LEFT JOIN
-- ============================================================

-- Display all students and their attendance records
-- Students without attendance records are also included.

SELECT
    s.reg_no,
    s.full_name,
    a.attendance_date,
    a.status
FROM student s
LEFT JOIN attendance a
    ON s.reg_no = a.reg_no
ORDER BY s.reg_no, a.attendance_date;


-- ============================================================
-- 12. MULTI-TABLE JOIN
-- ============================================================

-- Display student information, marks and report information

SELECT
    s.reg_no,
    s.full_name,
    s.class,
    m.exam_type,
    r.report_id
FROM student s
INNER JOIN marks m
    ON s.reg_no = m.reg_no
LEFT JOIN report r
    ON m.mark_id = r.mark_id;


-- ============================================================
-- 13. SUBQUERY
-- ============================================================

-- Find students whose mathematics mark is
-- greater than the average mathematics mark.

SELECT
    s.reg_no,
    s.full_name,
    m.mathematics
FROM student s
INNER JOIN marks m
    ON s.reg_no = m.reg_no
WHERE m.mathematics >
(
    SELECT AVG(mathematics)
    FROM marks
);


-- ============================================================
-- 14. VIEW
-- ============================================================

-- Display the existing student details view

SELECT *
FROM student_details;

-- Display the existing student reports view

SELECT *
FROM student_reports;


-- ============================================================
-- 15. ATTENDANCE SUMMARY
-- ============================================================

SELECT
    s.reg_no,
    s.full_name,
    COUNT(a.attend_id) AS total_days,
    COUNT(*) FILTER (
        WHERE a.status = 'Present'
    ) AS present_days,
    COUNT(*) FILTER (
        WHERE a.status = 'Absent'
    ) AS absent_days
FROM student s
LEFT JOIN attendance a
    ON s.reg_no = a.reg_no
GROUP BY
    s.reg_no,
    s.full_name
ORDER BY s.reg_no;


-- ============================================================
-- 16. ATTENDANCE PERCENTAGE
-- ============================================================

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


-- ============================================================
-- 17. STUDENT SEARCH WITH MULTIPLE CONDITIONS
-- ============================================================

SELECT
    reg_no,
    full_name,
    class,
    gender,
    phone,
    email
FROM student
WHERE class = '10 A'
  AND gender = 'Male'
ORDER BY full_name;


-- ============================================================
-- 18. MARKS SUMMARY
-- ============================================================

SELECT
    s.reg_no,
    s.full_name,
    m.exam_type,

    (
        m.first_language +
        m.second_language +
        m.mathematics +
        m.science +
        m.arts +
        m.others
    ) AS total_marks,

    ROUND(
        (
            m.first_language +
            m.second_language +
            m.mathematics +
            m.science +
            m.arts +
            m.others
        ) / 6.0,
        2
    ) AS average_marks

FROM student s

INNER JOIN marks m
    ON s.reg_no = m.reg_no;


-- ============================================================
-- 19. INDEXES
-- ============================================================

-- Index used for class-based student searches
CREATE INDEX IF NOT EXISTS idx_student_class
ON student(class);

-- Index used for marks searches and joins
CREATE INDEX IF NOT EXISTS idx_marks_reg_no
ON marks(reg_no);

-- Index used for attendance searches and joins
CREATE INDEX IF NOT EXISTS idx_attendance_reg_no
ON attendance(reg_no);


-- ============================================================
-- 20. VIEW DEFINITIONS / VERIFICATION
-- ============================================================

-- List available views
SELECT table_name
FROM information_schema.views
WHERE table_schema = 'public';


-- ============================================================
-- END OF SQL QUERY DEMONSTRATION
-- ============================================================