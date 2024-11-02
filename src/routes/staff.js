const { Router } = require("express");
const router = Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const pg = require("pg");
router.get("/", (req, res) => {
  console.log("GET /staff");
  res.send("GET /staff");
});

const db = new pg.Client({
  user: "postgres",
  password: "12345",
  host: "localhost",
  port: 5432,
  database: "eduSync",
});

db.connect();

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).send("Token required");
  }
  console.log("Token received:", token);
  console.log("JWT_SECRET during verification:", process.env.JWT_SECRET);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user;
    next();
  });
}

router.get("/getStudentByClass", authenticateToken, async (req, res, next) => {
  try {
    const { studentClass } = req.body;
    const query = "SELECT name, class, date_of_birth, phone_number, register_no FROM student WHERE class=$1 ORDER BY name";
    const values = [studentClass];
    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).send("No students found");
    } else {
      res.status(200).send(result.rows);
    }
  } catch (err) {
    next(err);
  }
});

router.get("/getStudentById", authenticateToken, async (req, res, next) => {
  try {
    const {register_no} = req.body;
    const query= "SELECT name, class, date_of_birth, phone_number, register_no FROM student WHERE register_no=$1";
    const values = [register_no];
    const result= await db.query(query, values);
    if (result.rows.length === 0) {
      res.status(404).send("Student not found");
    } else {
      res.status(200).send(result.rows[0]);
    }
  } catch (err) {
    next(err);
    res.redirect("/getStudentById");
  }
});

router.post("/addStudent", authenticateToken, async (req, res, next) => {
  try {
    const { name, studentClass, date_of_birth, phone_number, register_no, password } = req.body;
    if (!name) {
      res.status(400).send("Name is required");
    } else if (!register_no) {
      res.status(400).send("Register number is required");
    } else if (!date_of_birth) {
      res.status(400).send("Date of birth is required");
    } else if (!phone_number) {
      res.status(400).send("Phone number is required");
    } else if (!register_no){
      res.status(400).send("Register number is required");
    } else if (!password){
      res.status(400).send("Password is required");
    }
    else {
      const query =
        "INSERT INTO student(name, class, date_of_birth, phone_number, register_no, password) VALUES($1, $2, $3, $4, $5, $6) RETURNING *";
      const values = [name, studentClass, date_of_birth, phone_number, register_no, password];
      const result = await db.query(query, values);
      res.status(200).send(result.rows[0]);
    }
  } catch (err) {
    next(err);
    res.redirect("/addStudent");
  }
});

router.delete("/deleteStudent", authenticateToken, async (req, res, next) => {
  try {
    const { register_no } = req.body;
    if (!register_no) {
      res.status(400).send("Register number is required");
    } else {
      const query = "DELETE FROM student WHERE register_no=$1";
      const values = [register_no];
      const result = await db.query(query, values);
      if (result.rowCount === 0) {
        res.status(404).send("Student not found");
      } else {
        res.status(200).send("Deleted successfully");
      }
    }
  } catch (err) {
    next(err);
    res.redirect("/deleteStudent");
  }
});

router.put("/updateStudent", authenticateToken, async (req, res, next) => {   //first call getStudentById, make changes ,then redirect to updateStudent
  try {
    const { name, studentClass, date_of_birth, phone_number, register_no } = req.body;
    if (!name) {
      res.status(400).send("Name is required");
    } else if (!register_no) {
      res.status(400).send("Register number is required");
    } else if (!date_of_birth) {
      res.status(400).send("Date of birth is required");
    } else if (!phone_number) {s
      res.status(400).send("Phone number is required");
    } else {
      const query = "UPDATE student SET name=$1, class=$2, date_of_birth=$3, phone_number=$4 WHERE register_no=$5 RETURNING *";
      const values = [name, studentClass, date_of_birth, phone_number, register_no];
      const result = await db.query(query, values);
      if (result.rowCount === 0) {
        res.status(404).send("Student not found");
      } else {
        res.status(200).send(result.rows[0]);
      }
    }
  } catch (err) {
    next(err);
    res.redirect("/updateStudent");
  }
});

router.get("/viewSchedule", authenticateToken, async (req, res, next) => {
  try {
    const { className } = req.body;    //input the class name whose schedule is to be viewed
    const tableName = `schedule_${className}`;
    const result = await db.query(`SELECT * FROM ${tableName}`);
    if (result.rows.length === 0) {
      res.status(404).send("No schedule found for the given class");
    } else {
      res.status(200).send(result.rows);
    }
  } catch (err) {
    next(err);
  }
});

router.post('/addSchedule', authenticateToken, async (req, res) => { 
  const { schedule, className } = req.body; 
  if (!schedule || !className) {
    return res.status(400).send('Missing required fields');
  }
  const tableName = `schedule_${className}`;
  try {
    // Create table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
        day VARCHAR(10) PRIMARY KEY,
        hours VARCHAR(25)[]
      );
    `;
    await db.query(createTableQuery);

    // Loop through the schedule object and insert/update each day's schedule
    for (const [day, hours] of Object.entries(schedule)) {
      const insertQuery = `
        INSERT INTO ${tableName} (day, hours)
        VALUES ($1, $2)
        ON CONFLICT (day)
        DO UPDATE SET hours = EXCLUDED.hours;
      `;
      await db.query(insertQuery, [day, hours]);
    }

    res.status(200).send(`Schedule for class ${className} updated successfully`);
  } catch (err) {
    console.error('Error updating schedule:', err);
    res.status(500).send('Server error');
  }
});

router.get('/showClasses', authenticateToken, async (req, res) => {
  const result = await db.query('SELECT * FROM class');
  if (result.rows.length === 0) {
    res.status(404).send('No classes found');
  } else {
    res.status(200).send(result.rows);
  }
});

router.post('/updateAttendance', authenticateToken, async (req, res) => {
  const { className, date_of_att, day, hour, course_no, attendance } = req.body;
  if (!className || !date_of_att || !day || !hour || !course_no || !attendance || !Array.isArray(attendance)) {
    return res.status(400).send('Missing required fields or invalid attendance format');
  }
  const tableName = `attendance_${className}`;
  try {
    // Loop through the attendance array and update each student's attendance
    for (const { register_no, att } of attendance) {
      const updateQuery = `
        UPDATE ${tableName}
        SET att = $1
        WHERE date_of_att = $2 AND hour = $3 AND register_no = $4 AND course_no = $5;
      `;
      await db.query(updateQuery, [att, date_of_att, hour, register_no, course_no]);
    }
    res.status(200).send('Attendance updated successfully');
  } catch (err) {
    console.error('Error updating attendance:', err);
    res.status(500).send('Server error');
  }
});



router.get('/getAttendance', authenticateToken, async (req, res) => {
  const { className, date_of_att } = req.body;
  if (!className || !date_of_att) {
    return res.status(400).send('Missing required fields');
  }
  const tableName = `attendance_${className}`;
  try {
    const result = await db.query(`SELECT * FROM ${tableName} WHERE date_of_att = $1`, [date_of_att]);
    if (result.rows.length === 0) {
      res.status(404).send('No attendance found for the given class and date');
    } else {
      res.status(200).send(result.rows);
    }
  } catch (err) {
    console.error('Error fetching attendance:', err);
    res.status(500).send('Server error');
  }
});

router.post('/giveAssignment', authenticateToken, async (req, res) => {
  const { className, description, marks, dueDate, staff_no, course_no } = req.body;
  if (!className || !description || !marks || !dueDate || !staff_no || !course_no) {
    return res.status(400).send('Missing required fields');
  }
  const tableName = `assignment_${className}`;    //table for assignmemts
  const markstableName = `assignment_marks_${className}`;    //table for assignment marks
  try {
    // Create table if it doesn't exist
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS ${tableName} (
      assignment_no SERIAL PRIMARY KEY,
      description VARCHAR(1000),
      marks INTEGER,
      due_date DATE,
      staff_no INTEGER,
      course_no VARCHAR(25)
      );
    `;
    await db.query(createTableQuery);

    // Insert the assignment
    const insertQuery = `
      INSERT INTO ${tableName} (description, marks, due_date, staff_no, course_no)
      VALUES ($1, $2, $3, $4, $5);
    `;
    await db.query(insertQuery, [description, marks, dueDate, staff_no, course_no]);

    // Fetch all students in the class and set their marks to NULL
    const fetchStudentsQuery = `
      SELECT register_no FROM student WHERE class = $1 order by name;
    `;
    const studentsResult = await db.query(fetchStudentsQuery, [className]);

    for (const student of studentsResult.rows) {
      const insertMarksQuery = `
      INSERT INTO ${markstableName} (assignment_no, register_no, total_marks, award_marks)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (assignment_no, register_no)
      DO UPDATE SET total_marks = EXCLUDED.total_marks, award_marks = EXCLUDED.award_marks;
      `;
      await db.query(insertMarksQuery, [assignment_no, student.register_no, marks, NULL]);
    }

    res.status(200).send('Assignment added successfully');
  } catch (err) {
    console.error('Error adding assignment:', err);
    res.status(500).send('Server error');
  }
});

router.get('/getAssignmentByClass', authenticateToken, async (req, res) => {
  const { className } = req.body;
  if (!className) {
    return res.status(400).send('Missing required fields');
  }
  const tableName = `assignment_${className}`;
  try {
    const result = await db.query(`SELECT * FROM ${tableName}`);
    if (result.rows.length === 0) {
      res.status(404).send('No assignments found for the given class');
    } else {
      res.status(200).send(result.rows);
    }
  } catch (err) {
    console.error('Error fetching assignments:', err);
    res.status(500).send('Server error');
  }
});

router.delete('/deleteAssignment', authenticateToken, async (req, res) => {
  const { className, assignment_no } = req.body;
  if (!className || !assignment_no) {
    return res.status(400).send('Missing required fields');
  }
  const tableName = `assignment_${className}`;
  try {
    const deleteQuery = `
      DELETE FROM ${tableName}
      WHERE assignment_no = $1;
    `;
    const result = await db.query(deleteQuery, [assignment_no]);
    if (result.rowCount === 0) {
      res.status(404).send('Assignment not found');
    } else {
      res.status(200).send('Assignment deleted successfully');
    }
  } catch (err) {
    console.error('Error deleting assignment:', err);
    res.status(500).send('Server error');
  }
});

router.post('/markAssignment', authenticateToken, async (req, res) => {
  const { className, assignment_no, marks } = req.body;
  if (!className || !assignment_no || !marks || !Array.isArray(marks)) {
    return res.status(400).send('Missing required fields or invalid marks format');
  }
  const markstableName = `assignment_marks_${className}`;
  try {
    // Loop through each student's marks and update them
    for (const { register_no, award_marks } of marks) {
      const updateQuery = `
        UPDATE ${markstableName}
        SET award_marks = $1
        WHERE assignment_no = $2 AND register_no = $3;
      `;
      await db.query(updateQuery, [award_marks, assignment_no, register_no]);
    }

    res.status(200).send('Marks updated successfully');
  } catch (err) {
    console.error('Error updating marks:', err);
    res.status(500).send('Server error');
  }
});

router.get('/getMarks', authenticateToken, async (req, res) => {
  const { className, assignment_no } = req.body;
  if (!className || !assignment_no) {
    return res.status(400).send('Missing required fields');
  }
  const tableName = `assignment_marks_${className}`;
  try {
    const result = await db.query(`SELECT * FROM ${tableName} WHERE assignment_no = $1`, [assignment_no]);
    if (result.rows.length === 0) {
      res.status(404).send('No marks found for the given class and assignment');
    } else {
      res.status(200).send(result.rows);
    }
  } catch (err) {
    console.error('Error fetching marks:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;