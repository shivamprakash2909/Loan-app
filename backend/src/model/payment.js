import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Payment = sequelize.define('Payment', {
  customer_id: { type: DataTypes.INTEGER, allowNull: false },
  payment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  payment_amount: { type: DataTypes.DECIMAL, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },
}, {
  tableName: 'payments',
  timestamps: true,
});

export default Payment;