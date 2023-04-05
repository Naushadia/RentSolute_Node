const router = require("express").Router();
const questionController = require("../controllers/question");
const { body } = require("express-validator");
const requireUser = require("../middleware/requireUser");

router.post(
  "/new_question",
  body("title").isString(),
  body("type").isInt(),
  body("options.*.text").isString(),
  body("options.*.preferred").isInt({ min: 0, max: 1 }),
  requireUser,
  questionController.addQuestion
);

router.get("/get_questions", requireUser, questionController.getQuestions);

router.delete(
  "/delete_questions",
  requireUser,
  questionController.deleteQuestion
);

module.exports = router;
