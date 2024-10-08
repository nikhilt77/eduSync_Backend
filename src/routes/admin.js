const { Router } = require("express");
const router = Router();
const pg = require("pg");
router.get("/", (req, res) => {
  console.log("GET /admin");
  res.send("GET /admin");
});
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
router.post("/signup", async (req, res, next) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const query =
      "INSERT INTO admin_credentials(username,password,role) VALUES($1,$2,$3) RETURNING *";
    const values = [username, password, role];
    const result = await db.query(query, values);
    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});
router.post("/addStaff", checkAdmin, async (req, res, next) => {
  try {
    const { name, role, classInCharge, password } = req.body;
    if (!name) {
      res.status(400).send("Name is required");
    } else if (!username) {
      res.status(400).send("Username is required");
    } else if (!role) {
      res.status(400).send("Role is required");
    } else if (!password) {
      res.status(400).send("Password is required");
    } else {
      const query =
        "INSERT INTO public.staff(name, in_charge_of, course_charges, password) VALUES ($1,$2,$3,$4) RETURNING *";
      const values = [name, classInCharge, role, password];
      const result = await db.query(query, values);
      res.status(200).send(result.rows[0]);
      res.redirect("/addStaff");
    }
  } catch (err) {
    next(err);
  }
});
router.get("/viewStaff", checkAdmin, async (req, res, next) => {
  try {
    const query = "SELECT * FROM staff";
    const result = await db.query(query);
    res.status(200).send(result.rows);
  } catch (err) {
    next(err);
  }
});
router.get("/viewStaffAdvisor", checkAdmin, async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT * FROM staff WHERE in_charge_of IS NOT NULL",
    );
    res.status(200).send(result.rows);
    res.redirect("/viewStaffAdvisor");
  } catch (err) {
    next(err);
  }
});
function checkAdmin(req, res, next) {
  const ROLE = req.body.role;
  const password = db.query("SELECT password FROM staff WHERE staff_no=$1", [
    req.body.username,
  ]);
  if (ROLE !== "admin" || password !== req.body.password) {
    res.status(401).send("Unauthorized");
  } else {
    next();
  }
}

router.get("/", (req, res) => {
  res.send("Welcome to Admin Page");
});

module.exports = router;
