import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import errorHandler from "./middleware/errorHandler.js";
import customerRoutes from "./routes/customerRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use("/api", customerRoutes);
app.use("/api", paymentRoutes);

app.use(errorHandler);

export default app;
