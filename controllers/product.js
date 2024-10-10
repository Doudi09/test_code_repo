const mongoose = require("mongoose");
const Product = mongoose.model("Product");
const Category = mongoose.model("Category");

// Controller function to register a new customer
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock_quantity, category_id } = req.body;

    // Check if the category exists
    const categoryExists = await Category.findById(category_id);
    if (!categoryExists) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Create a new customer instance
    const newProduct = new Product({
      name,
      description,
      price,
      stock_quantity,
      category: category_id,
    });

    // Save the new customer to the database
    await newProduct.save();

    res.status(201).json({
      message: "product registered successfully.",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error registering customer:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { name, description, price, stock_quantity, category_id } = req.body;
    const { id } = req.params;

    //updating the record :
    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: id },
      { name, description, price, stock_quantity, category: category_id }
    );
    return res.status(201).json({
      message: "product registered successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    deletedProduct.isDeleted = true;
    await deletedProduct.save();

    res.status(201).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error);

    res.status(500).json({ message: "Internal server error" });
  }
};
exports.getAllProducts = async (req, res) => {
  try {
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 5;

    const category = req.query.category || null;

    const priceRangeMax = req.query.priceRangeMax || null;
    const priceRangeMin = req.query.priceRangeMin || null;

    // Calculate the offset based on the current page and items per page
    const offset = (currentPage - 1) * itemsPerPage;

    let filter = {};
    filter = category ? { category } : {};
    filter = priceRangeMax
      ? { ...filter, price: { $lte: priceRangeMax } }
      : filter;
    filter = priceRangeMin
      ? { ...filter, price: { ...filter?.price, $gte: priceRangeMin } }
      : filter;

    console.log("the filter is ", filter);

    const data = await Product.find(filter)
      .skip(offset)
      .limit(itemsPerPage)
      .populate("category");

    console.log(
      "the totla pages with the filter ",
      await Product.countDocuments(filter)
    );
    const totalPages = Math.ceil(
      parseInt((await Product.countDocuments(filter)) || 0) / itemsPerPage
    );
    console.log("the total pages is ", totalPages);
    res.status(200).json({
      products: data,
      currentPage,
      itemsPerPage,
      totalPages,
    });

    // -----------------
    // const products = await Product.find().populate("category");
    // res.status(200).json(products);
  } catch (error) {
    console.error("Error getting products:", error);

    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById({ _id: id }).populate("category");
    res.status(200).json(product);
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
