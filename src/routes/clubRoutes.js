const express = require("express");
const router = express.Router();
const clubController = require("../controllers/clubController");
const { authenticate, restrictTo } = require("../middleware/authMiddleware");

router.use(authenticate); // require login for everything

router.get("/", clubController.getAllClubs);
router.get("/:id", clubController.getClub);

// restricted
router.post("/", restrictTo("admin"), clubController.createClub);
router.put("/:id", restrictTo("owner"), clubController.updateClub);
router.delete("/:id", restrictTo("owner"), clubController.deleteClub);

router.post("/:id/owners", restrictTo("owner"), clubController.addOwner);
router.delete(
  "/:id/owners/:ownerId",
  restrictTo("admin"),
  clubController.removeOwner,
);

module.exports = router;
