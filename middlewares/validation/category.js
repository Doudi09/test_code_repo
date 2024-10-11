const { check } = require("express-validator");

const CategoryModel = require("../../models/category");

const validateCreate = [
  check("name")
    .trim()
    .not()
    .isEmpty()
    .isString()
    .withMessage("Name is required !")
    .custom(async (value) => {
      const nameExists = await CategoryModel.nameExits(value);
      if (nameExists) throw new Error("Name already exists !");
      return true;
    })
    .withMessage("Please select a valid category !"),
];

const validateId = [
  check("id")
    .not()
    .isEmpty()
    .isMongoId()
    .withMessage("Invalid Id !")
    .custom((value) => {
      return CategoryModel.isValidId(value);
    })
    .withMessage("Category Not Found !"),
];

const validateUpdate = [
  // Custom validator to check that at least one of 'name' or 'description' is present
  check().custom((value, { req }) => {
    if (!req.body.name && !req.body.description) {
      throw new Error(
        "At least one field (name or description) must be provided for update"
      );
    }
    return true;
  }),
  check("name")
    .optional()
    .trim()
    .not()
    .isEmpty()
    .isString()
    .withMessage("Name is required !")
    .custom(async (value, { req }) => {
      const nameExists = await CategoryModel.nameExits(value);
      if (nameExists && nameExists._id.toString() !== req.params.id) {
        //the name has been changed and it already exists in the db
        throw new Error("Name already exists !");
      } else return true;
    }),
  ...validateId,
];

exports.validateCreate = validateCreate;
exports.validateUpdate = validateUpdate;
exports.validateId = validateId;
