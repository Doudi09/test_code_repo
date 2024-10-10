const router = require("express").Router();

const {
  validateLogin,
  validateRegister,
} = require("../middlewares/validation/auth");

const { validator } = require("../middlewares/validator");

const {
  login,
  register,
  logout,
  refreshAccessToken,
  logoutAllDevices,
} = require("../controllers/auth");

const { checkAuth } = require("../middlewares/auth");

router.post("/register", validateRegister, validator, register);
router.post("/login", validateLogin, validator, login);
router.post("/logout", checkAuth, logout);
router.post("/logout-all", checkAuth, logoutAllDevices);
router.post("/refresh-auth", refreshAccessToken);

module.exports = router;
