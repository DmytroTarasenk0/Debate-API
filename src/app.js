const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const { sequelize } = require("./models/main");
const apiRoutes = require("./routes/main");

const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(helmet()); // headers security
app.use(cors()); // cross-origin requests
app.use(express.json()); // json parse

// routes
app.use("/api", apiRoutes);

// error handler middleware
app.use(errorHandler);

// db connect and server start
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // { force: true } GO ON DROP THE TABLE
    await sequelize.sync();
    console.log("All models were synchronised successfully.");

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
