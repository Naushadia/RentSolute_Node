"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("properties", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
      },
      property_type: {
        type: Sequelize.INTEGER,
      },
      description: {
        type: Sequelize.STRING,
      },
      tenancy_status: {
        type: Sequelize.INTEGER,
      },
      street: {
        type: Sequelize.INTEGER,
      },
      city: {
        type: Sequelize.STRING,
      },
      state: {
        type: Sequelize.STRING,
      },
      postal_code: {
        type: Sequelize.INTEGER,
      },
      country: {
        type: Sequelize.STRING,
      },
      latitude: {
        type: Sequelize.DECIMAL(8,6),
      },
      longitude: {
        type: Sequelize.DECIMAL(9,6),
      },
      furnishing_status: {
        type: Sequelize.INTEGER,
      },
      furnishing_details: {
        type: Sequelize.STRING,
      },
      amenities: {
        type: Sequelize.JSON,
      },
      area: {
        type: Sequelize.STRING,
      },
      rooms: {
        type: Sequelize.JSON,
      },
      share_property_url: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("properties");
  },
};
