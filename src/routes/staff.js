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
  user: "nikhiltomy",
  password: "test",
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
router.get("/getStudent", authenticateToken, async (req, res, next) => {
  try {
    const result = await db.query("SELECT * FROM student");
    res.status(200).send(result.rows);
  } catch (err) {
    next(err);
  }
});

router.get("/getStudentById", authenticateToken, async (req, res, next) => {
  try {
    const reg_no = req.query.register_no;
    const result = await db.query(
      "SELECT * FROM student WHERE register_no=$1",
      [reg_no],
    );
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
    const { name, rollno, standard, section } = req.body;
    if (!name) {
      res.status(400).send("Name is required");
    } else if (!rollno) {
      res.status(400).send("Rollno is required");
    } else if (!standard) {
      res.status(400).send("Standard is required");
    } else if (!section) {
      res.status(400).send("Section is required");
    } else {
      const query =
        "INSERT INTO student(name,rollno,standard,section) VALUES($1,$2,$3,$4) RETURNING *";
      const values = [name, rollno, standard, section];
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

router.get("viewSchedule", authenticateToken, async (req, res, next) => {
  try {
    const role = req.body.role;
    if (role !== "staffadvisor") {
      res.status(401).send("Unauthorized");
    }
    const result = await db.query("SELECT * FROM schedule");
    res.status(200).send(result.rows);
  } catch (err) {
    next(err);
    res.redirect("/viewSchedule");
  }
});

module.exports = router;