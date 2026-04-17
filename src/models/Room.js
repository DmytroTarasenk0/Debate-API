const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Room = sequelize.define(
    "Room",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      event_id: { type: DataTypes.INTEGER, allowNull: false },
      judge: { type: DataTypes.INTEGER, allowNull: true },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: "scheduled",
        validate: { isIn: [["scheduled", "finished"]] },
      },
    },
    { tableName: "rooms" },
  );

  Room.associate = (models) => {
    Room.belongsTo(models.Event, { foreignKey: "event_id" });
    Room.belongsTo(models.User, { as: "JudgeData", foreignKey: "judge" });
    Room.hasMany(models.RoomTeam, {
      foreignKey: "room_id",
      onDelete: "CASCADE",
    });
  };

  return Room;
};
