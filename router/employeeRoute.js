const { returnAsset, addAssetHistoryMiddleware } = require("../controllers/assetController");
const { employeeLogin, getEmployeeDetail } = require("../controllers/employeeController");
const { tokenVerify, roleVerify } = require("../middleware/userVerify");
const Route = require("express").Router();

//=======EMPLOYEE ROUTES ==========
Route.route("/employeeLogin").post(employeeLogin);
Route.route("/getEmployeeDetail").get(tokenVerify, roleVerify("Employee"), getEmployeeDetail);
Route.route("/returnAsset").put(tokenVerify, roleVerify("Employee"), returnAsset, addAssetHistoryMiddleware);


module.exports = Route;
