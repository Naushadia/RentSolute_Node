const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const db = require("../models");
const Amenity = db.amenities;

exports.addAmenity = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const amenity = await Amenity.create({
    icon: "/uploads/" + req.file.filename,
    name: req.body.name,
    UserId: req.user.id,
  });

  return res.json({
    statusCode: 200,
    message: "Amenity created successfully",
    data: amenity,
  });
};

exports.getAmenities = async (req, res, next) => {
  const UserId = req.user.id;
  const amenities = await Amenity.findAll({ where: { UserId: UserId } });

  return res.json({
    statusCode: 200,
    message: "Amenities found successfully",
    data: amenities,
  });
};

exports.deleteAmenities = async (req, res, next) => {
  const { amenity_id } = req.body;
  const amenities = await Amenity.destroy({ where: { id: amenity_id } });
  return res.json({
    statusCode: 200,
    message: "Amenities deleted sucessfully",
  });
};
