const {
  employeeRegister,
  adminLogin,
  employeeDetails,
  updateEmployeeDetail,
  otpToMail,
} = require("../controllers/adminController");
const { createAsset, deleteAsset, getAllAssets, updateAsset, scrapAsset, addAssetHistoryMiddleware } = require("../controllers/assetController");

const { tokenVerify, roleVerify } = require("../middleware/userVerify");

const Route = require("express").Router();

//======================== ADMIN ROUTES ==========================

Route.route("/adminLogin").post(adminLogin);
Route.route("/employeeRegister").post(tokenVerify, roleVerify("Admin"), employeeRegister);
Route.route("/employeeDetails").post(tokenVerify, roleVerify("Admin"), employeeDetails);
Route.route("/createAsset").post(tokenVerify, roleVerify("Admin"), createAsset, addAssetHistoryMiddleware);
Route.route("/deleteAsset/:id").delete(tokenVerify, roleVerify("Admin"), deleteAsset, addAssetHistoryMiddleware);
Route.route("/updateAsset/:asset_id/:empId").put(tokenVerify,roleVerify("Admin"),updateAsset,addAssetHistoryMiddleware);
Route.route("/scrapAsset").put(tokenVerify, roleVerify("Admin"), scrapAsset, addAssetHistoryMiddleware);


//=================== ADMIN && EMPLOYEE ROUTES ===================
Route.route("/otp").post(otpToMail);
Route.route("/updateEmployeeDetail/:id").put(tokenVerify, roleVerify("Admin", "Employee"), updateEmployeeDetail);

//here for employee only can retrive assets assigned for that employee
Route.route("/getAllAssets").post(tokenVerify, roleVerify("Admin", "Employee"), getAllAssets);

module.exports = Route;
