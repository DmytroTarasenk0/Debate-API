const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const { authenticate, restrictTo } = require("../middlewares/authMiddleware");

router.use(authenticate); // require login for everything

// get all events for a specific club
router.get("/club/:clubId", eventController.getClubEvents);

// restricted
router.post("/", restrictTo("owner"), eventController.createEvent);
router.put("/:id", restrictTo("owner"), eventController.updateEvent);
router.delete("/:id", restrictTo("owner"), eventController.deleteEvent);

module.exports = router;
