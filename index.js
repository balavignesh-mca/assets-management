const dotEnv = require("dotenv").config();
const app = require("./app");
const { database } = require("./config/database");

database();

app.listen(process.env.PORT, () => {
  console.log(`server is running on port ${process.env.PORT}`);
});
