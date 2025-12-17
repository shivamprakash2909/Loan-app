import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "../src/config/database.js";
import Customer from "../src/model/customer.js";
import Payment from "../src/model/payment.js";
import { ensureCustomerNameColumn } from "../src/utils/dbHelpers.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read seed data
const seedDataPath = path.join(__dirname, "seed-data.json");
const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf8"));

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // Sync models (create tables if they don't exist) - MUST be done first
    await sequelize.sync({ force: false });
    console.log("✅ Database tables synced");

    // Ensure customer_name column exists (after tables are created)
    await ensureCustomerNameColumn();

    // Clear existing data (optional - comment out if you want to keep existing data)
    // Must delete payments first due to foreign key constraint
    console.log("🗑️  Clearing existing data...");
    await Payment.destroy({ where: {}, truncate: true });
    // Use raw SQL with CASCADE to handle foreign key constraints
    await sequelize.query("TRUNCATE TABLE customers CASCADE");
    console.log("✅ Existing data cleared");

    // Seed customers
    console.log(`📝 Seeding ${seedData.customers.length} customers...`);
    const createdCustomers = [];
    for (const customerData of seedData.customers) {
      try {
        const customer = await Customer.create({
          customer_name: customerData.customer_name,
          account_number: customerData.account_number,
          issue_date: customerData.issue_date,
          interest_rate: customerData.interest_rate,
          tenure: customerData.tenure,
          emi_due: customerData.emi_due,
        });
        createdCustomers.push(customer);
        console.log(`  ✓ Created customer: ${customer.account_number} - ${customer.customer_name}`);
      } catch (error) {
        console.error(`  ✗ Failed to create customer ${customerData.account_number}:`, error.message);
      }
    }
    console.log(`✅ Created ${createdCustomers.length} customers`);

    // Create a map of account_number to customer_id for payments
    const accountToCustomerId = {};
    for (const customer of createdCustomers) {
      accountToCustomerId[customer.account_number] = customer.id;
    }

    // Seed payments
    console.log(`💳 Seeding ${seedData.payments.length} payments...`);
    let paymentCount = 0;
    for (const paymentData of seedData.payments) {
      try {
        const customerId = accountToCustomerId[paymentData.account_number];
        if (!customerId) {
          console.warn(`  ⚠ Skipping payment: Customer ${paymentData.account_number} not found`);
          continue;
        }

        // Check if payment amount exceeds EMI due
        const customer = createdCustomers.find((c) => c.account_number === paymentData.account_number);
        if (parseFloat(paymentData.payment_amount) > parseFloat(customer.emi_due)) {
          console.warn(
            `  ⚠ Skipping payment: Amount ${paymentData.payment_amount} exceeds EMI due ${customer.emi_due} for ${paymentData.account_number}`
          );
          continue;
        }

        // Create payment
        const payment = await Payment.create({
          customer_id: customerId,
          payment_amount: paymentData.payment_amount,
          payment_date: paymentData.payment_date || new Date(),
          status: paymentData.status || "SUCCESS",
        });

        // Update customer's EMI due
        const currentEmiDue = parseFloat(customer.emi_due);
        const paymentAmount = parseFloat(paymentData.payment_amount);
        const newEmiDue = Math.max(0, currentEmiDue - paymentAmount);

        await sequelize.query(`UPDATE customers SET emi_due = :newEmiDue WHERE id = :customerId`, {
          replacements: { newEmiDue: newEmiDue.toFixed(2), customerId: customer.id },
        });

        // Update the customer object in memory for subsequent payments
        customer.emi_due = newEmiDue.toFixed(2);

        paymentCount++;
        console.log(
          `  ✓ Created payment: ₹${paymentData.payment_amount} for ${
            paymentData.account_number
          } (EMI due: ₹${newEmiDue.toFixed(2)})`
        );
      } catch (error) {
        console.error(`  ✗ Failed to create payment for ${paymentData.account_number}:`, error.message);
      }
    }
    console.log(`✅ Created ${paymentCount} payments`);

    console.log("\n🎉 Database seeding completed successfully!");
    console.log(`\n📊 Summary:`);
    console.log(`   - Customers: ${createdCustomers.length}`);
    console.log(`   - Payments: ${paymentCount}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the seed function
seedDatabase()
  .then(() => {
    console.log("\n✅ Seed script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Seed script failed:", error);
    process.exit(1);
  });
