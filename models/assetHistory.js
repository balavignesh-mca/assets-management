const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const { Asset } = require("./assetSchema");

// Define AssetHistory model
const AssetHistory = sequelize.define("AssetHistory", {
  history_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  asset_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  eventType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  eventDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  eventDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false,
  },
});

AssetHistory.belongsTo(Asset, { foreignKey: "asset_id" });

module.exports = {
  AssetHistory,
};
