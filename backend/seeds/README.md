# Database Seed Data

This directory contains seed data and scripts to populate your database with sample data for testing and development.

## Files

- **`seed-data.json`**: JSON file containing sample data for customers and payments
- **`seed.js`**: Node.js script to populate the database from the JSON file
- **`README.md`**: This file

## Usage

### Running the Seed Script

To populate your database with the sample data:

```bash
cd backend
npm run seed
```

Or directly:

```bash
node seeds/seed.js
```

### What the Seed Script Does

1. **Ensures database schema**: Creates the `customer_name` column if it doesn't exist
2. **Syncs database tables**: Creates tables if they don't exist
3. **Clears existing data**: Removes all existing customers and payments (optional)
4. **Seeds customers**: Creates 10 sample customers with various loan details
5. **Seeds payments**: Creates payment records and updates customer EMI due amounts accordingly

## Seed Data Structure

### Customers

Each customer entry contains:

- `customer_name`: Customer's full name
- `account_number`: Unique account identifier (e.g., "ACC001")
- `issue_date`: Loan issue date in YYYY-MM-DD format
- `interest_rate`: Interest rate as a decimal string (e.g., "8.5")
- `tenure`: Loan tenure in months (e.g., 36)
- `emi_due`: Current EMI due amount as a decimal string (e.g., "15000.00")

### Payments

Each payment entry contains:

- `account_number`: Reference to customer's account number
- `payment_amount`: Payment amount as a decimal string (e.g., "5000.00")
- `payment_date`: Payment date in ISO format (optional, defaults to current date)
- `status`: Payment status (typically "SUCCESS")

**Note**: Payments automatically update the customer's `emi_due` amount when created.

## Sample Data Included

The seed file includes:

- **10 customers** with diverse loan profiles
- **17 payments** across various customers
- **Endpoint documentation** with request/response examples

## Customizing Seed Data

You can modify `seed-data.json` to add, remove, or change the sample data:

1. Edit `seed-data.json` with your desired data
2. Run `npm run seed` to populate the database
3. The script will validate payment amounts against EMI due amounts

## Important Notes

- **Payment Validation**: The seed script validates that payment amounts don't exceed EMI due amounts
- **Account Numbers**: Must be unique across all customers
- **Date Format**: Use YYYY-MM-DD format for dates
- **EMI Updates**: Creating payments automatically reduces the customer's EMI due amount
- **Data Clearing**: The script clears existing data by default. Comment out the clearing section in `seed.js` if you want to keep existing data

## API Endpoints Covered

The seed data supports all API endpoints:

### Customers

- `GET /api/customers` - Get all customers
- `GET /api/customers/:account_number` - Get customer by account number
- `POST /api/customers` - Create new customer

### Payments

- `POST /api/payments` - Create a payment
- `GET /api/payments/:account_number` - Get payment history for a customer

## Troubleshooting

If you encounter errors:

1. **Database Connection**: Ensure your database is running and connection settings in `.env` are correct
2. **Schema Issues**: The script automatically creates the `customer_name` column if needed
3. **Duplicate Accounts**: Ensure account numbers in seed data are unique
4. **Payment Amounts**: Payment amounts cannot exceed EMI due amounts
