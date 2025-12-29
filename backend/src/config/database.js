import dotenv from "dotenv";
import { Sequelize } from "sequelize";
dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  name: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

console.log("DB CONFIG VALUES 👉", {
  host: dbConfig.host,
  port: dbConfig.port,
  name: dbConfig.name,
  user: dbConfig.user,
  password: dbConfig.password,
});

const sequelize = new Sequelize(dbConfig.name, dbConfig.user, dbConfig.password, {
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: "postgres",
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    connectTimeout: 30000,
  },
  define: {
    timestamps: true,
  },
});

export default sequelize;
