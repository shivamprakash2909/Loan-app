import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { DataTypes, Sequelize } from "sequelize";
import { fileURLToPath } from "url";

dotenv.config();

// Create a separate Sequelize instance for seeding
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  dialect: "postgres",
  logging: false,
});

// Define models using the seed script's sequelize instance
const Customer = sequelize.define(
  "Customer",
  {
    customer_name: {
      type: DataTypes.STRING,
      allowNull: true,
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
    updatedAt: false,
  }
);

const Payment = sequelize.define(
  "Payment",
  {
    customer_id: { type: DataTypes.INTEGER, allowNull: false },
    payment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    payment_amount: { type: DataTypes.DECIMAL, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
  },
  {
    tableName: "payments",
    timestamps: true,
  }
);

// Define associations
Customer.hasMany(Payment, { foreignKey: "customer_id" });
Payment.belongsTo(Customer, { foreignKey: "customer_id" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read seed data
const seedDataPath = path.join(__dirname, "seed-data.json");
const seedData = JSON.parse(fs.readFileSync(seedDataPath, "utf8"));

async function seedDatabase() {
  try {
    console.log("🌱 Checking database state...");

    // Create tables if they don't exist (without dropping or altering existing ones)
    await sequelize.sync();
    console.log("✅ Database schema verified/created");

    // Check if data already exists
    const existingCustomers = await Customer.count();
    if (existingCustomers > 0) {
      console.log(`ℹ️  Database already contains ${existingCustomers} customers. Skipping seed.`);
      return { seeded: false, message: "Data already exists" };
    }

    console.log("📝 No existing data found. Starting seed...");

    // Seed customers
    console.log(`📝 Seeding ${seedData.customers.length} customers...`);
    const customers = await Customer.bulkCreate(seedData.customers, {
      returning: true,
      ignoreDuplicates: true,
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
    return { seeded: true, message: "Seeding completed" };
  } catch (err) {
    console.error("❌ Seed failed:", err);
    throw err;
  } finally {
    await sequelize.close();
  }
}

seedDatabase()
  .then((result) => {
    if (result && result.seeded) {
      process.exit(0);
    } else {
      process.exit(0); // Exit successfully even if data already exists
    }
  })
  .catch((err) => {
    console.error("Fatal error during seeding:", err);
    process.exit(1);
  });
