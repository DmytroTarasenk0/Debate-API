const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Event = sequelize.define(
    "Event",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      club_id: { type: DataTypes.INTEGER, allowNull: false },
      date: { type: DataTypes.DATE, allowNull: false },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: "scheduled",
        validate: { isIn: [["scheduled", "archived", "canceled"]] },
      },
    },
    { tableName: "events" },
  );

  Event.associate = (models) => {
    Event.belongsTo(models.Club, { foreignKey: "club_id" });
    // event deletion (not archive/cancel status) - wipe the data
    Event.belongsToMany(models.User, {
      through: models.Waitlist,
      as: "WaitlistedUsers",
      foreignKey: "event_id",
      otherKey: "user_id",
      onDelete: "CASCADE",
    });
    Event.hasMany(models.Room, { foreignKey: "event_id", onDelete: "CASCADE" });
    Event.hasMany(models.Team, { foreignKey: "event_id", onDelete: "CASCADE" });
  };

  return Event;
};
