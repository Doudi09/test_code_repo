const router = require("express").Router();

const {
  validateCreate,
  validateRole,
} = require("../middlewares/validation/user");
const { validator } = require("../middlewares/validator");

const {
  createUser,
  getAllUsers,
  deleteUser,
  assignRole,
} = require("../controllers/user");

router.post("/", validateCreate, validator, createUser);

router.get("/", getAllUsers);

router.put("/:id", validateRole, validator, assignRole);

router.delete("/:id", deleteUser);

module.exports = router;
