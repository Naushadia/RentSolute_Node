"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class option extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  option.init(
    {
      text: DataTypes.STRING,
      preferred: {
        type: DataTypes.INTEGER,
        validate: { min: 0, max: 1 },
      },
    },
    {
      sequelize,
      modelName: "option",
    }
  );
  return option;
};
