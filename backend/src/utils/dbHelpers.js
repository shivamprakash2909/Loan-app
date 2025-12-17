import sequelize from "../config/database.js";

// Cache for column existence checks
let columnCache = {
  customer_name: null, // null = not checked, true = exists, false = doesn't exist
};

/**
 * Check if a column exists in a table
 * @param {string} tableName - Name of the table
 * @param {string} columnName - Name of the column
 * @returns {Promise<boolean>} - True if column exists, false otherwise
 */
export async function columnExists(tableName, columnName) {
  // Check cache first
  if (columnCache[columnName] !== null) {
    return columnCache[columnName];
  }

  try {
    const [results] = await sequelize.query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = :tableName AND column_name = :columnName`,
      {
        replacements: { tableName, columnName },
      }
    );

    const exists = results.length > 0;
    columnCache[columnName] = exists;
    return exists;
  } catch (error) {
    console.error(`Error checking column existence for ${columnName}:`, error);
    // Default to false if check fails
    columnCache[columnName] = false;
    return false;
  }
}

/**
 * Check if a table exists
 */
async function tableExists(tableName) {
  try {
    const [results] = await sequelize.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_name = :tableName`,
      {
        replacements: { tableName },
      }
    );
    return results.length > 0;
  } catch (error) {
    console.error(`Error checking table existence for ${tableName}:`, error);
    return false;
  }
}

/**
 * Ensure customer_name column exists, create it if it doesn't
 */
export async function ensureCustomerNameColumn() {
  // First check if table exists
  const tableExistsResult = await tableExists("customers");
  if (!tableExistsResult) {
    console.log("⚠️  customers table does not exist yet, skipping column creation");
    return false;
  }

  const exists = await columnExists("customers", "customer_name");

  if (!exists) {
    try {
      console.log("Creating customer_name column...");
      await sequelize.query(`ALTER TABLE customers ADD COLUMN IF NOT EXISTS customer_name VARCHAR(255) DEFAULT 'N/A'`);

      // Update existing records to have 'N/A' if they're null
      await sequelize.query(`UPDATE customers SET customer_name = 'N/A' WHERE customer_name IS NULL`);

      // Update cache
      columnCache.customer_name = true;
      console.log("customer_name column created successfully");
    } catch (error) {
      // If column already exists or other error, log but don't throw
      if (error.message && error.message.includes("already exists")) {
        console.log("customer_name column already exists");
        columnCache.customer_name = true;
      } else {
        console.error("Error creating customer_name column:", error.message);
        // Don't throw - allow app to continue
      }
    }
  }

  return exists;
}

/**
 * Get customers query - automatically creates customer_name column if needed
 */
export async function getCustomersQuery() {
  // Ensure customer_name column exists
  await ensureCustomerNameColumn();

  const [results] = await sequelize.query(
    `SELECT id, account_number, issue_date, interest_rate, tenure, emi_due, created_at, customer_name
     FROM customers 
     ORDER BY created_at DESC`
  );

  return results.map((row) => ({
    ...row,
    customer_name: row.customer_name || "N/A",
  }));
}

/**
 * Get customer by account number query - automatically creates customer_name column if needed
 */
export async function getCustomerByAccountQuery(accountNumber) {
  // Ensure customer_name column exists
  await ensureCustomerNameColumn();

  const [results] = await sequelize.query(
    `SELECT id, account_number, issue_date, interest_rate, tenure, emi_due, created_at, customer_name
     FROM customers 
     WHERE account_number = :account_number`,
    {
      replacements: { account_number: accountNumber },
    }
  );

  return results[0] ? { ...results[0], customer_name: results[0].customer_name || "N/A" } : null;
}

/**
 * Insert customer query - automatically creates customer_name column if needed
 */
export async function insertCustomerQuery(customerData) {
  // Ensure customer_name column exists before inserting
  await ensureCustomerNameColumn();

  const { customer_name, account_number, issue_date, interest_rate, tenure, emi_due } = customerData;

  const [results] = await sequelize.query(
    `INSERT INTO customers (customer_name, account_number, issue_date, interest_rate, tenure, emi_due, created_at)
     VALUES (:customer_name, :account_number, :issue_date, :interest_rate, :tenure, :emi_due, NOW())
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
