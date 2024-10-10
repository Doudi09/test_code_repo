const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: "Name is required!",
  },
  description: {
    type: String,
  },
  //for soft delete
  isDeleted: {
    type: Boolean,
    default: false,
    select: false,
  },
});

CategorySchema.statics = {
  isValidId: async function (id) {
    const result = await this.findById(id);
    console.log("the category valid id function and the result is ", result);
    if (!result) throw new Error("Category not found");
    return true;
  },

  nameExits: async function (name) {
    const result = await this.findOne({ name });
    if (result) return true;
    return false;
  },
};

//soft delete find update, to fetch only the available data :
CategorySchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});

module.exports = mongoose.model("Category", CategorySchema);
