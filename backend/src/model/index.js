
import Customer from './customer.js';
import Payment from './payment.js';

Customer.hasMany(Payment, { foreignKey: 'customer_id' });
Payment.belongsTo(Customer, { foreignKey: 'customer_id' });

export { Customer, Payment };