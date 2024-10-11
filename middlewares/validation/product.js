const { check } = require("express-validator");

const CategoryModel = require("../../models/category");
const ProductModel = require("../../models/product");

const validateCreate = [
  check("name")
    .trim()
    .not()
    .isEmpty()
    .isString()
    .withMessage("Name is required !"),

  check("price")
    .not()
    .isEmpty()
    .withMessage("Price is required !")
    .isFloat({ min: 0 })
    .withMessage("Price must be a number >= 0 !"),

  check("stock_quantity")
    .not()
    .isEmpty()
    .withMessage("Stock quantity is required !")
    .isInt({ min: 0 })
    .withMessage("Stock quantity must be a number >= 0 !"),

  check("category_id")
    .not()
    .isEmpty()
    .isMongoId()
    .withMessage("Invalid Id !")
    .custom((value) => {
      return CategoryModel.isValidId(value);
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
      return ProductModel.isValidId(value);
    })
    .withMessage("Product Not Found !"),
];

const validateFilter = [
  check("page").isNumeric().optional({ nullable: true }),
  check("itemsPerPage").isNumeric().optional({ nullable: true }),
  check("category")
    .isMongoId()
    .custom((value) => {
      return value && CategoryModel.isValidId(value);
    })
    .withMessage("Please select a valid category !")
    .optional({ nullable: true }),

  check("priceRangeMin", "priceRangeMax")
    .isFloat({ min: 0 })
    .custom((value, { req }) => {
      if (
        req.query.priceRangeMax &&
        req.query.priceRangeMin &&
        parseFloat(req.query.priceRangeMax) <
          parseFloat(req.query.priceRangeMin)
      ) {
        throw new Error("priceRangeMax must be greater than priceRangeMin");
      }
      return true;
    })
    .optional({ nullable: true }),
];

const validateUpdate = [...validateCreate, ...validateId];

exports.validateCreate = validateCreate;
exports.validateUpdate = validateUpdate;
exports.validateFilter = validateFilter;
exports.validateId = validateId;
