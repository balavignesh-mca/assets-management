const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const adminRoute = require("./router/adminRoute");
const employeeRoute = require("./router/employeeRoute");
const pug_Routes = require("./pug-routes/pugRoutes");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

//=================pug-Routes=================
app.use("/", pug_Routes);

//=================Routes=================
app.use("/api", adminRoute);
app.use("/api", employeeRoute);

module.exports = app;
