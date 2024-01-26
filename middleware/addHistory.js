const asyncHandler = require("express-async-handler");
const { AssetHistory } = require("../models/assetHistory");

exports.addAssetHistoryEntry = asyncHandler(async (assetId, eventType, eventDescription) => {
  try {
    await AssetHistory.create({
      asset_id: assetId,
      eventType: eventType,
      eventDescription
    });
  } catch (error) {
    console.error("Error adding asset history entry:", error);
  }
});
