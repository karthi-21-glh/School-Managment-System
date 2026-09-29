-- ============================================
-- SCHOOL MANAGEMENT SYSTEM
-- PostgreSQL Database Schema
-- ============================================

-- -------------------------
-- ADMINISTRATOR
-- -------------------------

CREATE TABLE administrator (
    admin_id VARCHAR(10) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);


-- -------------------------
-- STUDENT
-- -------------------------

CREATE TABLE student (
    reg_no VARCHAR(15) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    class VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    admin_id VARCHAR(10) NOT NULL,
    house_no VARCHAR(20),
    city VARCHAR(50),
    pin VARCHAR(10),

    CONSTRAINT fk_student_admin
        FOREIGN KEY (admin_id)
        REFERENCES administrator(admin_id),

    CONSTRAINT chk_student_gender
        CHECK (gender IN ('Male', 'Female', 'Other'))
);


-- -------------------------
-- MARKS
-- -------------------------

CREATE TABLE marks (
    mark_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reg_no VARCHAR(15) NOT NULL,
    exam_type VARCHAR(30) NOT NULL,
    first_language INTEGER NOT NULL,
    second_language INTEGER NOT NULL,
    mathematics INTEGER NOT NULL,
    science INTEGER NOT NULL,
    arts INTEGER NOT NULL,
    others INTEGER NOT NULL,

    CONSTRAINT fk_marks_student
        FOREIGN KEY (reg_no)
        REFERENCES student(reg_no),

    CONSTRAINT chk_first_language
        CHECK (first_language >= 0 AND first_language <= 100),

    CONSTRAINT chk_second_language
        CHECK (second_language >= 0 AND second_language <= 100),

    CONSTRAINT chk_mathematics
        CHECK (mathematics >= 0 AND mathematics <= 100),

    CONSTRAINT chk_science
        CHECK (science >= 0 AND science <= 100),

    CONSTRAINT chk_arts
        CHECK (arts >= 0 AND arts <= 100),

    CONSTRAINT chk_others
        CHECK (others >= 0 AND others <= 100)
);


-- -------------------------
-- ATTENDANCE
-- -------------------------

CREATE TABLE attendance (
    attend_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    reg_no VARCHAR(15) NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(10) NOT NULL,

    CONSTRAINT fk_attendance_student
        FOREIGN KEY (reg_no)
        REFERENCES student(reg_no),

    CONSTRAINT chk_attendance_status
        CHECK (status IN ('Present', 'Absent')),

    CONSTRAINT uq_student_attendance_date
        UNIQUE (reg_no, attendance_date)
);


-- -------------------------
-- REPORT
-- -------------------------

CREATE TABLE report (
    report_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    mark_id INTEGER NOT NULL,
    reg_no VARCHAR(15) NOT NULL,

    CONSTRAINT fk_report_marks
        FOREIGN KEY (mark_id)
        REFERENCES marks(mark_id),

    CONSTRAINT fk_report_student
        FOREIGN KEY (reg_no)
        REFERENCES student(reg_no)
);


-- ============================================
-- REPORT VIEW
-- Derived values:
-- TotalMarks, Average, Grade
-- ============================================

CREATE VIEW student_reports AS
SELECT
    r.report_id,
    r.reg_no,
    s.full_name,
    m.mark_id,
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
    ) AS average,

    CASE
        WHEN (
            m.first_language +
            m.second_language +
            m.mathematics +
            m.science +
            m.arts +
            m.others
        ) / 6.0 >= 90 THEN 'A+'

        WHEN (
            m.first_language +
            m.second_language +
            m.mathematics +
            m.science +
            m.arts +
            m.others
        ) / 6.0 >= 80 THEN 'A'

        WHEN (
            m.first_language +
            m.second_language +
            m.mathematics +
            m.science +
            m.arts +
            m.others
        ) / 6.0 >= 70 THEN 'B'

        WHEN (
            m.first_language +
            m.second_language +
            m.mathematics +
            m.science +
            m.arts +
            m.others
        ) / 6.0 >= 60 THEN 'C'

        WHEN (
            m.first_language +
            m.second_language +
            m.mathematics +
            m.science +
            m.arts +
            m.others
        ) / 6.0 >= 50 THEN 'D'

        ELSE 'F'
    END AS grade

FROM report r
JOIN marks m
    ON r.mark_id = m.mark_id
JOIN student s
    ON r.reg_no = s.reg_no;


-- ============================================
-- STUDENT VIEW
-- Age is derived from DateOfBirth
-- ============================================

CREATE VIEW student_details AS
SELECT
    reg_no,
    full_name,
    class,
    date_of_birth,

    EXTRACT(
        YEAR FROM AGE(CURRENT_DATE, date_of_birth)
    )::INTEGER AS age,

    gender,
    phone,
    email,
    admin_id,
    house_no,
    city,
    pin

FROM student;