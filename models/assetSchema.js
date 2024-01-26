const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");
const Employee = require("./employeeSchema");

// Define Asset model
const Asset = sequelize.define("Asset", {
  asset_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  serial_number: {
    type: DataTypes.STRING,
    unique: true,
  },
  asset_type: {
    type: DataTypes.STRING,
  },
  make: {
    type: DataTypes.STRING,
  },
  model: {
    type: DataTypes.STRING,
  },
  status: {
    type: DataTypes.STRING,
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull:false
  },
  assigned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  empId: {
    type: DataTypes.UUID,
  },
  returnReason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Define AssetCategory model
const AssetCategory = sequelize.define("AssetCategory", {
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category_name: {
    type: DataTypes.STRING,
    unique: true,
  },
});

Asset.belongsTo(AssetCategory, { foreignKey: "category_id" });
Asset.belongsTo(Employee, { foreignKey: "empId" });

module.exports = {
  Asset,
  AssetCategory,
};
