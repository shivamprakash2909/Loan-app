import { body, param, validationResult } from "express-validator";

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const paymentValidationRules = [
  body("account_number").notEmpty().withMessage("Account number is required").isString().trim(),
  body("payment_amount").isFloat({ gt: 0 }).withMessage("Payment amount must be a positive number"),
  handleValidationErrors,
];

export const accountNumberValidationRules = [
  param("account_number").notEmpty().withMessage("Account number parameter is required").isString().trim(),
  handleValidationErrors,
];

export const customerValidationRules = [
  body("customer_name")
    .notEmpty()
    .withMessage("Customer name is required")
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Customer name must be between 2 and 100 characters"),
  body("account_number")
    .notEmpty()
    .withMessage("Account number is required")
    .isString()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Account number must be between 1 and 50 characters"),
  body("issue_date")
    .notEmpty()
    .withMessage("Issue date is required")
    .isISO8601()
    .withMessage("Issue date must be a valid date (YYYY-MM-DD)"),
  body("interest_rate").isFloat({ gt: 0 }).withMessage("Interest rate must be a positive number"),
  body("tenure").isInt({ gt: 0 }).withMessage("Tenure must be a positive integer"),
  body("emi_due").isFloat({ gt: 0 }).withMessage("EMI due must be a positive number"),
  handleValidationErrors,
];
