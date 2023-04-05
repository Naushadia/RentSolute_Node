const { validationResult, Result } = require("express-validator");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responseWrapper");
const db = require("../models");
const { where, InvalidConnectionError, Model } = require("sequelize");
const image = require("../models/image");
const Property = db.properties;
const Image = db.image;
const PropertyImage = db.property_images;
const Room = db.room;
const PropertyAmenity = db.propertyamenity;
const PropertyQuestion = db.propertyquestion;
const amenity = db.amenities;
const question = db.question;

const randomLng = Math.random() * 360 - 180;
const randomLat = Math.random() * 360 - 180;

exports.addProperty = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const {
      name,
      property_type,
      description,
      tenancy_status,
      street,
      city,
      state,
      postal_code,
      country,
      latitude,
      longitude,
      furnishing_status,
      furnishing_details,
      images,
      share_property_url,
      amenities,
      area,
      rooms,
      questions,
    } = await req.body;

    const UserId = await req.user.id;

    const property = await Property.create({
      name,
      property_type,
      description,
      tenancy_status,
      street,
      city,
      state,
      postal_code,
      country,
      latitude,
      longitude,
      furnishing_status,
      furnishing_details,
      area,
      share_property_url,
      UserId,
    });

    let img = [];
    try {
      req.body.images.forEach((image) => {
        let obj = {
          imageId: image.image,
          propertyId: property.id,
        };
        img.push(obj);
      });

      await PropertyImage.bulkCreate(img);
    } catch (e) {
      console.error(e);
      return res.send(error(401, "image not found"));
    }

    let amnity = [];
    try {
      req.body.amenities.forEach((amenity) => {
        let obj = {
          amenityId: amenity.amenity,
          propertyId: property.id,
        };
        amnity.push(obj);
      });

      await PropertyAmenity.bulkCreate(amnity);
    } catch (e) {
      console.error(e);
      return res.send(error(401, "amenity not found"));
    }

    let ques = [];
    try {
      req.body.questions.forEach((question) => {
        let obj = {
          questionId: question.questionId,
          propertyId: property.id,
          optionId: question.option_id,
          preferred: question.preferred,
        };
        ques.push(obj);
      });

      await PropertyQuestion.bulkCreate(ques);
    } catch (e) {
      console.error(e);
      return res.send(error(401, "question not found"));
    }

    let rms = [];
    try {
      req.body.rooms.forEach((room) => {
        let obj = {
          propertyId: property.id,
          name: room.name,
          imageId: room.image,
          room_type: room.type,
          caption: room.caption,
          url: room.url,
        };
        rms.push(obj);
      });

      await Room.bulkCreate(rms);
    } catch (error) {
      console.error(error);
    }

    const data = await Property.findOne({
      where: { UserId: UserId, id: property.id },
      include: [
        {
          model: amenity,
        },
        {
          model: Image,
        },
        { model: question },
        { model: db.user },
        { model: amenity },
        { model: Room },
      ],
    });

    return res.status(200).json({
      msg: "Property created sucessfully",
      data: data,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.saveImage = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const image = await Image.create({
    caption: req.body.caption,
    image: "/uploads/" + req.file.filename,
    filename: req.file.filename,
    user_id: req.user.id,
  });

  return res.json({
    message: "image saved sucessfully",
    image_id: image.id,
    image_url: image.image,
    image_caption: image.caption,
  });
};

exports.getImage = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { image_id } = await req.body;
    const UserId = await req.user.id;

    const image = await Image.findOne({
      where: { user_id: UserId, id: image_id },
    });
    return res.json({
      message: "image found sucessfully",
      data: image,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.deleteProperty = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { propertyid } = await req.body;
    const UserId = await req.user.id;

    const propdel = await Property.destroy({
      where: { id: propertyid, UserId: UserId },
    });

    return res.send(success(200, "we have successfully deleted your property"));
  } catch (err) {
    console.log(err);
  }
};

exports.imageController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { image_id } = req.body;
    const UserId = req.user.id;

    if (!UserId || !image_id) {
      return res.send(error(400, " All fields are required"));
    }
    const image = await Image.destroy({
      where: { id: image_id, user_id: UserId },
    });
    return res.status(200).json({
      msg: "Image Deleted sucessfully",
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getProperty = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { property_id } = req.body;
  const UserId = req.user.id;
  try {
    const property = await Property.findOne({
      where: { UserId: UserId, id: property_id },
      include: [
        {
          model: amenity,
        },
        {
          model: Image,
        },
        { model: question },
        { model: db.user },
      ],
    });
    return res.status(200).json({
      msg: "Property found sucessfully",
      data: property,
    });
  } catch (error) {
    console.log(error);
  }
};

exports.putProperty = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const {
      propertyId,
      name,
      property_type,
      description,
      tenancy_status,
      street,
      city,
      state,
      postal_code,
      country,
      latitude,
      longitude,
      furnishing_status,
      furnishing_details,
      images,
      share_property_url,
      amenities,
      area,
      rooms,
      questions,
    } = await req.body;

    const UserId = await req.user.id;

    const properties = await Property.update(
      {
        name: name,
        property_type: property_type,
        description: description,
        tenancy_status: tenancy_status,
        street: street,
        city: city,
        state: state,
        postal_code: postal_code,
        country: country,
        latitude: latitude,
        longitude: longitude,
        furnishing_status: furnishing_status,
        furnishing_details: furnishing_details,
        share_property_url: share_property_url,
        area: area,
      },
      {
        where: {
          id: propertyId,
          UserId: UserId,
        },
        returning: true,
      }
    );

    const property = await Property.findOne({
      where: { id: propertyId, UserId: UserId },
    });
    return res.status(200).json({
      msg: "Property updated sucessfully",
      data: property,
    });
  } catch (err) {
    console.log(err);
  }
};

exports.findNearestProperty = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const {lat,lng,distance} = req.body;

    const properties = await Property.findAll({
      where: db.Sequelize.where(
        db.Sequelize.literal(
          `(6371 * acos(cos(radians(${lat})) * cos(radians(latitude)) * cos(radians(longitude) - radians(${lng})) + sin(radians(${lat})) * sin(radians(latitude))))`
        ),
        "<=",
        distance
      ),
    });  // 6371 appx radius of earth in km and 3959 in miles
    return res.status(200).json({ property: properties });
  } catch (e) {
    console.error(e);
    return res.send(error(400, "something went wrong"));
  }
};
