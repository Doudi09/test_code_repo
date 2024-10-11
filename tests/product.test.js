const request = require("supertest");
const app = require("../app");
require("dotenv").config();
const mongoose = require("mongoose");
const Category = require("../models/category");
const Product = require("../models/product");

beforeAll(async () => {
  // Connect to the test database
  await mongoose.connect(process.env.MONGODB_TEST_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  // Clear the database before each test
  await Product.deleteMany({});
  await Category.deleteMany({});
});

afterAll(async () => {
  // Disconnect after tests are done
  await mongoose.disconnect();
});

jest.mock("../middlewares/auth", () => ({
  checkAuth: (req, res, next) => {
    req.user = { id: "605c39fbd642b12a04a5b2f3", role: "admin" };
    req.token = "fakeAccessToken";
    next();
  },
  checkRoleAccess:
    (...roles) =>
    (req, res, next) => {
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      next();
    },
}));

// TEST CREATE A PRODUCT :
describe("Create product API", () => {
  it("POST /api/product => should create a new product", async () => {
    //creating a new category
    const category = new Category({
      name: "Electronics",
      description: "Electronics description",
    });
    await category.save();

    const res = await request(app)
      .post("/api/product")
      .set("Authorization", "Bearer fakeAccessToken")
      .send({
        name: "Product 1",
        description: "description",
        price: 20,
        stock_quantity: 100,
        category_id: category._id,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Product registered successfully.");

    expect(res.body.product).toHaveProperty("name", "Product 1");
    expect(res.body.product).toHaveProperty("description", "description");
    expect(res.body.product).toHaveProperty("price", 20);
    expect(res.body.product).toHaveProperty("stock_quantity", 100);
    expect(res.body.product).toHaveProperty(
      "category",
      category._id.toString()
    );
  });

  it("POST /api/product => should return bad request if data is invalid", async () => {
    //adding a category
    const addedCategory = new Category({
      name: "Electronics",
      description: "Electronics description",
    });
    await addedCategory.save();
    const badData = [
      //case where no data is available
      {},
      //case where name is not specified
      {
        description: "Electronics description",
        price: 20,
        stock_quantity: 100,
        category_id: addedCategory._id,
      },
      //case where price < 0
      {
        name: "Electronics",
        description: "Electronics description",
        stock_quantity: 100,
        category_id: addedCategory._id,
        price: -10,
      },
      //case where stock_quantity < 0
      {
        name: "Electronics",
        description: "Electronics description",
        price: 20,
        category_id: addedCategory._id,
        stock_quantity: -100,
      },
      //case where category_id is not valid
      {
        name: "Electronics",
        description: "Electronics description",
        price: 20,
        stock_quantity: 100,
        category_id: "invalid_id",
      },
      //case where name is not provided
      {
        name: "Electronic product",
        description: "description",
        price: -20,
        stock_quantity: 100,
        category_id: addedCategory._id,
      },
      //case where stock quantity < 0
      {
        name: "Electronics",
        description: "Electronics description",
        price: 20,
        stock_quantity: -100,
        category_id: addedCategory._id,
      },
      //case where category id is not valid
      {
        name: "Electronics",
        description: "Electronics description",
        price: 20,
        stock_quantity: -100,
        category_id: "invalid_id",
      },
    ];

    for (const data of badData) {
      const res = await request(app)
        .post("/api/product")
        .set("Authorization", "Bearer fakeAccessToken")
        .send(data);
      expect(res.statusCode).toEqual(400);
    }
  });
});

//TEST FOR UPDATE A PRODUCT
describe("Update product API", () => {
  it("PUT /api/product/:id => should update a product", async () => {
    const category = await Category.create({ name: "category 1" });

    const product = await Product.create({
      name: "new product name",
      description: "description",
      price: 20,
      stock_quantity: 100,
      category: category._id,
    });

    const res = await request(app)
      .put(`/api/product/${product._id}`) //update the category
      .set("Authorization", "Bearer fakeAccessToken")
      .send({
        name: "new product name updated",
        description: "description",
        price: 20,
        stock_quantity: 100,
        category_id: category._id,
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Product updated successfully.");
    expect(res.body.product).toHaveProperty("name", "new product name updated");
    expect(res.body.product).toHaveProperty("description", product.description);
    expect(res.body.product).toHaveProperty("price", product.price);
    expect(res.body.product).toHaveProperty(
      "stock_quantity",
      product.stock_quantity
    );
    expect(res.body.product.category).toEqual(product.category.toString());
  });

  it("PUT /api/product/:id => should return bad request if data is invalid", async () => {
    const category = await Category.create({
      name: "Electronics",
      description: "Electronics description",
    });
    const productToUpdate = await Product.create({
      name: "Electronics",
      description: "Electronics description",
      price: 20,
      stock_quantity: 100,
      category: category._id,
    });

    const badData = [
      //case where no data is specified
      {},
      //case where name is not specified
      {
        description: "Electronics description",
        price: 20,
        stock_quantity: 100,
        category_id: category._id,
      },
      //case where price < 0
      {
        name: "Electronics",
        description: "Electronics description",
        stock_quantity: 100,
        category_id: category._id,
        price: -10,
      },
      //case where stock_quantity < 0
      {
        name: "Electronics",
        description: "Electronics description",
        price: 20,
        category_id: category._id,
        stock_quantity: -100,
      },
      //case where category_id is not valid
      {
        name: "Electronics",
        description: "Electronics description",
        price: 20,
        stock_quantity: 100,
        category_id: "invalid_id",
      },
      //case where name is not provided
      {
        name: "Electronic product",
        description: "description",
        price: -20,
        stock_quantity: 100,
        category_id: category._id,
      },
      //case where stock quantity < 0
      {
        name: "Electronics",
        description: "Electronics description",
        price: 20,
        stock_quantity: -100,
        category_id: category._id,
      },
      //case where category id is not valid
      {
        name: "Electronics",
        description: "Electronics description",
        price: 20,
        stock_quantity: -100,
        category_id: "invalid_id",
      },
    ];
    for (const data of badData) {
      const res = await request(app)
        .put(`/api/product/${productToUpdate._id}`) //update the product
        .set("Authorization", "Bearer fakeAccessToken")
        .send(data);

      expect(res.statusCode).toEqual(400);
    }
  });

  it("PUT /api/product/:id => should return bad request if id is invalid", async () => {
    const category = new Category({ name: "test category" });
    await category.save();
    const res = await request(app)
      .put(`/api/product/${"invalid-id"}`)
      .set("Authorization", "Bearer fakeAccessToken")
      .send({
        name: "product",
        description: "product description",
        price: 200,
        stock_quantity: 100,
        category_id: category._id,
      });

    expect(res.statusCode).toEqual(400);
  });
});

//TEST DELETE PRODUCT :
describe("Delete prooduct API", () => {
  it("DELETE api/product/:id => should delete product", async () => {
    const category = await Category.create({
      name: "Electronics",
      description: "Electronics description",
    });

    const product = await Product.create({
      name: "Product 1",
      description: "Product description",
      price: 200,
      stock_quantity: 100,
      category: category._id,
    });

    const res = await request(app)
      .delete(`/api/product/${product._id}`) //delete the product
      .set("Authorization", "Bearer fakeAccessToken");
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe("Product deleted successfully.");
    //verify if the product is deleted
    const deletedProduct = await Product.findById(product._id);
    expect(deletedProduct).toBeNull();
  });

  it("DELETE api/product/:id => should return bad request invalid id", async () => {
    const res = await request(app)
      .delete(`/api/product/${"invalid-id"}`) //delete the category
      .set("Authorization", "Bearer fakeAccessToken");
    expect(res.statusCode).toEqual(400);
  });
});

//TEST FOR GET ALL PRODUCTS
describe("Get all products API", () => {
  it("GET /api/product => should return all products (first page by default)", async () => {
    const category = await Category.create({
      name: "Category 1",
      description: "description",
    });

    for (let i = 1; i <= 6; i++) {
      await Product.create({
        name: `Product ${i}`,
        description: `Product description ${i}`,
        price: 200,
        stock_quantity: 100,
        category: category._id,
      });
    }

    //since we have pagination :
    const firstPage = await request(app)
      .get("/api/product")
      .set("Authorization", "Bearer fakeAccessToken");

    //sould have length of 5
    expect(firstPage.statusCode).toEqual(200);
    expect(firstPage.body.products).toHaveLength(5);
    expect(firstPage.body.currentPage).toEqual(1);
    expect(firstPage.body.itemsPerPage).toEqual(5);
    expect(firstPage.body.totalPages).toEqual(2);
  });

  it("GET /api/product => should return all products with applied filter (valid category id and price range)", async () => {
    const category1 = await Category.create({
      name: "Category 1",
      description: "description",
    });

    const category2 = await Category.create({
      name: "Category 2",
      description: "description",
    });
    //6 products with category 1
    for (let i = 1; i <= 6; i++) {
      await Product.create({
        name: `Product ${i}`,
        description: `Product description ${i}`,
        price: 200,
        stock_quantity: 100,
        category: category1._id,
      });
    }

    //3 products with category 2
    for (let i = 7; i <= 9; i++) {
      await Product.create({
        name: `Product ${i}`,
        description: `Product description ${i}`,
        price: 200,
        stock_quantity: 100,
        category: category2._id,
      });
    }

    //since we have pagination :
    const firstPage = await request(app)
      .get("/api/product")
      .query({
        category: category2._id.toString(),
        priceRangeMin: 150,
        priceRangeMax: 300,
      })

      .set("Authorization", "Bearer fakeAccessToken");

    //sould have length of 3
    expect(firstPage.statusCode).toEqual(200);
    expect(firstPage.body.products).toHaveLength(3);
    expect(firstPage.body.currentPage).toEqual(1);
    expect(firstPage.body.itemsPerPage).toEqual(5);
    expect(firstPage.body.totalPages).toEqual(1);
  });

  it("GET /api/product => should return bad request if category id is invalid or price range is invalid (max < min)", async () => {
    const category1 = await Category.create({
      name: "Category 1",
      description: "description",
    });

    //6 products with category 1
    for (let i = 1; i <= 6; i++) {
      await Product.create({
        name: `Product ${i}`,
        description: `Product description ${i}`,
        price: 200,
        stock_quantity: 100,
        category: category1._id,
      });
    }

    const badQuery = [
      // case of invalid category id
      { category: "invali id", priceRangeMin: 150, priceRangeMax: 300 },
      //case where invalid price range :
      {
        category: category1._id.toString(),
        priceRangeMin: 150,
        priceRangeMax: 120,
      },
    ];
    for (let query of badQuery) {
      //since we have pagination :
      const result = await request(app)
        .get("/api/product")
        .query(query)
        .set("Authorization", "Bearer fakeAccessToken");

      expect(result.statusCode).toEqual(400);
    }
  });
});

//TEST GET A PRODUCT :
describe("Get product API", () => {
  it("GET /api/product/:id => should return a product", async () => {
    const category = await Category.create({
      name: "Category 1",
      description: "description",
    });
    const product = await Product.create({
      name: "Product 1",
      description: "Product description",
      price: 200,
      stock_quantity: 100,
      category: category._id,
    });
    const res = await request(app)
      .get(`/api/product/${product._id}`)
      .set("Authorization", "Bearer fakeAccessToken");

    expect(res.statusCode).toEqual(200);
    expect(res.body.product).toHaveProperty("name", product.name);
    expect(res.body.product).toHaveProperty("price", product.price);
    expect(res.body.product).toHaveProperty(
      "stock_quantity",
      product.stock_quantity
    );
    expect(res.body.product.category._id).toEqual(product.category.toString());
    expect(res.body.product).toHaveProperty("description", product.description);
  });

  it("GET /api/product/:id => should return bad request if id is invalid", async () => {
    const res = await request(app)
      .get(`/api/product/${"invalid-id"}"`)
      .set("Authorization", "Bearer fakeAccessToken");

    expect(res.statusCode).toEqual(400);
  });
});
