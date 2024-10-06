const express = require("express");
const app = express();
const adminRoutes = require("./routes/admin");
const studentRoutes = require("./routes/student");
const staffRoutes = require("./routes/staff");
const port = 3000;
const pg = require("pg");
const db = new pg.Client({
  user: "nikhiltomy",
  password: "test",
  host: "localhost",
  port: 5432,
  database: "student",
});

try {
  db.connect();
  console.log("Connected to the database");
} catch (error) {
  console.error("Database connection error", error);
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/student", studentRoutes);
app.use("/staff", staffRoutes);
app.use("/admin", adminRoutes);
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
