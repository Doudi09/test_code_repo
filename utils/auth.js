const jwt = require("jsonwebtoken");
const crypto = require("crypto");

//generate access token :
exports.generateAccessToken = (user) => {
  //generating the user access token :
  const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
  });
  return accessToken;
};

exports.generateRefreshToken = (user) => {
  //generating the user refresh token :
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
  });
  return refreshToken;
};

exports.encryptToken = (token) => {
  const encryptedRefreshToken = crypto
    .createHmac("sha256", process.env.REFRESH_TOKEN_HASH_SECRET)
    .update(token)
    .digest("hex");

  return encryptedRefreshToken;
};
