const { Router } = require("express");
const router = Router();
const {Client} = require("pg");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const db = require("../db");

db.connect();

// JWT Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Token required");
  }
  console.log("Token:", token);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user;
    next();
  });
}

router.get("/", authenticateToken, (req, res) => {
  console.log("GET /student");
  res.send("GET /student");
});
router.post("/login", async (req, res) => {
  const { register_no, password } = req.body;

  try {
    const result = await db.query(
      `SELECT name,register_no,password FROM student WHERE register_no=$1`,
      [register_no],
    );
    const user = result.rows[0];

    if (!user || user.password !== password) {
      return res.status(401).send("Invalid credentials");
    }

    const token = jwt.sign(
      {
        name: user.name,
        register_no: user.register_no,
        //assignment_no: user.assignment_no,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1y" },
    );

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
});
router.get("/viewStudentDetails", authenticateToken, async (req, res, next) => {
  const register_no = req.user.register_no;
  const result = await db.query(`SELECT * from student where register_no=$1`, [
    register_no,
  ]);
  const student = result.rows[0];
  res.status(200).json(student);
});

router.get(
  "/viewAttendance/:register_no",
  authenticateToken,
  async (req, res, next) => {
    const register_no = req.params.register_no;

    try {
      const className =
        "SELECT LOWER(class) AS class from student where register_no=$1";
      const classResult = await db.query(className, [register_no]);
      const studentClass = classResult.rows[0].class;
      const tableName = `attendence_${studentClass}`;

      const query = `SELECT * FROM ${tableName} WHERE register_no=$1`;
      const values = [register_no];

      const result = await db.query(query, values);
      console.log("Result:", result.rows);
      const attendanceData = result.rows.map((row) => ({
        att_id: row.att_id,
        date_of_att: row.date_of_att,
        hour: row.hour !== null ? row.hour : "Not recorded",
        day: row.day.replace(/\"/g, ""),
        //status: row.is_present ? "Present" : "Absent",
      }));

      res.status(200).json(attendanceData);
    } catch (err) {
      next(err);
    }
  },
);
router.get(
  "/viewAssignmentsWithMarks",
  authenticateToken,
  async (req, res, next) => {
    //const register_no = req.user.register_no; // Extracting register_no from the token
    const register_no = req.user.register_no;
    const classN =
      "SELECT LOWER(class) AS class from student where register_no=$1";
    const classNa = await db.query(classN, [register_no]);
    const className = classNa.rows[0].class;
    console.log("Class name:", className);
    try {
      const query = `
      SELECT
        a.assignment_no,
        a.description,
        a.due_date,
        am.award_marks,
        a.marks,
        a.course_no
      FROM
        assignment_${className} a
      LEFT JOIN
        assignment_marks_${className} am
      ON
        a.assignment_no = am.assignment_no AND am.register_no = $1

      ORDER BY a.assignment_no;
    `;
      //const values = [register_no]; // Register number to filter marks

      const result = await db.query(query, [register_no]);
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  },
);
router.get(
  "/viewRemainingAssignments",
  authenticateToken,
  async (req, res, next) => {
    const register_no = req.user.register_no;
    const classN =
      "SELECT LOWER(class) AS class from student where register_no=$1";
    const classNa = await db.query(classN, [register_no]);
    const className = classNa.rows[0].class;
    try {
      const query = `SELECT
                a.assignment_no,
                a.description,
                a.due_date,
                a.course_no,
                a.marks AS total_marks
              FROM
                assignment_${className} a
              LEFT JOIN
                assignment_marks_${className} am
              ON
                a.assignment_no = am.assignment_no AND am.register_no = $1
              WHERE
                am.award_marks IS NULL
              ORDER BY
                a.assignment_no;`;

      const values = [register_no];
      const result = await db.query(query, values);
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
      res.redirect("/viewRemainingAssignments");
    }
  },
);
router.get(
  "/viewStudents/:classno",
  authenticateToken,
  /*checkStudent,*/
  async (req, res, next) => {
    const classno = req.params.classno;
    try {
      const query =
        "SELECT name,register_no FROM student WHERE class=$1 ORDER BY register_no";
      const result = await db.query(query, [classno]);
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  },
);
router.put("/changePassword", authenticateToken, async (req, res, next) => {
  const register_no = req.user.register_no;
  const newPassword = req.body.newPassword;
  if (!newPassword) {
    return res.status(400).send("New password is required");
  }
  try {
    const result = await db.query(
      `UPDATE student SET password=$1 WHERE register_no=$2`,
      [newPassword, register_no],
    );
    res.status(200).send("Password changed successfully");
  } catch (err) {
    next(err);
  }
});
router.get(
  "/viewStudentDetails/:register_no",
  authenticateToken,
  /*validateStudent,*/
  async (req, res, next) => {
    const register_no = req.params.register_no;
    try {
      const query = "SELECT * FROM student WHERE register_no=$1";
      const result = await db.query(query, [register_no]);
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  },
);

router.get("/viewSchedule", authenticateToken, async (req, res, next) => {
  try {
    const register_no = req.user.register_no;
    //console.log(register_no);
    const classN = `SELECT class from student where register_no=$1`;
    const classNa = await db.query(classN, [register_no]);
    //console.log("Class", classNa.rows[0]);
    if (classNa.rows.length === 0) {
      return res.status(404).send("No schedule found");
    }
    const className = classNa.rows[0].class.toLowerCase();
    const query = `
      SELECT day, hours
      FROM schedule_${className}
      ;
    `;
    const result = await db.query(query);
    let schedule = {};
    result.rows.forEach((row) => {
      const day = row.day;
      const hours = row.hours;
      if (!schedule[day]) {
        schedule[day] = [];
      }
      schedule[day].push(hours);
    });
    res.status(200).send(schedule);
  } catch (err) {
    console.error("Error fetching schedule:", err);
    next(err);
  }
});
router.get(
  "/viewAttendancePercentage",
  authenticateToken,
  async (req, res, next) => {
    const register_no = req.user.register_no;

    const classNameResult = await db.query(
      `SELECT class FROM student WHERE register_no=$1`,
      [register_no],
    );
    if (classNameResult.rows.length === 0) {
      return res.status(400).json({ error: "Class name is required" });
    }
    const className = classNameResult.rows[0].class;
    try {
      const result = await db.query(
        `
      SELECT
        course_no,
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE att) AS present,
        (COUNT(*) FILTER (WHERE att)::float / COUNT(*) * 100) AS attendance_percentage
      FROM attendence_${className}
      WHERE register_no = $1
      GROUP BY course_no
    `,
        [register_no],
      );

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching attendance percentage:", error);
      next(error);
    }
  },
);

async function validateStudent(req, res, next) {
  const regi_no = req.body.register_no;
  const userPassword = req.body.password;

  try {
    const result = await db.query(
      "SELECT password FROM student WHERE register_no=$1",
      [regi_no],
    );
    const storedPassword = result.rows[0]?.password;

    if (!storedPassword) {
      return res.status(404).send("User not found");
    }

    if (storedPassword === userPassword) {
      next();
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (err) {
    next(err);
  }
}

async function checkStudent(req, res, next) {
  const username = req.body.name;
  const register_no = req.body.register_no;
  const stored_username = await db.query(
    "SELECT name FROM student WHERE register_no=$1",
    [register_no],
  );
  if (stored_username != username) {
    res.status(401).send("Unauthorized");
  }
  next();
}

module.exports = router;

// I hope this shit works
