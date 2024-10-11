const Category = require("../models/category");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Create a new category instance
    const newCategory = new Category({
      name,
      description,
    });

    // Saving the new category to the database
    await newCategory.save();

    res.status(200).json({
      message: "Category registered successfully.",
      category: {
        id: newCategory._id,
        name: newCategory.name,
        description: newCategory.description,
      },
    });
  } catch (error) {
    console.error("Error creating category :", error.message);
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
      { name, description },
      { new: true }
    );
    //returning the updated category
    return res.status(200).json({
      message: "Category updated successfully.",
      category: {
        id: updatedCategory._id,
        description: updatedCategory.description,
        name: updatedCategory.name,
      },
    });
  } catch (error) {
    console.error("Error updating Category:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    //retrieving the category to delete from the db
    const deletedCategory = await Category.findById(id);
    //soft delete ==> set the flag isDeleted to true
    deletedCategory.isDeleted = true;
    await deletedCategory.save();

    res.status(201).json({ message: "Category deleted successfully." });
  } catch (error) {
    console.error("Error deleting Category:", error.message);

    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    //data used for pagination
    const currentPage = parseInt(req.query.page) || 1; //default value 1
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 5; //default value to 5

    //calculate the offset based on the current page and items per page to skip
    const offset = (currentPage - 1) * itemsPerPage;
    //getting the page of data
    const data = await Category.find().skip(offset).limit(itemsPerPage);

    //calculating  the number of pages
    const totalPages = Math.ceil(
      parseInt((await Category.countDocuments()) || 0) / itemsPerPage
    );
    //return the result
    return res.status(200).json({
      categories: data,
      currentPage,
      itemsPerPage,
      totalPages,
    });

    // -----------------
  } catch (error) {
    console.error("Error getting Categorys:", error.message);

    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const { id } = req.params;
    //getting the category by its id
    const category = await Category.findById({ _id: id });
    //returning the result
    return res.status(200).json({ category: category });
  } catch (error) {
    console.error("Error getting Category:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
