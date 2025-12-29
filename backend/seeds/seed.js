import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "../src/config/database.js";
import Customer from "../src/model/customer.js";
import Payment from "../src/model/payment.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read seed data
const seedDataPath = path.join(__dirname, "seed-data.json");
const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf8"));

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...");

    // 🔥 ALWAYS create schema here
    await sequelize.sync({ force: true });
    console.log("✅ Database tables created");

    // Seed customers
    console.log(`📝 Seeding ${seedData.customers.length} customers...`);
    const customers = await Customer.bulkCreate(seedData.customers, {
      returning: true,
    });
    console.log(`✅ Created ${customers.length} customers`);

    // Map account_number → customer_id
    const accountMap = {};
    customers.forEach((c) => {
      accountMap[c.account_number] = c;
    });

    // Seed payments
    console.log(`💳 Seeding ${seedData.payments.length} payments...`);
    let paymentCount = 0;

    for (const p of seedData.payments) {
      const customer = accountMap[p.account_number];
      if (!customer) continue;

      const paymentAmount = parseFloat(p.payment_amount);
      const currentEmi = parseFloat(customer.emi_due);

      if (paymentAmount > currentEmi) continue;

      await Payment.create({
        customer_id: customer.id,
        payment_amount: paymentAmount,
        payment_date: p.payment_date || new Date(),
        status: p.status || "SUCCESS",
      });

      const newEmi = Math.max(0, currentEmi - paymentAmount);
      customer.emi_due = newEmi.toFixed(2);
      await customer.save();

      paymentCount++;
    }

    console.log(`✅ Created ${paymentCount} payments`);
    console.log("🎉 Database seeding completed successfully");
  } catch (err) {
    console.error("❌ Seed failed:", err);
    throw err;
  } finally {
    await sequelize.close();
  }
}

seedDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
