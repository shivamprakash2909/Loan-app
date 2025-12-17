import { getCustomerByAccountQuery, getCustomersQuery, insertCustomerQuery } from "../utils/dbHelpers.js";

// POST /api/customers
export const createCustomer = async (req, res, next) => {
  try {
    const { customer_name, account_number, issue_date, interest_rate, tenure, emi_due } = req.body;

    const newCustomer = await insertCustomerQuery({
      customer_name,
      account_number,
      issue_date,
      interest_rate,
      tenure,
      emi_due,
    });

    res.status(201).json(newCustomer);
  } catch (error) {
    console.error("Create customer error:", error);
    next(error);
  }
};

// GET /api/customers
export const getAllCustomers = async (req, res, next) => {
  try {
    const customers = await getCustomersQuery();
    res.status(200).json(customers);
  } catch (error) {
    console.error("Get all customers error:", error);
    next(error);
  }
};

// GET /api/customers/:account_number
export const getCustomerByAccountNumber = async (req, res, next) => {
  try {
    const customer = await getCustomerByAccountQuery(req.params.account_number);

    if (!customer) {
      return res.status(404).json({ message: "Customer account not found." });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error("Get customer by account number error:", error);
    next(error);
  }
};
