const mongoose = require("mongoose");
const category = require("../models/category");
const Category = mongoose.model("Category");

// Controller function to register a new customer
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Create a new customer instance
    const newCategory = new Category({
      name,
      description,
    });

    // Save the new customer to the database
    await newCategory.save();

    res.status(201).json({
      message: "Category registered successfully.",
      Category: newCategory,
    });
  } catch (error) {
    console.error("Error registering :", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const { id } = req.params;

    //updating the record :
    const updatedCategory = await Category.findByIdAndUpdate(
      { _id: id },
      { name, description }
    );
    return res.status(201).json({
      message: "Category registered successfully.",
      Category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating Category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findById(id);
    deletedCategory.isDeleted = true;
    await deletedCategory.save();

    res.status(201).json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Error deleting Category:", error);

    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getAllCategories = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 5;

    const offset = (currentPage - 1) * itemsPerPage;

    const data = await Category.find().skip(offset).limit(itemsPerPage);

    console.log(
      "the totla pages with the filter ",
      await Category.countDocuments()
    );
    const totalPages = Math.ceil(
      parseInt((await Category.countDocuments()) || 0) / itemsPerPage
    );
    console.log("the total pages is ", totalPages);
    res.status(200).json({
      categories: data,
      currentPage,
      itemsPerPage,
      totalPages,
    });

    // -----------------
  } catch (error) {
    console.error("Error getting Categorys:", error);

    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById({ _id: id });
    res.status(200).json(category);
  } catch (error) {
    console.error("Error getting Category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
