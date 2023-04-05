"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class room extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  room.init(
    {
      name: DataTypes.STRING,
      url: DataTypes.STRING,
      caption: DataTypes.STRING,
      room_type: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "room",
    }
  );
  return room;
};
