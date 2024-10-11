const { Router } = require("express");
const router = Router();
const pg = require("pg");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = new pg.Client({
  user: "nikhiltomy",
  password: "test",
  host: "localhost",
  port: 5432,
  database: "student",
});

db.connect();

// JWT Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Token required");
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send("Invalid token");
    req.user = user; // Attach user data from token to request
    next();
  });
}

router.get("/", authenticateToken, (req, res) => {
  res.send("Welcome to Admin Page");
});

router.post("/signup", async (req, res, next) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const query =
      "INSERT INTO admin_credentials(username, password, role) VALUES($1, $2, $3) RETURNING *";
    const values = [username, password, role];
    const result = await db.query(query, values);

    const token = jwt.sign({ username, role }, process.env.JWT_SECRET, {
      expiresIn: "100y",
    }); // Token will expire in 100 years

    res.status(200).json({
      message: "User created successfully",
      user: result.rows[0],
      token,
    });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/addStaff",
  authenticateToken,
  checkAdmin,
  async (req, res, next) => {
    try {
      const { name, username, role, classInCharge, password } = req.body;
      if (!name) {
        return res.status(400).send("Name is required");
      } else if (!username) {
        return res.status(400).send("Username is required");
      } else if (!role) {
        return res.status(400).send("Role is required");
      } else if (!password) {
        return res.status(400).send("Password is required");
      } else {
        const query =
          "INSERT INTO staff(name,username,role,classInCharge,password) VALUES($1,$2,$3,$4,$5) RETURNING *";
        const values = [name, username, role, classInCharge, password];
        const result = await db.query(query, values);
        res.status(200).send(result.rows[0]);
      }
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/viewStaff",
  authenticateToken,
  checkAdmin,
  async (req, res, next) => {
    try {
      const query = "SELECT * FROM staff";
      const result = await db.query(query);
      res.status(200).send(result.rows);
    } catch (err) {
      next(err);
    }
  },
);

router.get(
  "/viewStaffAdvisor",
  authenticateToken,
  checkAdmin,
  async (req, res, next) => {
    try {
      const result = await db.query(
        "SELECT * FROM staff WHERE classInCharge IS NOT NULL",
      );
      res.status(200).send(result.rows);
    } catch (err) {
      next(err);
    }
  },
);

function checkAdmin(req, res, next) {
  const role = req.user.role;
  if (role !== "admin") {
    return res.status(401).send("Unauthorized");
  }
  next();
}

module.exports = router;
