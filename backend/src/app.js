import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import customerRoutes from './routes/customerRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', customerRoutes);
app.use('/api', paymentRoutes);

app.use(errorHandler);

export default app;