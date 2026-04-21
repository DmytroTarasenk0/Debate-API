const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const statsController = require("../controllers/statsController");
const { authenticate } = require("../middleware/authMiddleware");

// anyone can register an account (or login)
router.post("/register", userController.createUser);
router.post("/login", userController.login);

router.use(authenticate);

// self-management
router.put("/password", userController.updatePassword);
router.put("/username", userController.updateUsername);
router.delete("/", userController.deleteUser);

router.get("/:id/stats", statsController.getUserStats);

module.exports = router;
