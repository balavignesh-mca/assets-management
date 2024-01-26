const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const Employee = require("../models/employeeSchema");

//================================= Route -> api/employeeLogin ===================================
exports.employeeLogin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    //============checking mandatory fields with for Loop=========
    const mandatoryFields = ["email", "password"];
    for (const field of mandatoryFields) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, message: `${field} is required.` });
      }
    }

    //===================EMAIL and ROLE Check ====================
 const existingUser = await Employee.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(404).json({ success: false, message: `account not found! check email! ` });

    } else if (!existingUser.role || existingUser.role.toLowerCase() === "admin") {
      return res.status(404).json({ success: false, message: `Admin login not allowed here. ` });
    }
    //======================password check========================
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return res.status(403).json({ success: false, message: "Incorrect password!" });
    }
    //==============JWT token genrate and send response===========
    const token = jwt.sign({ user: { id: existingUser.id, role: existingUser.role } }, process.env.SECRET_KEY);
    return res.status(201).json({ success: true, token, message: " logged successfully!" });
  } catch (error) {
    console.error("Error during  login:", error);
    return res.status(500).json({ success: false, message: `Server Error: ${error.message || error}` });
  }
});

//============================== Route -> api/getEmployeeDetail ==================================
exports.getEmployeeDetail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    


    // ===================Find employee data =====================
    const employeeData = await Employee.findByPk(id);

    // Check if employee data is found
    if (!employeeData) {
      return res.status(404).json({ success: false, message: "Employee not found!" });
    }

    // Send the filtered employee data in the response
    return res.status(200).json({ success: true, employeeData });
  } catch (error) {
    console.error("Error during employee data fetch:", error);
    return res.status(500).json({ success: false, message: `Server Error: ${error.message || error}` });
  }
});

