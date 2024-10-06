const { Router } = require("express");
const router = Router();
const pg = require("pg");

const db = new pg.Client({
  user: "nikhiltomy",
  password: "test",
  host: "localhost",
  port: 5432,
  database: "student",
});

db.connect();

db.query("SELECT * FROM staff", (err, res) => {
  if (err) {
    console.log(err);
  } else {
    console.log(res.rows);
  }
});
router.get("/", (req, res) => {
  console.log("GET /student");
  res.send("GET /student");
});

router.get("/viewStudents/:classno", async (req, res, next) => {
  const classno = req.params.classno;
  const { regino, name, classNo, dob, phone } = req.body;
  try {
    const query =
      "SELECT name,regi_no FROM student WHERE classno=$1 ORDER BY regi_no";
    const result = await db.query(query, [classno]);
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
});
router.get(
  "/viewStudentDetails/:regi_no",
  validateStudent,
  async (req, res, next) => {
    const regi_no = req.params.regi_no;
    try {
      const query = "SELECT * FROM student WHERE regi_no=$1";
      const result = await db.query(query, [regi_no]);
      res.status(200).json(result.rows);
    } catch (err) {
      next(err);
    }
  },
);
router.get("/viewSchedule");
async function validateStudent(req, res, next) {
  const regi_no = req.body.regi_no;
  const userPassword = req.body.password;

  console.log("Requested regi_no:", regi_no);

  try {
    const result = await db.query(
      "SELECT password FROM student WHERE regi_no=$1",
      [regi_no],
    );

    // Safely get the stored password
    const storedPassword = result.rows[0]?.password;

    // Check if the student exists
    if (!storedPassword) {
      return res.status(404).send("User not found");
    }

    // Compare the stored password with the user-provided password
    if (storedPassword === userPassword) {
      next();
    } else {
      res.status(401).send("Unauthorized");
    }
  } catch (err) {
    console.error("Error checking student:", err);
    next(err); // Pass the error to the next middleware
  }
}
async function checkStudent(req, res, next) {
  const username = req.body.username;
  const reg_no = req.body.regi_no;
  const stored_username = await db.query(
    "SELECT username FROM student WHERE regi_no=$1",
    [reg_no],
  );
}
module.exports = router;
