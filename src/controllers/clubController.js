const { Club, Owner, User } = require("../models/main");
const AppError = require("../utils/AppError");

const createClub = async (req, res, next) => {
  try {
    const { name, online, link, owner_id } = req.body;

    if (!name || !owner_id) {
      throw new AppError(
        "Please provide a club name and an initial owner_id.",
        400,
      );
    }

    // verify the designated owner actually exists
    const designatedOwner = await User.findByPk(owner_id);
    if (!designatedOwner || designatedOwner.is_deleted) {
      throw new AppError(
        "The designated owner does not exist or is deleted.",
        404,
      );
    }

    const newClub = await Club.create({
      name,
      online: online || false,
      link: link || null,
    });

    // link the designated user as the Owner
    await Owner.create({
      user_id: owner_id,
      club_id: newClub.id,
    });

    res.status(201).json({ status: "success", data: newClub });
  } catch (error) {
    next(error);
  }
};

const getAllClubs = async (req, res, next) => {
  try {
    const clubs = await Club.findAll({ where: { status: "active" } });
    res.status(200).json({ status: "success", data: clubs });
  } catch (error) {
    next(error);
  }
};

const getClub = async (req, res, next) => {
  try {
    const club = await Club.findByPk(req.params.id, {
      include: [{ model: User, as: "Owners", attributes: ["id", "username"] }],
    });

    if (!club || club.status !== "active")
      throw new AppError("Club not found.", 404);
    res.status(200).json({ status: "success", data: club });
  } catch (error) {
    next(error);
  }
};

const updateClub = async (req, res, next) => {
  try {
    const { name, online, link, status } = req.body;
    const club = await Club.findByPk(req.params.id);

    if (!club) throw new AppError("Club not found.", 404);

    club.name = name || club.name;
    club.online = online !== undefined ? online : club.online;
    club.link = link !== undefined ? link : club.link;
    if (status) club.status = status;

    await club.save();
    res.status(200).json({ status: "success", data: club });
  } catch (error) {
    next(error);
  }
};

const deleteClub = async (req, res, next) => {
  try {
    const club = await Club.findByPk(req.params.id);

    if (!club) throw new AppError("Club not found.", 404);

    // try the Hard Delete
    await club.destroy();

    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    // if SQL Server blocked it due to historical data => Soft Delete
    if (error.name === "SequelizeForeignKeyConstraintError") {
      try {
        const clubToSoftDelete = await Club.findByPk(req.params.id);

        // flip the status to inactive
        clubToSoftDelete.status = "inactive";
        await clubToSoftDelete.save();

        return res.status(200).json({
          status: "success",
          message:
            "Club has historical events. It has been deactivated instead of deleted.",
        });
      } catch (softDeleteError) {
        return next(softDeleteError);
      }
    }

    // if it was any other error, pass it to the global handler
    next(error);
  }
};

// add an Owner (can be done by existing Owner or Admin)
const addOwner = async (req, res, next) => {
  try {
    const clubId = req.params.id; // /clubs/:id/owners
    const { targetUserId } = req.body;

    if (!targetUserId)
      throw new AppError("Please provide the targetUserId.", 400);

    const targetUser = await User.findByPk(targetUserId);
    if (!targetUser) throw new AppError("User not found.", 404);

    const existingOwner = await Owner.findOne({
      where: { user_id: targetUserId, club_id: clubId },
    });

    if (existingOwner)
      throw new AppError("User is already an owner of this club.", 400);

    await Owner.create({ user_id: targetUserId, club_id: clubId });

    res
      .status(201)
      .json({ status: "success", message: "Owner added successfully." });
  } catch (error) {
    next(error);
  }
};

// remove an Owner (restricted to Admins)
const removeOwner = async (req, res, next) => {
  try {
    const clubId = req.params.id;
    const ownerIdToRemove = req.params.ownerId;

    // don't accidentally leave a club completely orphaned
    const ownerCount = await Owner.count({ where: { club_id: clubId } });
    if (ownerCount <= 1) {
      throw new AppError(
        "Cannot remove the last owner. Assign a new owner first or delete the club.",
        400,
      );
    }

    const deletedCount = await Owner.destroy({
      where: { user_id: ownerIdToRemove, club_id: clubId },
    });

    if (deletedCount === 0)
      throw new AppError("This user is not an owner of this club.", 404);

    res
      .status(200)
      .json({ status: "success", message: "Owner removed successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createClub,
  getAllClubs,
  getClub,
  updateClub,
  deleteClub,
  addOwner,
  removeOwner,
};
