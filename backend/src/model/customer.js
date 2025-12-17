import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Customer = sequelize.define(
  "Customer",
  {
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true, // Temporarily allow null until database migration
      defaultValue: "N/A",
    },
    account_number: { type: DataTypes.STRING, unique: true, allowNull: false },
    issue_date: { type: DataTypes.DATE, allowNull: false },
    interest_rate: { type: DataTypes.DECIMAL, allowNull: false },
    tenure: { type: DataTypes.INTEGER, allowNull: false },
    emi_due: { type: DataTypes.DECIMAL, allowNull: false },
  },
  {
    tableName: "customers",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false, // Disabled since the database table doesn't have updated_at column
  }
);

export default Customer;
