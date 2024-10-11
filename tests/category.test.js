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

//TEST FOR CREATE A NEW CATEGORY
describe("Create category API", () => {
  it("POST /api/category => should create a new category", async () => {
    const res = await request(app)
      .post("/api/category")
      .set("Authorization", "Bearer fakeAccessToken")
      .send({ name: "Electronics", description: "Electronics description" });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Category registered successfully.");
    expect(res.body.category).toHaveProperty("name", "Electronics");
    expect(res.body.category).toHaveProperty(
      "description",
      "Electronics description"
    );
  });

  it("POST /api/category => should return bad request if data is invalid", async () => {
    //adding a category
    const addedCategory = new Category({
      name: "Electronics",
      description: "Electronics description",
    });
    await addedCategory.save();
    const badData = [
      //case where name is not specified
      {
        description: "Electronics description",
      },

      //case where both name and description are not specified
      {},
      //case where name is not unique
      { name: "Electronics", description: "Electronics description" },
    ];

    for (const data of badData) {
      const res = await request(app)
        .post("/api/category")
        .set("Authorization", "Bearer fakeAccessToken")
        .send(data);

      expect(res.statusCode).toEqual(400);
      //verify that the error message is about the name, (unique or unavailable)
      expect(res.body.errors[0]).toHaveProperty("path", "name");
    }
  });
});

//TEST FOR UPDATE A CATEGORY
describe("Update category API", () => {
  it("PUT /api/category/:id => should update a category", async () => {
    const category = await Category.create({
      name: "Electronics",
      description: "Electronics description",
    });
    const res = await request(app)
      .put(`/api/category/${category._id}`) //update the category
      .set("Authorization", "Bearer fakeAccessToken")
      .send({
        name: "Electronics UPDATED",
        description: "Electronics description",
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe("Category updated successfully.");
    expect(res.body.category).toHaveProperty("name", "Electronics UPDATED");
    expect(res.body.category).toHaveProperty(
      "description",
      "Electronics description"
    );
  });

  it("PUT /api/category/:id => should return bad request if data is invalid", async () => {
    const categoryToUpdate = await Category.create({
      name: "Electronics",
      description: "Electronics description",
    });
    //adding another category, for the case where the category name is updated with an existing name
    await Category.create({
      name: "Name exists",
      description: "description",
    });

    const badData = [
      //case where no data is specified
      {},
      //case where the category name is empty
      { name: "" },
      // case where the category name is not unique
      { name: "Name exists" },
    ];
    for (const data of badData) {
      const res = await request(app)
        .put(`/api/category/${categoryToUpdate._id}`) //update the category
        .set("Authorization", "Bearer fakeAccessToken")
        .send(data);

      expect(res.statusCode).toEqual(400);
    }
  });

  it("PUT /api/category/:id => should return bad request if id is invalid", async () => {
    const res = await request(app)
      .put(`/api/category/${"invalid-id"}`) //update the category
      .set("Authorization", "Bearer fakeAccessToken")
      .send({ name: "category", description: "category description" });

    expect(res.statusCode).toEqual(400);
  });
});

//TEST DELETE CATEGORY :
describe("Delete category API", () => {
  it("DELETE api/category/:id => should delete category", async () => {
    const category = await Category.create({
      name: "Electronics",
      description: "Electronics description",
    });
    const res = await request(app)
      .delete(`/api/category/${category._id}`) //delete the category
      .set("Authorization", "Bearer fakeAccessToken");
    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe("Category deleted successfully.");
    //verify if the category is deleted
    const deletedCategory = await Category.findById(category._id);
    expect(deletedCategory).toBeNull();
  });

  it("DELETE api/category/:id => should return bad request invalid id", async () => {
    const res = await request(app)
      .delete(`/api/category/${"invalid-id"}`) //delete the category
      .set("Authorization", "Bearer fakeAccessToken");
    expect(res.statusCode).toEqual(400);
  });
});

//TEST FOR GET ALL CATEGORIES
describe("Get all categories API", () => {
  it("GET /api/category => should return all categories", async () => {
    for (let i = 1; i <= 6; i++) {
      await Category.create({
        name: `category ${i}`,
        description: "description",
      });
    }

    //since we have pagination :
    const firstPage = await request(app)
      .get("/api/category")
      .set("Authorization", "Bearer fakeAccessToken");

    //sould have length of 5
    expect(firstPage.statusCode).toEqual(200);
    expect(firstPage.body.categories).toHaveLength(5);
    expect(firstPage.body.currentPage).toEqual(1);
    expect(firstPage.body.itemsPerPage).toEqual(5);
    expect(firstPage.body.totalPages).toEqual(2);

    const secondPage = await request(app)
      .get("/api/category")
      .set("Authorization", "Bearer fakeAccessToken")
      .query({ page: 2 });
    //sould have length of 1
    expect(secondPage.statusCode).toEqual(200);
    expect(secondPage.body.categories).toHaveLength(1);
    expect(secondPage.body.currentPage).toEqual(2);
    expect(secondPage.body.itemsPerPage).toEqual(5);
    expect(secondPage.body.totalPages).toEqual(2);
  });
});

//TEST GET A CATEGORY :
describe("Get category API", () => {
  it("GET /api/category/:id => should return a category", async () => {
    const category = await Category.create({
      name: "Category 1",
      description: "description",
    });

    const res = await request(app)
      .get(`/api/category/${category._id}`)
      .set("Authorization", "Bearer fakeAccessToken");

    expect(res.statusCode).toEqual(200);
    expect(res.body.category).toHaveProperty("name", category.name);
    expect(res.body.category).toHaveProperty(
      "description",
      category.description
    );
  });

  it("GET /api/category/:id => should return bad request if id is invalid", async () => {
    const res = await request(app)
      .get(`/api/category/${"invalid-id"}"`)
      .set("Authorization", "Bearer fakeAccessToken");

    expect(res.statusCode).toEqual(400);
  });
});
