const { User, Admin, Owner, Room, Event, Team } = require("../models/main");
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
        if (req.body?.club_id) {
          targetClubId = req.body.club_id;
        }
        // direct Club routes
        else if (req.baseUrl.includes("/clubs") && req.params.id) {
          targetClubId = req.params.id;
        }
        // Event routes (/:eventId and /events/:id)
        else if (
          req.params.eventId ||
          (req.baseUrl.includes("/events") && req.params.id)
        ) {
          const eventIdToCheck = req.params.eventId || req.params.id;
          const event = await Event.findByPk(eventIdToCheck);
          if (!event) throw new AppError("Event not found.", 404);
          targetClubId = event.club_id;
        }
        // Team routes (/teams/:teamId)
        else if (req.params.teamId) {
          const team = await Team.findByPk(req.params.teamId);
          if (!team) throw new AppError("Team not found.", 404);

          const eventId = team.event_id || team.eventId;
          const event = await Event.findByPk(eventId);

          if (!event) throw new AppError("Event for this team not found.", 404);

          targetClubId = event.club_id || event.clubId;
        }
        // Room routes (/rooms/:roomId)
        else if (req.params.roomId) {
          const room = await Room.findByPk(req.params.roomId);
          if (!room) throw new AppError("Room not found.", 404);

          const eventId = room.event_id || room.eventId;
          const event = await Event.findByPk(eventId);

          if (!event) throw new AppError("Event for this room not found.", 404);

          targetClubId = event.club_id || event.clubId;
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
        const resourceId = req.params.roomId || req.params.id;
        const room = await Room.findByPk(resourceId);

        if (!room) throw new AppError("Room not found.", 404);

        // check if the user is the assigned Judge
        if (room.judge === userId) {
          return next();
        }

        // if the user isn't the Judge, check if for Club Owner
        const event = await Event.findByPk(room.event_id);
        if (!event) throw new AppError("Event for this room not found.", 404);

        const isOwner = await Owner.findOne({
          where: { user_id: userId, club_id: event.club_id },
        });

        if (isOwner) {
          return next();
        }

        // if neither => block
        throw new AppError(
          "You must be the assigned judge or the club owner to perform this action.",
          403,
        );
        return next();
      }

      throw new AppError("Unauthorized role.", 403);
    } catch (error) {
      next(error);
    }
  };
};

module.exports = { authenticate, restrictTo };
