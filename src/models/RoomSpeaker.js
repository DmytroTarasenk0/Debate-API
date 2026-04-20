const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const RoomSpeaker = sequelize.define(
    "RoomSpeaker",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      room_team_id: { type: DataTypes.INTEGER, allowNull: false },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      score: { type: DataTypes.SMALLINT, allowNull: true },
    },
    { tableName: "room_speakers" },
  );

  RoomSpeaker.associate = (models) => {
    RoomSpeaker.belongsTo(models.RoomTeam, { foreignKey: "room_team_id" });
    RoomSpeaker.belongsTo(models.User, { foreignKey: "user_id" });
  };

  return RoomSpeaker;
};
