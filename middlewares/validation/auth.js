const UserModel = require("../../models/user");

const { check } = require("express-validator");

const validateRegister = [
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

const validateLogin = [
  check("email")
    .trim()
    .not()
    .isEmpty()
    .isEmail()
    .withMessage("Email is required !"),
  check("password")
    .trim()
    .not()
    .isEmpty()
    .withMessage("Password is required !"),
];

exports.validateRegister = validateRegister;
exports.validateLogin = validateLogin;
