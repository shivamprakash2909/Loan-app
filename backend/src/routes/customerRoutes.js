import express from "express";
import * as customerController from "../controllers/customerController.js";
import { accountNumberValidationRules, customerValidationRules } from "../middleware/validator.js";
const router = express.Router();

router.get("/customers", customerController.getAllCustomers);
router.get("/customers/:account_number", accountNumberValidationRules, customerController.getCustomerByAccountNumber);
router.post("/customers", customerValidationRules, customerController.createCustomer);
export default router;
