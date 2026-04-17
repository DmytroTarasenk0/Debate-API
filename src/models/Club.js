const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Club = sequelize.define(
    "Club",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(120), allowNull: false },
      status: {
        type: DataTypes.STRING(20),
        defaultValue: "active",
        validate: { isIn: [["active", "inactive"]] },
      },
      online: { type: DataTypes.BOOLEAN, defaultValue: false },
      link: { type: DataTypes.STRING(255), allowNull: true },
      created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    { tableName: "clubs" },
  );

  Club.associate = (models) => {
    Club.belongsToMany(models.User, {
      through: models.Owner,
      as: "Owners",
      foreignKey: "club_id",
      otherKey: "user_id",
    });
    Club.belongsToMany(models.User, {
      through: models.Member,
      as: "Members",
      foreignKey: "club_id",
      otherKey: "user_id",
    });
    Club.hasMany(models.Event, {
      foreignKey: "club_id",
      onDelete: "NO ACTION",
    }); // don't delete club events
  };

  return Club;
};
