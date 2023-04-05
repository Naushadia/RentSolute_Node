const PDFKit = require("pdfkit");

const fs = require("fs");

const path = require("path");

const pdfDoc = new PDFKit();

var db = require("../models");

const User = db.user;
const Property = db.properties;
const Question = db.question;
const Amenity = db.amenities;
const { error, success } = require("../utils/responseWrapper");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { validationResult, Result } = require("express-validator");
const { Sequelize, Op } = require("sequelize");

const signupController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { first_name, last_name, email, password, account_type } = req.body;

    if (!email || !password || !first_name || !last_name || !account_type) {
      return res.send(error(400, "All fields are required"));
    }

    const oldUser = await User.findOne({ where: { email } });
    if (oldUser) {
      return res.send(error(409, "User is already registered"));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email,
      account_type,
      password: hashedPassword,
    });

    const accessToken = generateAccessToken({ user });

    const refreshToken = generateRefreshToken({ user });

    const pdfName = await "api_response" + user.id + ".pdf";

    const pdfPath = path.join(__dirname, "../", "uploads", pdfName);
    pdfDoc.pipe(fs.createWriteStream(pdfPath));
    pdfDoc.text("API Response", { align: "center" });
    pdfDoc.moveDown();
    pdfDoc.text(`first_name: ${user.first_name}`);
    pdfDoc.text(`last_name: ${user.last_name}`);
    pdfDoc.text(`email: ${user.email}`);
    pdfDoc.text(`account_type: ${user.account_type}`);
    pdfDoc.end();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return res.send(
      success(201, {
        user,
        accessToken,
      })
    );
  } catch (error) {
    console.log(error);
  }
};

const loginController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.send(error(400, "All fields are required"));
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.send(error(404, "User is not registered"));
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      return res.send(error(403, "Incorrect password"));
    }

    const accessToken = generateAccessToken({ user });

    const refreshToken = generateRefreshToken({ user });

    const pdfName = "api_response" + user.id + ".pdf";

    const pdfPath = path.join(__dirname, "../", "uploads", pdfName);
    pdfDoc.pipe(fs.createWriteStream(pdfPath));
    pdfDoc.text("API Response", { align: "center" });
    pdfDoc.moveDown();
    pdfDoc.text(`email: ${email}`);
    pdfDoc.end();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
    });

    return res.send(
      success(200, {
        accessToken,
      })
    );
  } catch (error) {}
};

const forgetPasswordController = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { email } = req.body;

    if (!email) {
      return res.send(error(400, "E-mail is required"));
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.send(error(404, "User is not registered"));
    } else {
      const token = jwt.sign({ user }, process.env.SECRET_CODE, {
        expiresIn: "24h",
      });
      const mailer = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        auth: {
          user: "eugene.mckenzie49@ethereal.email",
          pass: "KJxe5A6kgr314Nnrfu",
        },
      });
      await mailer.sendMail({
        from: "no-reply@rentsolute.in",
        to: user.email,
        subject: "hello",
        html: `<h3> Click this <a href="${req.protocol}://${req.headers.host}/reset/${token}">link</a> to change your password</h3>`,
      });

      return res.json({
        success: "",
        msg: "we have sent instructions to reset password",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

const resetPasswordController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  if (req.body.new_password == req.body.confirm_password) {
    try {
      var decoded = jwt.verify(req.body.token_link, process.env.SECRET_CODE);
      if (decoded) {
        const user = await User.findOne({ where: { id: decoded.user.id } });
        if (user) {
          const hashedPassword = await bcrypt.hash(req.body.new_password, 10);
          user.password = hashedPassword;
          user.save();
          return res.send(
            success(200, "we have sucessfully reset your password")
          );
        } else {
          return res.status(400).json({ errors: { error: "User not found" } });
        }
      }
    } catch (err) {
      return res
        .status(400)
        .json({ errors: { error: "Something went wrong!" } });
    }
  } else {
    return res
      .status(400)
      .json({ errors: { error: "Password should be match" } });
  }
};

const updatePasswordController = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { old_password, new_password } = req.body;

    const user = await User.findOne({ where: { email: req.user.email } });

    if (user) {
      const matched = await bcrypt.compare(old_password, user.password);
      if (!matched) {
        return res.send(error, (400, "old password must be matched"));
      }
    }

    if (user) {
      const hashedPassword = await bcrypt.hash(req.body.new_password, 10);
      user.password = hashedPassword;
      user.save();
      return res.send(success(200, "Password reset successfully"));
    }
  } catch (err) {
    console.log(err);
  }
};
const refreshAccessTokenController = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) {
    return res.send(error(401, "Refresh token in cookie is required"));
  }

  const refreshToken = cookies.jwt;

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );

    const user = decoded.user;
    const accessToken = generateAccessToken({ user });

    return res.send(success(201, { accessToken }));
  } catch (e) {
    console.log(e);
    return res.send(error(401, "invalid refresh token"));
  }
};

const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "1h",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "1y",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

const getNewpassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const token = req.params.token;
  const { new_password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.SECRET_CODE);
    if (decoded) {
      const user = await User.findOne({ where: { id: decoded.user.id } });
      if (user) {
        const hashedPassword = await bcrypt.hash(new_password, 10);
        user.password = hashedPassword;
        user.save();
      } else {
        return res.status(400).json({
          message: "invalid user",
        });
      }
      return res.status(200).json({
        message: "we have sucessfully reset your password",
      });
    } else {
      return res.status(400).json({
        message: "invalid token",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

function mapUserRowsAndCounts(user) {
  return user.rows.map((row, index) => {
    if (user.count[index]) {
      return {
        ...row,
        propertyCount: user.count[index].count,
      };
    } else {
      console.log("No count found for user:", row.id);
      return row;
    }
  });
}

const findUser = async (req, res, next) => {
  const limit = 3;

  const page = req.query.page || 1;

  const offset = (page - 1) * limit;
  const { search, block } = req.body;
  switch (true) {
    case !block && !search:
      let user, userData;
      user = await User.findAndCountAll({
        include: [
          {
            model: Property,
          },
        ],
        group: ["user.id"],
        raw: true,
        limit: limit,
        offset: offset,
      });

      userData = mapUserRowsAndCounts(user);

      return res.status(200).json({
        data: userData,
      });
    case block && !search:
      let user1, userData1;
      user1 = await User.findAndCountAll({
        where: { account_type: block },
        include: [
          {
            model: Property,
          },
        ],
        group: ["user.id"],
        raw: true,
        limit: limit,
        offset: offset,
      });
      userData1 = mapUserRowsAndCounts(user1);

      return res.status(200).json({
        data: userData1,
      });
    case search && !block:
      let user2, userData2;
      user2 = await User.findAndCountAll({
        where: {
          [Op.or]: [
            { first_name: { [Sequelize.Op.like]: "%" + search + "%" } },
            { last_name: { [Sequelize.Op.like]: `%${search}%` } },
            { email: { [Sequelize.Op.like]: `%${search}%` } },
          ],
        },
        include: [
          {
            model: Property,
          },
        ],
        group: ["user.id"],
        raw: true,
        limit: limit,
        offset: offset,
      });
      userData2 = mapUserRowsAndCounts(user2);

      return res.status(200).json({
        data: userData2,
      });
    default:
      let user3, userData3;
      user3 = await User.findAndCountAll({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                { first_name: { [Sequelize.Op.like]: "%" + search + "%" } },
                { last_name: { [Sequelize.Op.like]: `%${search}%` } },
                { email: { [Sequelize.Op.like]: `%${search}%` } },
              ],
            },
            { account_type: block },
          ],
        },
        include: [
          {
            model: Property,
          },
        ],
        group: ["user.id"],
        raw: true,
        limit: limit,
        offset: offset,
      });

      userData3 = mapUserRowsAndCounts(user3);

      return res.status(200).json({
        data: userData3,
      });
  }
};

module.exports = {
  signupController,
  loginController,
  refreshAccessTokenController,
  forgetPasswordController,
  resetPasswordController,
  updatePasswordController,
  getNewpassword,
  findUser,
};
