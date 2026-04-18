const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");
const clubRoutes = require("./clubRoutes");
const eventRoutes = require("./eventRoutes");

router.use("/users", userRoutes);
router.use("/clubs", clubRoutes);
router.use("/events", eventRoutes);

module.exports = router;
