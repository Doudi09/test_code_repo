const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    //hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //create a new user
    const newUser = new User({ email, password: hashedPassword, role });
    await newUser.save();

    return res.status(201).json({
      message: "User created successfully.",
      user: { id: newUser._id, email, role },
    });

    //
  } catch (error) {
    console.error("Error creating user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { role } = req.body;
    const { id } = req.params;
    //retrieve the user
    const user = await User.findById(id);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    //updating the role of the user
    user.role = role;
    await user.save();

    return res.status(200).json({
      message: "Role assigned successfully.",
      user: { id: user._id, email: user.email, role },
    });
  } catch (error) {
    console.error("Error assigning role:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    //if the id is not provided
    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    //retrieve the user
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(400).json({ message: "User not found" });
    }
    //return the deleted user details
    return res.status(200).json({
      message: "User deleted successfully.",
      user: {
        id: deletedUser._id,
        email: deletedUser.email,
        role: deletedUser.role,
      },
    });
  } catch (error) {
    console.error("Error deleting user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    //retrieving all the users without their password and tokens list
    const users = await User.find({}, { tokens: 0, password: 0 });
    //returning all the users
    return res
      .status(200)
      .json({ message: "Users fetched successfully.", users });
  } catch (error) {
    console.error("Error getting all user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
