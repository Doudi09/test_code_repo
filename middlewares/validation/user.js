const UserModel = require("../../models/user");

const { check } = require("express-validator");

const validateRole = [
  check("role")
    .not()
    .isEmpty()
    .isString()
    .isIn(["admin", "manager", "client"])
    .withMessage("Role is required !"),
];

const validateCreate = [
  check("email")
    .trim()
    .not()
    .isEmpty()
    .isEmail()
    .withMessage("Email is required !")
    .custom(async (value) => {
      if (await UserModel.emailExists(value))
        throw new Error("Email already exists !");
      return true;
    }),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is required !"),
  check("role")
    .not()
    .isEmpty()
    .isString()
    .isIn(["admin", "manager", "client"])
    .withMessage("Role is required !"),
];

exports.validateCreate = validateCreate;
exports.validateRole = validateRole;
