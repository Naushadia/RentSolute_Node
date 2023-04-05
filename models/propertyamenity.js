"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class propertyamenity extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  propertyamenity.init(
    {},
    {
      sequelize,
      modelName: "propertyamenity",
    }
  );
  return propertyamenity;
};
