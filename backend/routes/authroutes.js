const express = require("express");
const router = express.Router();
const { register, login, getMe, getAgents } = require("../controllers/authcontrollers");
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/agents", protect, getAgents);

module.exports = router;