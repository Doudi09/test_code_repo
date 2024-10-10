const router = require("express").Router();

const {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getProduct,
} = require("../controllers/product");

const {
  validateCreate,
  validateUpdate,
  validateId,
  validateFilter,
} = require("../middlewares/validation/product");

const { validator } = require("../middlewares/validator");

const { checkRoleAccess } = require("../middlewares/auth");

router.post(
  "/",

  checkRoleAccess("admin", "manager"),

  validateCreate,
  validator,
  createProduct
);
router.get(
  "/",
  checkRoleAccess("admin", "manager", "client"),

  validateFilter,
  validator,
  getAllProducts
);
router.get(
  "/:id",
  checkRoleAccess("admin", "manager", "client"),

  validateId,
  validator,
  getProduct
);
router.delete(
  "/:id",
  checkRoleAccess("admin"),

  validateId,
  validator,
  deleteProduct
);
router.put(
  "/:id",
  checkRoleAccess("admin", "manager"),

  validateUpdate,
  validator,
  updateProduct
);

module.exports = router;
