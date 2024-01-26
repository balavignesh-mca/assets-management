const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Employee = sequelize.define(
  "Employee",
  {
    empId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 100],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [1, 150],
      },
    },
    mobileNo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isNumeric: true,
      },
    },
    role: {
      type: DataTypes.ENUM("Admin", "Employee"),
      defaultValue: "Employee",
    },
    jobType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salary: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    isWorking: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    joinDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    terminationDate: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = Employee;
