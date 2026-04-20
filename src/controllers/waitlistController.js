const { Event, User, Waitlist } = require("../models/main");
const AppError = require("../utils/AppError");

// any authenticated user can join a scheduled event
const joinWaitlist = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    const event = await Event.findByPk(eventId);
    if (!event || event.status !== "scheduled") {
      throw new AppError("This event is not available for registration.", 400);
    }

    // prevent duplicate registrations
    const existingEntry = await Waitlist.findOne({
      where: { event_id: eventId, user_id: userId },
    });

    if (existingEntry) {
      throw new AppError(
        "You are already on the waitlist for this event.",
        409,
      );
    }

    await Waitlist.create({ event_id: eventId, user_id: userId });

    res.status(201).json({
      status: "success",
      message: "Successfully joined the waitlist.",
    });
  } catch (error) {
    next(error);
  }
};

const leaveWaitlist = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user.id;

    const deletedCount = await Waitlist.destroy({
      where: { event_id: eventId, user_id: userId },
    });

    if (deletedCount === 0) {
      throw new AppError("You are not on the waitlist for this event.", 404);
    }

    res
      .status(200)
      .json({ status: "success", message: "Removed from the waitlist." });
  } catch (error) {
    next(error);
  }
};

const getEventWaitlist = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;

    const event = await Event.findByPk(eventId, {
      include: [
        {
          model: User,
          as: "WaitlistedUsers",
          attributes: ["id", "username"],
          through: { attributes: [] },
        },
      ],
    });

    if (!event) throw new AppError("Event not found.", 404);

    res.status(200).json({
      status: "success",
      data: {
        event_id: event.id,
        registered_players: event.WaitlistedUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { joinWaitlist, leaveWaitlist, getEventWaitlist };
