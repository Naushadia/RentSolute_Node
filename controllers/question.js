const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const db = require("../models");
const Question = db.question;
const option = db.option;

exports.addQuestion = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const question = await Question.create({
    title: req.body.title,
    type: req.body.type,
    has_other: req.body.has_other,
    UserId: req.user.id,
  });

  const question_options = req.body.options.map((obj) => ({
    ...obj,
    questionId: question.id,
  }));

  const options = await option.bulkCreate(question_options);

  const getQuestion = await Question.findOne({
    where: { id: question.id },
    include: [
      {
        model: option,
        as: "Options",
      },
    ],
  });

  return res.json({
    statusCode: 200,
    message: "question added successfully",
    data: getQuestion,
  });
};

exports.getQuestions = async (req, res, next) => {
  const questions = await Question.findAll({
    where: { UserId: req.user.id },
    include: [
      {
        model: option,
        as: "Options",
      },
    ],
  });

  return res.json({
    statusCode: 200,
    message: "Question list found successfully",
    suggested_list: questions,
  });
};

exports.deleteQuestion = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const { questionid } = await req.body;
    const UserId = await req.user.id;

    const quesdel = await Question.destroy({
      where: { id: questionid, UserId: UserId },
    });

    return res.json({
      statusCode: 200,
      message: "Question deleted successfully",
    });
  } catch (err) {
    console.log(err);
  }
};
