
const { Client } = require("pg");

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

db.connect()
  .then(() => console.log("Connected to the database"))
  .catch((err) => console.error("Database connection error", err));

module.exports = db;

