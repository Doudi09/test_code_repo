const mongoose = require("mongoose");

const uri =
  process.env.NODE_ENV === "test"
    ? process.env.MONGODB_TEST_URL
    : process.env.MONGODB_URL;

mongoose
  // .connect(process.env.MONGODB_URL, {
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });
