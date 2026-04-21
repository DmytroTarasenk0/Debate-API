const express = require("express");
const router = express.Router();
const eventController = require("../controllers/eventController");
const waitlistController = require("../controllers/waitlistController");
const teamController = require("../controllers/teamController");
const roomController = require("../controllers/roomController");
const scoreController = require("../controllers/scoreController");
const { authenticate, restrictTo } = require("../middleware/authMiddleware");

router.use(authenticate); // require login for everything

// get all events for a specific club
router.get("/club/:clubId", eventController.getClubEvents);

// restricted
router.post("/", restrictTo("owner"), eventController.createEvent);
router.put("/:id", restrictTo("owner"), eventController.updateEvent);
router.delete("/:id", restrictTo("owner"), eventController.deleteEvent);

// Waitlist routes (direct event-link, so I don't care)
// any authenticated user can join or leave
router.post("/:eventId/waitlist/join", waitlistController.joinWaitlist);
router.delete("/:eventId/waitlist/leave", waitlistController.leaveWaitlist);

// only the owner of the club running the event can view the waitlist
router.get(
  "/:eventId/waitlist",
  restrictTo("owner"),
  waitlistController.getEventWaitlist,
);

// same for Team
// users register themselves and a friend
router.post("/:eventId/teams/register", teamController.registerTeam);
// and everyone can see the teams
router.get("/:eventId/teams", teamController.getEventTeams);

router.post("/:eventId/teams", restrictTo("owner"), teamController.createTeam);
router.put("/teams/:teamId", restrictTo("owner"), teamController.updateTeam);
router.delete("/teams/:teamId", restrictTo("owner"), teamController.deleteTeam);

// and Rooms
router.get("/:eventId/rooms", roomController.getEventRooms);

router.post("/:eventId/rooms", restrictTo("owner"), roomController.createRoom);
router.delete("/rooms/:roomId", restrictTo("owner"), roomController.deleteRoom);

// only the assigned Judge (or Owner) can submit score
router.put(
  "/rooms/:roomId/scores",
  restrictTo("judge"),
  scoreController.submitScores,
);

module.exports = router;
