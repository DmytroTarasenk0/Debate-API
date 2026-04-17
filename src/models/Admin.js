const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  return sequelize.define(
    "Admin",
    {
      user_id: { type: DataTypes.INTEGER, primaryKey: true },
      granted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { tableName: "admins" },
  );
};
