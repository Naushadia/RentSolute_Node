"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class properties extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  properties.init(
    {
      name: DataTypes.STRING,
      property_type: DataTypes.INTEGER,
      description: DataTypes.STRING,
      tenancy_status: DataTypes.INTEGER,
      street: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      postal_code: DataTypes.INTEGER,
      country: DataTypes.STRING,
      latitude: DataTypes.DECIMAL(8,6),
      longitude: DataTypes.DECIMAL(9,6),
      furnishing_status: DataTypes.INTEGER,
      furnishing_details: DataTypes.STRING,
      share_property_url: DataTypes.STRING,
      area: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "properties",
    }
  );
  return properties;
};
