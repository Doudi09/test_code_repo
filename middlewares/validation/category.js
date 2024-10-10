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

const validateUpdate = [...validateCreate, ...validateId];

exports.validateCreate = validateCreate;
exports.validateUpdate = validateUpdate;
exports.validateId = validateId;
