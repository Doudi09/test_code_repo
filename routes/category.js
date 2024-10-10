const router = require("express").Router();

const {
  createCategory,
  updateCategory,
  deleteCategory,
  getCategory,
  getAllCategories,
} = require("../controllers/category");

const {
  validateCreate,
  validateUpdate,
  validateId,
} = require("../middlewares/validation/category");

const { validator } = require("../middlewares/validator");

const { checkRoleAccess } = require("../middlewares/auth");

router.get(
  "/:id",
  checkRoleAccess("admin", "manager", "client"),
  validateId,
  validator,
  getCategory
);
router.put(
  "/:id",
  checkRoleAccess("admin", "manager"),

  validateUpdate,
  validator,
  updateCategory
);
router.delete(
  "/:id",

  checkRoleAccess("admin"),

  validateId,
  validator,
  deleteCategory
);
router.post(
  "/",
  checkRoleAccess("admin", "manager"),

  validateCreate,
  validator,
  createCategory
);
router.get(
  "/",
  checkRoleAccess("admin", "manager", "client"),

  getAllCategories
);

module.exports = router;
