const { Event, Club } = require("../models/main");
const AppError = require("../utils/AppError");

const createEvent = async (req, res, next) => {
  try {
    const { club_id, date } = req.body;

    if (!club_id || !date) {
      throw new AppError("Please provide both club_id and date.", 400);
    }

    const newEvent = await Event.create({
      club_id,
      date,
      status: "scheduled",
    });

    res.status(201).json({ status: "success", data: newEvent });
  } catch (error) {
    next(error);
  }
};

// get all events for a specific club
const getClubEvents = async (req, res, next) => {
  try {
    const events = await Event.findAll({
      where: { club_id: req.params.clubId },
    });

    res.status(200).json({ status: "success", data: events });
  } catch (error) {
    next(error);
  }
};

const updateEvent = async (req, res, next) => {
  try {
    const { date, status } = req.body;
    const event = await Event.findByPk(req.params.id);

    if (!event) throw new AppError("Event not found.", 404);

    event.date = date || event.date;
    event.status = status || event.status; // scheduled, archived, or canceled

    await event.save();
    res.status(200).json({ status: "success", data: event });
  } catch (error) {
    next(error);
  }
};

const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByPk(req.params.id);
    if (!event) throw new AppError("Event not found.", 404);

    // only Hard Delete, I don't care
    await event.destroy();

    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEvent, getClubEvents, updateEvent, deleteEvent };
