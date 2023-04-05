const router = require("express").Router();
const amenityController = require("../controllers/amenity");
const { body } = require("express-validator");
const upload = require("../utils/multer");
const requireUser = require("../middleware/requireUser");

router.post(
  "/new_amenities",
  upload.single("icon"),
  body("icon")
    .custom((Value, { req }) => {
      if (
        req.file.mimetype === "image/png" ||
        req.file.mimetype === "image/jpg" ||
        req.file.mimetype === "image/jpeg"
      ) {
        return ".png" || ".jpg" || ".jpeg";
      } else {
        return false;
      }
    })
    .withMessage("Please only submit jpg/jpeg/png image."),
  body("name").isString(),
  requireUser,
  amenityController.addAmenity
);

router.get("/get_amenities", requireUser, amenityController.getAmenities);

router.delete("/deleteamenity", requireUser, amenityController.deleteAmenities);

module.exports = router;
