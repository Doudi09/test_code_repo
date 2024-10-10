const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    isEmail: true,
    required: "Email is required!",
  },
  password: {
    type: String,
    required: "Password is required!",
  },
  role: {
    type: String,
    enum: ["admin", "manager", "client"],
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

UserSchema.statics = {
  validUserCredentials: async function (email, password) {
    /**
     *
     * return the user if the credentials are valid, otherwise null
     */
    console.log("the valid user credentials : ", email, password);
    const user = await this.findOne({ email });
    if (!user) return null;
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return null;
    return user;
  },

  emailExists: async function (email) {
    const exists = await this.findOne({ email });
    console.log("the user email exists result is ", exists);
    if (exists) return true;
    return false;
  },
};

module.exports = mongoose.model("User", UserSchema);
