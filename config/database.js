const { Sequelize } = require("sequelize");
const asyncHandler = require("express-async-handler");

const sequelize = new Sequelize("assets management", "postgres", "balavignesh", {
  host: "localhost",
  dialect: "postgres",
  define: {
    timestamps: false,
  },
  logging: false,
});

const database = asyncHandler(async (req, res) => {
  try {
    await sequelize.authenticate();
    console.log(`Database connected on : ${sequelize.config.database}`);

    await sequelize.sync({ force: false });
    console.log("Database synchronized.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
});

module.exports = {
  sequelize,
  database,
};
