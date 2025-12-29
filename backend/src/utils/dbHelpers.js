import sequelize from "../config/database.js";

/**
 * ===============================
 * RUNTIME QUERY HELPERS
 * ===============================
 * ⚠️ IMPORTANT:
 * - DO NOT modify schema here
 * - DO NOT check table/column existence
 * - DO NOT run ALTER TABLE
 * - ONLY read/write data
 */

/**
 * Get all customers
 */
export async function getCustomersQuery() {
  const [results] = await sequelize.query(
    `SELECT
        id,
        account_number,
        issue_date,
        interest_rate,
        tenure,
        emi_due,
        created_at,
        customer_name
     FROM customers
     ORDER BY created_at DESC`
  );

  return results.map((row) => ({
    ...row,
    customer_name: row.customer_name || "N/A",
  }));
}

/**
 * Get customer by account number
 */
export async function getCustomerByAccountQuery(accountNumber) {
  const [results] = await sequelize.query(
    `SELECT
        id,
        account_number,
        issue_date,
        interest_rate,
        tenure,
        emi_due,
        created_at,
        customer_name
     FROM customers
     WHERE account_number = :account_number`,
    {
      replacements: { account_number: accountNumber },
    }
  );

  return results.length > 0 ? { ...results[0], customer_name: results[0].customer_name || "N/A" } : null;
}

/**
 * Insert new customer
 */
export async function insertCustomerQuery(customerData) {
  const { customer_name, account_number, issue_date, interest_rate, tenure, emi_due } = customerData;

  const [results] = await sequelize.query(
    `INSERT INTO customers
      (customer_name, account_number, issue_date, interest_rate, tenure, emi_due, created_at)
     VALUES
      (:customer_name, :account_number, :issue_date, :interest_rate, :tenure, :emi_due, NOW())
     RETURNING *`,
    {
      replacements: {
        customer_name: customer_name || "N/A",
        account_number,
        issue_date,
        interest_rate,
        tenure,
        emi_due,
      },
    }
  );

  return results[0];
}
