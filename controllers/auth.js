const UserModel = require("../models/user");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcrypt");

const {
  generateAccessToken,
  generateRefreshToken,
  encryptToken,
} = require("../utils/auth");

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //get the user from the DB :
    const user = await UserModel.validUserCredentials(email, password);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    //generating the user access and refresh token :

    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user._id,
    });

    //saving the encrypted refresh token to the db
    //crypting the refresh token :
    const encryptedRefreshToken = encryptToken(refreshToken);

    //saving it in the tokens list :
    //each time the user connect using another device, a new refresh token will be added to the tokens list
    user.tokens.push({ token: encryptedRefreshToken });
    await user.save();

    //saving the refresh token in http only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, //to use https
      sameSite: "Strict", //prevent csrf attacks
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    //sending the access token to the client
    return res.status(200).json({
      user: { id: user._id, email: user.email, role: user.role },
      token: accessToken,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    //hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // creating the user :
    const userCreated = await UserModel.create({
      email: email,
      password: hashedPassword,
      role: role,
    });

    //generating the access and refresh token:
    const accessToken = generateAccessToken({
      id: userCreated._id,
      email: userCreated.email,
      role: userCreated.role,
    });

    const refreshToken = generateRefreshToken({
      id: userCreated._id,
    });

    //saving the encrypted refresh token to the db
    //crypting the refresh token :
    const encryptedRefreshToken = encryptToken(refreshToken);

    //saving it in the tokens list :
    userCreated.tokens.push({ token: encryptedRefreshToken });

    //saving the user :
    await userCreated.save();

    //saving the refresh token in serever http only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, //to use https
      sameSite: "Strict", //prevent csrf attacks
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    //sending the access token to the client :

    return res.status(200).json({
      token: accessToken,
      user: { id: userCreated._id, email, role },
      message: "User registered successfully",
    });
    //
  } catch (error) {
    console.error("Error registering user:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.logout = async (req, res) => {
  try {
    //the user is added by the checkAuth middleware
    const userId = req.user.id;
    //retrieving the user to update the tokens list (since the user saved in the req doesnt have the tokens list)
    const user = await UserModel.findById(userId);

    //retrieving the refresh token from the cookie,
    // so we can delete it from the user tokens list
    const refreshToken = req.cookies.refreshToken;

    //encrypt the refresh token
    const hashedRefreshToken = encryptToken(refreshToken);

    //deleting the token from the tokens user
    user.tokens = user.tokens.filter(
      (token) => token.token !== hashedRefreshToken
    );
    //updating the user :
    await user.save();

    // Destroy refresh token cookie with `expireCookieOptions` containing a past date
    res.cookie("refreshToken", "", { expires: new Date(1) });
    //
    return res.status(201).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Error logging out user:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.logoutAllDevices = async (req, res) => {
  try {
    //logging out from all the devices ==> tokens to empty list
    const userId = req.user.id;
    const user = await UserModel.findById(userId);
    user.tokens = [];
    await user.save();
    //destroy it from the cookie too
    res.cookie("refreshToken", "", { expires: new Date(1) });
    //
    return res
      .status(201)
      .json({ message: "Logged out from all devices successfully" });
  } catch (error) {
    console.error("Error logging out all devices:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.refreshAccessToken = async (req, res) => {
  try {
    //retrieving the refresh token from the cookie,
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    //decode the refresh token so we verify that its a valid one, and get the data from it ==> usee_id  :
    const { id: userId } = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    //encrypting the refresh token, so we verify in the DB since it has been saved
    const encryptedRefreshToken = encryptToken(refreshToken);

    //looking for the user with id and the refresh token crypted :
    const user = await UserModel.findOne({
      _id: userId,
      "tokens.token": encryptedRefreshToken,
    });

    //case where no user have the refresh token or the id provided :
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //if the user exists regenerate a new access token
    //generating new access token
    const accessToken = generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
    });

    //sending the new access token:
    return res.status(200).json({ token: accessToken });
  } catch (error) {
    console.error("Error refreshing access token:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};
