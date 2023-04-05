const router = require("express").Router();
const propertyController = require("../controllers/property");
const { body } = require("express-validator");
const requireUser = require("../middleware/requireUser");
const upload = require("../utils/multer");

router.post(
  "/new_property",
  body("name").isString(),
  body("property_type").isInt(),
  body("description").isString(),
  body("tenancy_status").isString(),
  body("street").isString(),
  body("city").isString(),
  body("state").isString(),
  body("postal_code").isInt(),
  body("country").isString(),
  body("latitude").isDecimal(),
  body("longitude").isDecimal(),
  body("furnishing_status").isInt(),
  body("furnishing_details").isString(),
  body("area").isString(),
  body("share_property_url").isURL(),
  requireUser,
  propertyController.addProperty
);

router.put(
  "/put_property",
  body("name").isString(),
  body("propertyId").isInt(),
  body("property_type").isInt(),
  body("description").isString(),
  body("tenancy_status").isString(),
  body("street").isString(),
  body("city").isString(),
  body("state").isString(),
  body("postal_code").isInt(),
  body("country").isString(),
  body("latitude").isDecimal(),
  body("longitude").isDecimal(),
  body("furnishing_status").isInt(),
  body("furnishing_details").isString(),
  body("area").isString(),
  body("share_property_url").isURL(),
  requireUser,
  propertyController.putProperty
);

router.delete(
  "/delete-property",
  body("propertyid").isInt(),
  requireUser,
  propertyController.deleteProperty
);

router.post(
  "/image",
  upload.single("image"),
  body("caption").isString(),
  body("image")
    .custom((value, { req }) => {
      if (req.file.mimetype.startsWith("image/")) {
        return true;
      } else {
        return false;
      }
    })
    .withMessage("please only submit image."),
  requireUser,
  propertyController.saveImage
);

router.get("/get_image", requireUser, propertyController.getImage);

router.delete("/delete_image", requireUser, propertyController.imageController);

router.post('/findproperty',propertyController.findNearestProperty);
router.get("/get_property", requireUser, propertyController.getProperty);
module.exports = router;
