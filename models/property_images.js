"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class property_images extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  property_images.init(
    {},
    {
      sequelize,
      modelName: "property_images",
    }
  );
  return property_images;
};
