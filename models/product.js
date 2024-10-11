const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: "Name is required!",
  },
  description: {
    type: String,
  },

  price: {
    type: Number,
    required: "Price is required!",
    min: 0,
  },
  stock_quantity: {
    type: Number,
    required: "Stock quantity is required!",
    min: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category", // Reference to Category model
    required: true,
  },
  //soft delete
  isDeleted: {
    type: Boolean,
    default: false,
    select: false,
  },
});

ProductSchema.statics = {
  isValidId: async function (id) {
    const result = await this.findById(id);
    if (!result) throw new Error("Product not found");
    return true;
  },
};

//soft delete find update, to fetch only the available data :
ProductSchema.pre(/^find/, function (next) {
  this.where({ isDeleted: false });
  next();
});
module.exports = mongoose.model("Product", ProductSchema);
