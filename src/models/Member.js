const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Member",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      user_id: { type: DataTypes.INTEGER, allowNull: false },
      club_id: { type: DataTypes.INTEGER, allowNull: false },
      banned_status: { type: DataTypes.BOOLEAN, defaultValue: false },
    },
    { tableName: "members" },
  );
};
