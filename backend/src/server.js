import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import sequelize from "./config/database.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1️⃣ Authenticate DB first
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    // 2️⃣ Test connection pool with a simple query
    await sequelize.query("SELECT 1");
    console.log("Connection pool test successful.");

    // 3️⃣ Sync models
    await sequelize.sync();
    console.log("Database synced successfully.");

    // 4️⃣ ONLY THEN start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Server is accessible on your network at http://13.204.143.232:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    process.exit(1);
  }
};

startServer();
