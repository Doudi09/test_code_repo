const UserModel = require("../models/user");
const bcrypt = require("bcrypt");

exports.createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new UserModel({ email, password: hashedPassword, role });
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
    console.log(role, id);

    const user = await UserModel.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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

    if (!id) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const deletedUser = await UserModel.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
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
    const users = await UserModel.find({}, { tokens: 0, password: 0 });
    res.status(200).json({ message: "Users fetched successfully.", users });
  } catch (error) {
    console.error("Error getting all user:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
