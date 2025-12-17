import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/database.js";
dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log(`Server is accessible on your network at http://13.204.143.232:${PORT}`);
    });
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");

    await sequelize.sync();
  } catch (error) {
    console.error("Unable to connect to the database or start the server:", error);
    process.exit(1);
  }
};

startServer();
