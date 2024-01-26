const saltRounds = 10;
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const Employee = require("../models/employeeSchema");
const asyncHandler = require("express-async-handler");
const { sendEmail } = require("../middleware/nodeMailer");

//=============================== Route -> api/employeeRegister ==================================
exports.employeeRegister = asyncHandler(async (req, res) => {
  try {
    // ============ checking mandatory fields with for Loop ==========
    const { firstName, lastName, email, password, role, mobileNo, jobType, address, salary, joinDate } = req.body;

    const mandatoryFields = [
      "firstName",
      "lastName",
      "email",
      "password",
      "role",
      "mobileNo",
      "jobType",
      "salary",
      "address",
    ];
    for (const field of mandatoryFields) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, message: `${field} is required.` });
      }
    }

    // =========== EMAIL CHECK ==========
    const existingUser = await Employee.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

   
    // =========== ENCRYPT PASSWORD AND STORE DATA ==========
    const hash = await bcrypt.hash(password, saltRounds);
    await Employee.create({
      
      firstName,
      lastName,
      email,
      password: hash,
      role,
      mobileNo,
      jobType,
      salary,
      address,
      joinDate: new Date(joinDate),
    });

    return res.status(200).json({ success: true, message: "Employee registered successfully." });
  } catch (error) {
    console.error("Error during employee registration:", error);
    return res.status(500).json({ success: false, message: `Server Error: ${error.message || error}` });
  }
});

//================================== Route -> api/adminLogin =====================================
exports.adminLogin = asyncHandler(async (req, res) => {
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
    } else if (!existingUser.role || existingUser.role.toLowerCase() !== "admin") {
      return res.status(404).json({ success: false, message: `Not an Admin account. Check your email. ` });
    }
    //======================password check========================
    const passwordMatch = await bcrypt.compare(password, existingUser.password);
    if (!passwordMatch) {
      return res.status(403).json({ success: false, message: "Incorrect password!" });
    }
    //==============JWT token genrate and send response===========
    const token = jwt.sign({ user: { id: existingUser.id, role: existingUser.role } }, process.env.SECRET_KEY);
    return res.status(201).json({ success: true, token, message: "Admin logged successfully!" });
  } catch (error) {
    console.error("Error during admin login:", error);
    return res.status(500).json({ success: false, message: `Server Error: ${error.message || error}` });
  }
});

//=============================== Route -> api/employeeDetails/ ==================================
exports.employeeDetails = asyncHandler(async (req, res) => {
  try {
    // =================Retrieve query parameters=================
    const { jobType, isWorking, startDate, endDate, minSalary, maxSalary } = req.body;

    // Build the filter object based on the provided parameters
    const filter = {};

    if (jobType) {
      filter.jobType = jobType;
    }
    if (isWorking !== undefined) {
      filter.isWorking = isWorking;
    }
    if (startDate && endDate) {
      filter.joinDate = { [Op.between]: [new Date(startDate), new Date(endDate)] };
    }
    if (minSalary && maxSalary) {
      filter.salary = { [Op.between]: [parseInt(minSalary), parseInt(maxSalary)] };
    }

    // ==========Find employee data based on the filter===========
    const employeeData = await Employee.findAll({ where: filter });

    // Check if employee data is found
    if (employeeData.length === 0) {
      return res.status(404).json({ success: false, message: "Employees not found!" });
    }

    // Send the filtered employee data in the response
    return res.status(200).json({ success: true, employeeData });
  } catch (error) {
    console.error("Error during employee data fetch:", error);
    return res.status(500).json({ success: false, message: `Server Error: ${error.message || error}` });
  }
});

//============================== Route -> api/updateEmployeeDetail/:id ===========================
exports.updateEmployeeDetail = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // ===================Find employee data =====================
    const employeeData = await Employee.findByPk(id);

    // Check if employee data is found
    if (!employeeData) {
      return res.status(404).json({ success: false, message: "Employee account not found!" });
    }

    // Update specific details based on the request body
    const updatedFields = req.body;

    if (updatedFields.password) {
      const hashedPassword = await bcrypt.hash(updatedFields.password, saltRounds);
      updatedFields.password = hashedPassword;
    }

    await employeeData.update(updatedFields, { new: true });

    // Send the updated employee data in the response
    return res.status(200).json({ success: true, employeeData });
  } catch (error) {
    console.error("Error during employee data update:", error);
    return res.status(500).json({ success: false, message: `Server Error: ${error.message || error}` });
  }
});

//==================================== otp email verification ====================================
exports.otpToMail = asyncHandler(async (req, res) => {
  try {
    const existingUser = await Employee.findOne({ where: { email: req.body.email } });
    if (!existingUser) {
      return res.status(409).json({ success: false, message: "Email not found" });
    }

    const generatedOtp = () => Math.floor(100000 + Math.random() * 900000);
    let otp = generatedOtp();

    // Send email
    const mail = await sendEmail(req.body.email, "ASSETS APP VERIFY", `DONT SHARE THIS OTP **${otp}** TO ANYONE`);

    res.status(201).json({
      success: true,
      otp,
      message: "Successfully otp sent to email",
    });
  } catch (error) {
    console.error(error);

    let errorMessage = "Something went wrong while processing the request.";

    // Check specific errors
    if (error.code === "ENOENT") {
    } else if (error.response && error.response.statusCode) {
      errorMessage = `Error sending email: ${error.response.statusCode}`;
    }

    res.status(500).json({
      success: false,
      message: errorMessage,
    });
  }
});
