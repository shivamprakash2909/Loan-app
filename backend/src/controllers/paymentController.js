import sequelize from "../config/database.js";
import Payment from "../model/payment.js";

// POST /api/payments
export const createPayment = async (req, res, next) => {
  const { account_number, payment_amount } = req.body;
  const transaction = await sequelize.transaction();

  try {
    // Find customer - only need id, account_number, and emi_due (no customer_name needed)
    const [customerResults] = await sequelize.query(
      `SELECT id, account_number, emi_due FROM customers WHERE account_number = :account_number FOR UPDATE`,
      {
        replacements: { account_number },
        transaction,
      }
    );
    const customer = customerResults[0] || null;

    if (!customer) {
      await transaction.rollback();
      return res.status(404).json({ message: "Customer account not found." });
    }

    // Convert to numbers for calculation
    const currentEmiDue = parseFloat(customer.emi_due);
    const paymentAmt = parseFloat(payment_amount);

    // Validate payment amount doesn't exceed EMI due
    if (paymentAmt > currentEmiDue) {
      await transaction.rollback();
      return res.status(400).json({
        message: `Payment amount ($${paymentAmt.toFixed(2)}) exceeds EMI due ($${currentEmiDue.toFixed(
          2
        )}). Please enter an amount equal to or less than the EMI due.`,
      });
    }

    // Calculate new EMI due amount (ensure it doesn't go below 0)
    const newEmiDue = Math.max(0, currentEmiDue - paymentAmt);

    // Create payment record
    const newPayment = await Payment.create(
      {
        customer_id: customer.id,
        payment_amount: paymentAmt,
        status: "SUCCESS",
      },
      { transaction }
    );

    // Update customer's EMI due amount using raw query
    await sequelize.query(`UPDATE customers SET emi_due = :newEmiDue WHERE id = :customerId`, {
      replacements: { newEmiDue: newEmiDue.toFixed(2), customerId: customer.id },
      transaction,
    });

    await transaction.commit();

    res.status(201).json({
      message: "Payment processed successfully.",
      payment: {
        account_number: customer.account_number,
        paid_amount: newPayment.payment_amount,
        payment_date: newPayment.payment_date,
        status: newPayment.status,
      },
      customer: {
        account_number: customer.account_number,
        previous_emi_due: currentEmiDue,
        new_emi_due: newEmiDue,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Create payment error:", error);
    next(error);
  }
};

// GET /api/payments/:account_number
export const getPaymentHistory = async (req, res, next) => {
  try {
    // Find customer - only need id (no customer_name needed)
    const [customerResults] = await sequelize.query(`SELECT id FROM customers WHERE account_number = :account_number`, {
      replacements: { account_number: req.params.account_number },
    });
    const customer = customerResults[0] || null;

    if (!customer) {
      return res.status(404).json({ message: "Customer account not found." });
    }

    // Get payments using raw query - only select essential columns (no timestamps)
    const [payments] = await sequelize.query(
      `SELECT id, customer_id, payment_date, payment_amount, status
       FROM payments 
       WHERE customer_id = :customerId 
       ORDER BY payment_date DESC`,
      {
        replacements: { customerId: customer.id },
      }
    );

    res.status(200).json(payments);
  } catch (error) {
    console.error("Get payment history error:", error);
    next(error);
  }
};
