const { addAssetHistoryEntry } = require("../middleware/addHistory");
const { AssetHistory } = require("../models/assetHistory");
const { AssetCategory, Asset } = require("../models/assetSchema");
const asyncHandler = require("express-async-handler");

//=============================== Route -> api/createAsset =======================================
exports.createAsset = asyncHandler(async (req, res) => {
  try {
    const { serialNumber, assetType, make, model, status, newCategoryName } = req.body;

    const mandatoryFields = ["serialNumber", "assetType", "make", "model", "status", "newCategoryName"];
    for (const field of mandatoryFields) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, message: `${field} is required.` });
      }
    }

    // =========== Check if the Category Already Exists ===========
    let existingCategory = await AssetCategory.findOne({
      where: { category_name: newCategoryName },
    });

    if (!existingCategory) {
      existingCategory = await AssetCategory.create({
        category_name: newCategoryName,
      });
    }

    // =========== Check if Serial Number Already Exists ===========
    const existingAsset = await Asset.findOne({
      where: { serial_number: serialNumber },
    });

    if (existingAsset) {
      return res.status(400).json({ success: false, message: "Serial number already exists." });
    }

    // ===================== Create a New Asset ====================
    const newAssetData = {
      serial_number: serialNumber,
      asset_type: assetType,
      make: make,
      model: model,
      status: status,
      category_id: existingCategory.category_id,
    };

    const newAsset = await Asset.create(newAssetData);

    return res.status(200).json({ success: true, message: "Asset created successfully.", data: newAsset });
  } catch (error) {
    console.error("Error during asset creation:", error);
    return res.status(500).json({ success: false, message: `Server Error: ${error.message || error}` });
  }
});

//============================= Route -> api/deleteAsset/:id =====================================
exports.deleteAsset = asyncHandler(async (req, res) => {
  try {
    // ================ Check assests Exists or not ==============
    const existingAsset = await Asset.findByPk(req.params.id);

    if (!existingAsset) {
      return res.status(400).json({ success: false, message: "assest not exists." });
    }

    // ========================== delete Asset ===================

    const newAsset = await existingAsset.destroy();

    return res.status(200).json({ success: true, message: "Asset deleted successfully." });
  } catch (error) {
    console.error("Error during asset delete:", error);
    return res.status(500).json({ success: false, message: `Server Error: ${error.message || error}` });
  }
});

//========================= Route -> api/updateAsset/:asset_id/:empId ============================
exports.updateAsset = asyncHandler(async (req, res) => {
  try {
    const { asset_id, empId } = req.params;
    const { assigned } = req.body;
    // ================ Check asset Exists or not ==============
    const existingAsset = await Asset.findByPk(asset_id);

    if (!existingAsset) {
      return res.status(400).json({ success: false, message: "asset not exists." });
    }

    // ========================== update Asset ===================

    const newAsset = await existingAsset.update({ empId, assigned });

    return res.status(200).json({ success: true, message: "Asset updated successfully." });
  } catch (error) {
    console.error("Error during asset update:", error);
    return res.status(500).json({ success: false, message: `Server Error: ${error.message || error}` });
  }
});

//================================ Route -> api/getAllAssets =====================================
exports.getAllAssets = asyncHandler(async (req, res) => {
  try {
    const { serial_number, asset_type, make, model, status, category_id, empId, asset_id, assigned } = req.body;

    //===========fillter dyanimcally based on request=============
    const whereClause = {};

    if (serial_number) whereClause.serial_number = serial_number;
    if (asset_type) whereClause.asset_type = asset_type;
    if (make) whereClause.make = make;
    if (model) whereClause.model = model;
    if (status) whereClause.status = status;
    if (category_id) whereClause.category_id = category_id;
    if (empId !== undefined) whereClause.empId = empId;
    if (asset_id) whereClause.asset_id = asset_id;
    if (assigned !== undefined) whereClause.assigned = assigned;

 whereClause.status = status !== undefined ? status : { [Op.ne]: "Obsolete" };

    const existingAsset = await Asset.findAll({
      where: whereClause,
    });

    if (!existingAsset.length > 0) {
      return res.status(400).json({ success: false, message: "Assets not exist." });
    }

    return res.status(200).json({ success: true, asset: existingAsset });
  } catch (error) {
    console.error("Error during asset get:", error);
    return res.status(500).json({ success: false, message: `Server Error: ${error.message || error}` });
  }
});

//================================ Route -> api/returnAsset ======================================
exports.returnAsset = asyncHandler(async (req, res) => {
  try {
    const { asset_id, returnReason } = req.body;

    const mandatoryFields = ["asset_id", "returnReason"];
    for (const field of mandatoryFields) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, message: `${field} is required.` });
      }
    }
    // =========== Check if the Category Exists or Not ===========

    const asset = await Asset.findByPk(asset_id);

    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found." });
    }

    asset.empId = null;
    asset.returnReason = returnReason;
    asset.assigned = false;

    if (returnReason.toLowerCase() === "repair"){
      asset.status = "inactive";
    }
      // Save the changes to the database
      await asset.save();

    return res.status(200).json({ success: true, message: "Asset returned successfully." });
  } catch (error) {
    console.error("Error during asset return:", error);
    return res.status(500).json({ success: false, message: `Server Error: ${error.message || error}` });
  }
});

//================================ Route -> api/scrapAsset =======================================
exports.scrapAsset = asyncHandler(async (req, res) => {
  try {
   
    const { asset_id } = req.body;

    
    const mandatoryFields = ["asset_id"];
    for (const field of mandatoryFields) {
      if (!req.body[field]) {
        return res.status(400).json({ success: false, message: `${field} is required.` });
      }
    }

    // ========Check if the asset with the given ID exists========
    const asset = await Asset.findByPk(asset_id);

    if (!asset) {
      return res.status(404).json({ success: false, message: "Asset not found." });
    }

    
    asset.status = "Obsolete"; 

    // Save the changes to the database
    await asset.save();

    return res.status(200).json({ success: true, message: "Asset marked as obsolete." });
  } catch (error) {
    console.error("Error during asset scrap:", error);
    return res.status(500).json({ success: false, message: `Server Error: ${error.message || error}` });
  }
});

//================================ add asset history =============================================
exports.addAssetHistoryMiddleware = asyncHandler(async (req, res, next) => {
  try {
    const assetId = req.params.asset_id || req.params.id;

    if (res.statusCode >= 200 && res.statusCode < 300 && res.body.success === true) {
      let eventType, eventDescription;

      let date = new Date.now();

      switch (req.route.path) {
        case "/createAsset":
          eventType = "Create";
          eventDescription = `Asset created on ${date}.`;
          break;
        case "/deleteAsset/:id":
          eventType = "Delete";
          eventDescription = `Asset deleted on ${date}.`;
          break;
        case "/updateAsset/:asset_id/:empId":
          eventType = "Update";
          eventDescription = `Asset updated on ${date}.`;
          break;
        case "/scrapAsset":
          eventType = "Scrap";
          eventDescription = `Asset scrapped on ${date}.`;
          break;
        case "/returnAsset":
          eventType = "Return";
          eventDescription = `Asset returned on ${date}.`;
          break;
        default:
          break;
      }

      // Add history entry
      await addAssetHistoryEntry(assetId, eventType, eventDescription);
    }
  
    next();
  } catch (error) {
    console.error("Error in addAssetHistoryMiddleware:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});








