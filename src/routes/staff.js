const { Router } = require("express");
const router = Router();
router.get("/", (req, res) => {
  console.log("GET /staff");
  res.send("GET /staff");
});

module.exports = router;
