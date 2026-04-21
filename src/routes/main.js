const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const clubRoutes = require("./clubRoutes");
const eventRoutes = require("./eventRoutes");
const adminRoutes = require("./adminRoutes");

router.use("/users", userRoutes);
router.use("/clubs", clubRoutes);
router.use("/events", eventRoutes);
router.use("/admins", adminRoutes);

module.exports = router;
