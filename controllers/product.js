const Product = require("../models/product");

exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stock_quantity, category_id } = req.body;

    // Create a new product instance
    const newProduct = new Product({
      name,
      description,
      price,
      stock_quantity,
      category: category_id,
    });

    // Save the new product to the db
    await newProduct.save();

    res.status(200).json({
      message: "Product registered successfully.",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error creating product : ", error.message);
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
      { name, description, price, stock_quantity, category: category_id },
      { new: true }
    );

    return res.status(200).json({
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    //retrieve product to delete
    const deletedProduct = await Product.findById(id);
    //soft delete
    deletedProduct.isDeleted = true;
    await deletedProduct.save();

    res.status(201).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.error("Error deleting product:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    //pagination params
    const currentPage = parseInt(req.query.page) || 1;
    const itemsPerPage = parseInt(req.query.itemsPerPage) || 5;

    //query params
    const category = req.query.category || null;

    const priceRangeMax = req.query.priceRangeMax || null;
    const priceRangeMin = req.query.priceRangeMin || null;

    // Calculate the offset based on the current page and items per page
    const offset = (currentPage - 1) * itemsPerPage;

    //defining the filter based on the query parameters
    let filter = {};
    filter = category ? { category } : {};
    filter = priceRangeMax
      ? { ...filter, price: { $lte: priceRangeMax } }
      : filter;
    filter = priceRangeMin
      ? { ...filter, price: { ...filter?.price, $gte: priceRangeMin } }
      : filter;

    //retrieving the page of data with the filter applied
    const data = await Product.find(filter)
      .skip(offset)
      .limit(itemsPerPage)
      .populate("category");

    //total pages with filter applied
    const totalPages = Math.ceil(
      parseInt((await Product.countDocuments(filter)) || 0) / itemsPerPage
    );
    //returning the data
    return res.status(200).json({
      products: data,
      currentPage,
      itemsPerPage,
      totalPages,
    });
  } catch (error) {
    console.error("Error getting products : ", error.message);

    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    //getting the product
    const product = await Product.findById({ _id: id }).populate("category");
    return res.status(200).json({ product });
  } catch (error) {
    console.error("Error getting product : ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
