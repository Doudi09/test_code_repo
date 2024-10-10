const express = require("express");
const app = express();

const cookieParser = require("cookie-parser");

const PORT = process.env.PORT || 3000;

require("dotenv").config();

require("./config/db.js");

app.use(cookieParser());

// ------------------------------ Start -----------------------------

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/category");
const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");

const { checkAuth, checkRoleAccess } = require("./middlewares/auth");

//Setup routes
app.use("/api/product", checkAuth, productRoutes);
app.use("/api/category", checkAuth, categoryRoutes);
app.use("/api/user", checkAuth, checkRoleAccess("admin"), userRoutes);
app.use("/api/auth", authRoutes);

// ------------------------------ End -------------------------------

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
