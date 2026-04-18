const { User, Admin, Owner, Room, Event } = require("../models/main");
const AppError = require("../utils/AppError");

// base Authenticator
const authenticate = async (req, res, next) => {
  try {
    const userId = req.header("x-user-id");
    if (!userId) throw new AppError("Please provide x-user-id header.", 401);

    const user = await User.findByPk(userId);
    if (!user || user.is_deleted) throw new AppError("User not found.", 401);

    req.user = user;

    // if user is an Admin, no need to check the other roles later
    const isAdmin = await Admin.findOne({ where: { user_id: userId } });
    req.user.isAdmin = !!isAdmin; // attaches true or false

    next();
  } catch (error) {
    next(error);
  }
};

// contextual Authorization
const restrictTo = (role) => {
  return async (req, res, next) => {
    try {
      // Admins bypass all specific role checks
      if (req.user.isAdmin) return next();

      const userId = req.user.id;

      if (role === "owner") {
        let targetClubId;

        // creating an event (club_id is in the body)
        if (req.body.club_id) {
          targetClubId = req.body.club_id;
        }
        // direct club routes (PUT /api/clubs/id)
        else if (req.baseUrl.includes("/clubs") && req.params.id) {
          targetClubId = req.params.id;
        }
        // event modification routes (DELETE /api/events/id)
        else if (req.baseUrl.includes("/events") && req.params.id) {
          // look up the event to find out which club it belongs to
          const event = await Event.findByPk(req.params.id);
          if (!event) throw new AppError("Event not found.", 404);
          targetClubId = event.club_id;
        }

        if (!targetClubId) {
          throw new AppError(
            "Could not determine which club to check permissions for.",
            400,
          );
        }

        // does this user actually own the targeted club
        const isOwner = await Owner.findOne({
          where: { user_id: userId, club_id: targetClubId },
        });

        if (!isOwner) throw new AppError("You do not own this club.", 403);
        return next();
      }

      if (role === "judge") {
        const resourceId = req.params.id; // room_id
        const room = await Room.findOne({
          where: { id: resourceId, judge: userId },
        });

        if (!room)
          throw new AppError("You are not the judge for this room.", 403);
        return next();
      }

      throw new AppError("Unauthorized role.", 403);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authenticate, restrictTo };
