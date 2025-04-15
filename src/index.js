const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/student");
const staffRoutes = require("./routes/staff");
const port = process.env.PORT || 3600;
const db = require("./db");


try {
  db.connect();
  console.log("Connected to the database");
} catch (error) {
  console.error("Database connection error", error);
}
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const jwtSecret = process.env.JWT_SECRET;

app.get("/", (req, res) => {
  const token = jwt.sign({ data: "test" }, jwtSecret, { expiresIn: "10y" });
  res.send(`Hello Welcome??`);
});
app.use("/student", studentRoutes);
app.use("/staff", staffRoutes);
app.use("/admin", adminRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
