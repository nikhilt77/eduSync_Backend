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
  user: process.env.postgresusername,
  password: process.env.password,
  host: process.env.host,
  port: 5432,
  database: process.env.database,
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
router.post("/login", async (req, res) => {
  const { name, password } = req.body;
  const query = "SELECT * FROM staff WHERE name=$1 AND password=$2";
  const values = [name, password];
  const result = await db.query(query, values);
  if (result.rows.length === 0) {
    res.status(401).send("Invalid credentials");
  } else {
    const user = result.rows[0];
    const token = jwt.sign(
      {
        name: user.name,
        //email: user.email,
        staff_no: user.staff_no,
      },
      process.env.JWT_SECRET,
    );
    res.json(token);
  }
});
router.get(
  "/getStudentByClass/:studentClass",
  authenticateToken,
  async (req, res, next) => {
    try {
      const studentClass = req.params.studentClass;
      const query =
        "SELECT name, class, date_of_birth, phone_number, register_no FROM student WHERE class=$1 ORDER BY name";
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
  },
);

router.get(
  "/getStudentById/:register_no",
  authenticateToken,
  async (req, res, next) => {
    try {
      const register_no = req.params.register_no;
      if (!register_no) {
        return res.status(400).send("Register number is required");
      }
      const query =
        "SELECT name, class, date_of_birth, phone_number, register_no FROM student WHERE register_no=$1";
      const values = [register_no];
      const result = await db.query(query, values);

      if (result.rows.length === 0) {
        res.status(404).send("Student not found");
      } else {
        res.status(200).send(result.rows[0]);
      }
    } catch (err) {
      next(err);
    }
  },
);

router.post("/addStudents", authenticateToken, async (req, res, next) => {
  try {
    const { studentClass, students } = req.body;
    if (!studentClass) {
      return res.status(400).send("Class is required");
    }
    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).send("Students array is required");
    }

    for (const student of students) {
      const { name, date_of_birth, phone_number, register_no, password } =
        student;

      if (
        !name ||
        !date_of_birth ||
        !phone_number ||
        !register_no ||
        !password
      ) {
        return res.status(400).send("All student fields are required");
      }

      const query = `
        INSERT INTO student(name, class, date_of_birth, phone_number, register_no, password)
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING *`;
      const values = [
        name,
        studentClass,
        date_of_birth,
        phone_number,
        register_no,
        password,
      ];
      await db.query(query, values);
    }

    res.status(200).send("Students added successfully");
  } catch (err) {
    next(err);
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

router.put("/updateStudent", authenticateToken, async (req, res, next) => {
  //first call getStudentById, make changes ,then redirect to updateStudent
  try {
    const { name, studentClass, date_of_birth, phone_number, register_no } =
      req.body;
    if (!name) {
      res.status(400).send("Name is required");
    } else if (!register_no) {
      res.status(400).send("Register number is required");
    } else if (!date_of_birth) {
      res.status(400).send("Date of birth is required");
    } else if (!phone_number) {
      s;
      res.status(400).send("Phone number is required");
    } else {
      const query =
        "UPDATE student SET name=$1, class=$2, date_of_birth=$3, phone_number=$4 WHERE register_no=$5 RETURNING *";
      const values = [
        name,
        studentClass,
        date_of_birth,
        phone_number,
        register_no,
      ];
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

router.get(
  "/viewSchedule/:className",
  authenticateToken,
  async (req, res, next) => {
    const className = req.params.className;
    try {
      //const { className } = req.body; //input the class name whose schedule is to be viewed
      const tableName = `schedule_${className}`;
      const result = await db.query(`SELECT * FROM ${tableName}`);
      if (result.rowCount === 0) {
        res.status(404).send("No schedule found for the given class");
      } else {
        res.status(200).send(result.rows);
      }
    } catch (err) {
      res.status(500).send("No schedule found for the given class");
      next(err);
    }
  },
);

router.post("/addSchedule", authenticateToken, async (req, res) => {
  const { schedule, className } = req.body;
  if (!schedule || !className) {
    return res.status(400).send("Missing required fields");
  }
  const tableName = `schedule_${className}`;
  try {
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
    res
      .status(200)
      .send(`Schedule for class ${className} updated successfully`);
  } catch (err) {
    console.error("Error updating schedule:", err);
    res.status(500).send("Server error");
  }
});

router.delete("/deleteSchedule", authenticateToken, async (req, res) => {
  const { className } = req.body;
  if (!className) {
    return res.status(400).send("Missing required fields");
  }
  const tableName = `schedule_${className}`;
  try {
    const deleteQuery = `DELETE FROM ${tableName}`;
    await db.query(deleteQuery);
    res
      .status(200)
      .send(`Schedule for class ${className} deleted successfully`);
  } catch (err) {
    console.error("Error deleting schedule:", err);
    res.status(500).send("Server error");
  }
});

// router.post('/markAttendance', authenticateToken, async (req, res) => {
//   const  { className, date_of_att, day, hour, course_no, attendance } = req.body;
//   if (!className || !date_of_att || !day || !hour || !course_no || !attendance || !Array.isArray(attendance)) {
//     return res.status(400).send('Missing required fields or invalid attendance format');
//   }
//   let tableName = `attendance_${className}`;
//   const scheduleTable = `schedule_${className}`;
//   try {
//     // Check if the course exists in the schedule for the given day and hour
//     const scheduleQuery = `
//       SELECT hours FROM ${scheduleTable} WHERE day = $1;
//     `;
//     const scheduleResult = await db.query(scheduleQuery, [day]);

//     /*if (scheduleResult.rows.length === 0 || !scheduleResult.rows[0].hours[hour - 1] || scheduleResult.rows[0].hours[hour - 1] !== course_no) {
//       return res.status(400).send(⁠ No course scheduled for ${day} at hour ${hour} ⁠);
//       }*/

//     // Create table if it doesn't exist
//     const createTableQuery = `
//       CREATE TABLE IF NOT EXISTS ${tableName} (
//         date_of_att DATE,
//         day VARCHAR(10),
//         register_no VARCHAR(25),
//         course_no VARCHAR(25),
//         hour INTEGER,
//         att BOOLEAN,
//         PRIMARY KEY (date_of_att, hour, register_no, course_no)
//       );
//     `;
//     await db.query(createTableQuery);

//     // Loop through the attendance array and insert/update each student's attendance
//     for (const { register_no, att } of attendance) {
//       const insertQuery = `
//         INSERT INTO ${tableName} (date_of_att, day, register_no, course_no, hour, att)
//         VALUES ($1, $2, $3, $4, $5, $6)
//         ON CONFLICT (date_of_att, hour, register_no, course_no)
//         DO UPDATE SET att = EXCLUDED.att;
//       `;
//       await db.query(insertQuery, [date_of_att, day, register_no, course_no, hour, att]);
//     }

//     res.status(200).send('Attendance marked successfully');
//   } catch (err) {
//     console.error('Error marking attendance:', err);
//     res.status(500).send('Server error');
//   }
// });
// Main attendance checking route
router.post(
  "/checkAttendance",
  authenticateToken,
  checkAssignmentAuthorization,
  checkSchedule,
  async (req, res) => {
    let { className, date_of_att, day, hour, course_no } = req.body;
    if (!className || !date_of_att || !day || !hour || !course_no) {
      return res.status(400).send("Missing required fields");
    }
    className = className.toLowerCase();
    const tableName = `attendence_${className}`;
    try {
      // Check if attendance already exists for the specified date, day, hour, and course_no
      const result = await db.query(
        `SELECT * FROM ${tableName} WHERE date_of_att = $1 AND day = $2 AND hour = $3 AND course_no = $4`,
        [date_of_att, day, hour, course_no],
      );
      // If attendance already exists
      if (result.rows.length > 0) {
        res.send(result.rows);
        /*return res
          .status(409)
          .send("Attendance already exists for the specified parameters.");*/
      } else {
        // Fetch all students in the class
        const studentsResult = await db.query(
          `SELECT register_no FROM student WHERE class = $1`,
          [className],
        );

        // Insert attendance entries for each student
        for (const student of studentsResult.rows) {
          await db.query(
            `INSERT INTO ${tableName} (date_of_att, day, register_no, course_no, hour, att) VALUES ($1, $2, $3, $4, $5, $6)`,
            [date_of_att, day, student.register_no, course_no, hour, true],
          );
        }
        const result2 = await db.query(
          `SELECT * FROM ${tableName} WHERE date_of_att = $1 AND day = $2 AND hour = $3 AND course_no = $4`,
          [date_of_att, day, hour, course_no],
        );
        res.status(200).send(result2.rows);
      }
    } catch (err) {
      console.error("Error recording attendance:", err);
      res.status(500).send("Server error");
    }
  },
);

// router.get("/getAttendance", authenticateToken, async (req, res) => {
//   const { className, date_of_att } = req.body;
//   if (!className || !date_of_att) {
//     return res.status(400).send("Missing required fields");
//   }
//   const tableName = `attendance_${className}`;
//   try {
//     const result = await db.query(
//       `SELECT * FROM ${tableName} WHERE date_of_att = $1`,
//       [date_of_att],
//     );
//     if (result.rows.length === 0) {
//       res.status(404).send("No attendance found for the given class and date");
//     } else {
//       res.status(200).send(result.rows);
//     }
//   } catch (err) {
//     console.error("Error fetching attendance:", err);
//     res.status(500).send("Server error");
//   }
// });

router.post(
  "/giveAssignment",
  authenticateToken,
  checkAssignmentAuthorization,
  async (req, res) => {
    let { className, description, marks, dueDate, course_no } = req.body;
    if (!className) {
      return res.status(400).send("Missing required field: className");
    }
    if (!description) {
      return res.status(400).send("Missing required field: description");
    }
    if (!marks) {
      return res.status(400).send("Missing required field: marks");
    }
    if (!dueDate) {
      return res.status(400).send("Missing required field: dueDate");
    }
    if (!course_no) {
      return res.status(400).send("Missing required field: course_no");
    }
    className = className.toLowerCase();
    const tableName = `assignment_${className}`;
    const marksTableName = `assignment_marks_${className}`;
    console.log("table name:", tableName);
    const staff_no = req.user.staff_no;
    try {
      const insertAssignmentQuery = `
      INSERT INTO ${tableName} (description, marks, due_date, staff_no, course_no)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING assignment_no;
    `;
      const assignmentResult = await db.query(insertAssignmentQuery, [
        description,
        marks,
        dueDate,
        staff_no,
        course_no,
      ]);
      const assignment_no = assignmentResult.rows[0].assignment_no;

      // Fetch all students in the class and set their marks to NULL
      const fetchStudentsQuery = `
      SELECT register_no FROM student WHERE class = $1 ORDER BY name;
    `;
      const studentsResult = await db.query(fetchStudentsQuery, [className]);

      for (const student of studentsResult.rows) {
        const insertMarksQuery = `
        INSERT INTO ${marksTableName} (register_no, assignment_no, total_marks, award_marks)
        VALUES ($1, $2, $3, $4);
      `;
        await db.query(insertMarksQuery, [
          student.register_no,
          assignment_no,
          marks,
          null, // Use null instead of NULL for JavaScript
        ]);
      }

      res.status(200).send("Assignment added successfully");
    } catch (err) {
      console.error("Error adding assignment:", err);
      res.status(500).send("Server error");
    }
  },
);

router.get(
  "/getAssignmentByClass/:className",
  authenticateToken,
  async (req, res) => {
    let className = req.params.className;
    if (!className) {
      return res.status(400).send("Missing required fields");
    }
    className = className.toLowerCase();
    const tableName = `assignment_${className}`;
    try {
      const result = await db.query(`SELECT * FROM ${tableName}`);
      if (result.rows.length === 0) {
        res.status(404).send("No assignments found for the given class");
      } else {
        res.status(200).send(result.rows);
      }
    } catch (err) {
      console.error("Error fetching assignments:", err);
      res.status(500).send("No such class found in assignments");
    }
  },
);
router.get("/getAssignmentsByStaff", authenticateToken, async (req, res) => {
  const staff_no = req.user.staff_no;

  try {
    const staffResult = await db.query(
      "SELECT course_charges FROM staff WHERE staff_no = $1",
      [staff_no],
    );
    if (staffResult.rows.length === 0) {
      return res.status(404).send("Staff member not found");
    }

    const courseCharges = staffResult.rows[0].course_charges;
    const assignments = [];

    for (const courseNo in courseCharges) {
      const classes = courseCharges[courseNo];
      for (const className of classes) {
        const tableName = `assignment_${className.toLowerCase()}`;

        try {
          const result = await db.query(
            `SELECT * FROM ${tableName} WHERE staff_no = $1 AND course_no = $2`,
            [staff_no, courseNo],
          );
          if (result.rows.length > 0) {
            assignments.push(...result.rows);
          }
        } catch (err) {
          console.error(
            `Error fetching assignments for class ${className.toLowerCase()} in course ${courseNo}:`,
            err,
          );
        }
      }
    }

    if (assignments.length === 0) {
      res.status(404).send("No assignments found for the given staff");
    } else {
      res.status(200).send(assignments);
    }
  } catch (err) {
    console.error("Error fetching assignments:", err);
    res.status(500).send("Server error");
  }
});

router.delete("/deleteAssignment", authenticateToken, async (req, res) => {
  let { className, assignment_no } = req.body;
  if (!className || !assignment_no) {
    return res.status(400).send("Missing required fields");
  }
  className = className.toLowerCase();
  const tableName = `assignment_${className}`;
  try {
    const classCheckQuery = `SELECT 1 FROM information_schema.tables WHERE table_name = $1`;
    const classCheckResult = await db.query(classCheckQuery, [tableName]);
    if (classCheckResult.rowCount === 0) {
      return res.status(404).send("No such class found");
    }

    const deleteQuery = `
      DELETE FROM ${tableName}
      WHERE assignment_no = $1;
    `;
    const result = await db.query(deleteQuery, [assignment_no]);
    if (result.rowCount === 0) {
      res.status(404).send("Assignment not found");
    } else {
      res.status(200).send("Assignment deleted successfully");
    }
  } catch (err) {
    console.error("Error deleting assignment:", err);
    res.status(500).send("Server error");
  }
});

router.post("/markAssignment", authenticateToken, async (req, res) => {
  let { className, assignment_no, marks } = req.body;
  if (!className || !assignment_no || !marks || !Array.isArray(marks)) {
    return res
      .status(400)
      .send("Missing required fields or invalid marks format");
  }
  className = className.toLowerCase();
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

    res.status(200).send("Marks updated successfully");
  } catch (err) {
    console.error("Error updating marks:", err);
    res.status(500).send("Server error");
  }
});

router.post("/getMarks", authenticateToken, async (req, res) => {
  let { className, assignment_no } = req.body;
  if (!className || !assignment_no) {
    return res.status(400).send("Missing required fields");
  }
  className = className.toLowerCase();
  const tableName = `assignment_marks_${className}`;
  try {
    const result = await db.query(
      `SELECT * FROM ${tableName} WHERE assignment_no = $1 order by register_no`,
      [assignment_no],
    );
    if (result.rows.length === 0) {
      res.status(404).send("No marks found for the given class and assignment");
    } else {
      res.status(200).send(result.rows);
    }
  } catch (err) {
    console.error("Error fetching marks:", err);
    res.status(500).send("Server error");
  }
});

router.get("/showClasses", authenticateToken, async (req, res) => {
  const result = await db.query("SELECT * FROM classes");
  if (result.rows.length === 0) {
    res.status(404).send("No classes found");
  } else {
    res.status(200).send(result.rows);
  }
});
router.get("/showCourses", async (req, res) => {
  const result = await db.query("SELECT * FROM courses");
  if (result.rows.length === 0) {
    res.status(404).send("No courses found");
  } else {
    res.status(200).send(result.rows);
  }
});
router.get("/selfDetails", authenticateToken, async (req, res, next) => {
  const staff_no = req.user.staff_no;
  try {
    const result = await db.query(`SELECT * FROM staff WHERE staff_no=$1`, [
      staff_no,
    ]);
    res.status(200).send(result.rows[0]);
  } catch (err) {
    console.error("Error fetching staff details:", err);
    res.status(500).send("Server error");
  }
});
router.put("/changePassword", authenticateToken, async (req, res) => {
  const staff_id = req.user.staff_no;
  const newPassword = req.body.newPassword;
  if (!newPassword) {
    return res.status(400).send("Missing required fields");
  }
  try {
    const result = await db.query(
      "UPDATE staff SET password=$1 WHERE staff_no=$2",
      [newPassword, staff_id],
    );
    res.status(200).send("Password changed successfully");
  } catch (err) {
    console.error("Error changing password:", err);
    res.status(500).send("Server error");
  }
});

router.put("/updateAttendance", authenticateToken, async (req, res) => {
  let { className, date_of_att, day, hour, course_no, attendance } = req.body;
  if (
    !className ||
    !date_of_att ||
    !day ||
    !hour ||
    !course_no ||
    !attendance ||
    !Array.isArray(attendance)
  ) {
    return res
      .status(400)
      .send("Missing required fields or invalid attendance format");
  }
  className = className.toLowerCase();
  const tableName = `attendence_${className}`;
  try {
    for (const { register_no, att } of attendance) {
      const updateQuery = `
        UPDATE ${tableName}
        SET att = $1
        WHERE date_of_att = $2 AND hour = $3 AND register_no = $4 AND course_no = $5;
      `;
      await db.query(updateQuery, [
        att,
        date_of_att,
        hour,
        register_no,
        course_no,
      ]);
    }
    res.status(200).send("Attendance updated successfully");
  } catch (err) {
    console.error("Error updating attendance:", err);
    res.status(500).send("Server error");
  }
});

async function checkAssignmentAuthorization(req, res, next) {
  const staffId = req.user.staff_no;
  const { className, course_no } = req.body;

  if (!className) {
    return res.status(400).send("Missing required field: className");
  }
  if (!course_no) {
    return res.status(400).send("Missing required field: course_no");
  }

  try {
    const query = `
      SELECT course_charges
      FROM staff
      WHERE staff_no = $1;
    `;

    const { rows } = await db.query(query, [staffId]);
    if (rows.length === 0) {
      return res.status(404).send("Staff member not found");
    }

    let { course_charges } = rows[0];

    // If course_charges is a string, parse it; otherwise, assume it’s an object
    if (typeof course_charges === "string") {
      try {
        course_charges = JSON.parse(course_charges);
      } catch (parseError) {
        console.error("Failed to parse course_charges:", parseError);
        return res.status(500).send("Invalid data format for course charges");
      }
    }

    // Check if the specified class exists in courseCharges and contains the course_no
    var isAuthorized = false;
    for (const courseKey in course_charges) {
      if (
        course_charges[courseKey].includes(className) &&
        courseKey === course_no
      ) {
        isAuthorized = true;
        break;
      }
    }
    if (!isAuthorized) {
      return res
        .status(403)
        .send("Not authorized to assign this course for the class");
    }

    next();
  } catch (error) {
    console.error("Error checking assignment authorization:", error.message);
    res.status(500).send("Server error: " + error.message);
  }
}

async function checkSchedule(req, res, next) {
  const { className, day, hour, course_no } = req.body;

  if (!day || !hour || !course_no || !className) {
    return res.status(400).send("Missing required fields");
  }

  const tableName = `schedule_${className}`;
  try {
    // Query to get the schedule for the given day
    const result = await db.query(
      `SELECT hours FROM ${tableName} WHERE day = $1`,
      [day],
    );

    if (result.rows.length === 0) {
      return res.status(404).send("No schedule found for the given day.");
    }

    // Check if the course_no matches the specified hour in the schedule
    const scheduledCourse = result.rows[0].hours[hour - 1];
    if (scheduledCourse !== course_no) {
      return res
        .status(403)
        .send("Course is not scheduled for the specified hour.");
    }

    next();
  } catch (err) {
    console.error("Error fetching schedule:", err);
    res.status(500).send("Server error");
  }
}

module.exports = router;

//I hope this shit works pt.😭5
