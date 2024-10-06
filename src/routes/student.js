const { Router } = require("express");
const router = Router();
router.get("/", (req, res) => {
  console.log("GET /student");
  res.send("GET /student");
});

module.exports = router;
