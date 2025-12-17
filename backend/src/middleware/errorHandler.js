const errorHandler = (err, req, res, next) => {
  console.error("Error Stack:", err.stack);
  console.error("Error Message:", err.message);
  console.error("Error Details:", err);

  // Check if it's a database column error
  if (err.message && err.message.includes("column") && err.message.includes("does not exist")) {
    return res.status(500).json({
      success: false,
      message: "Database schema mismatch. Please run migration to add customer_name column.",
      error:
        process.env.NODE_ENV === "development"
          ? {
              message: err.message,
              hint: "Run: ALTER TABLE customers ADD COLUMN customer_name VARCHAR(255) DEFAULT 'N/A';",
            }
          : {},
    });
  }

  res.status(500).json({
    success: false,
    message: "An unexpected error occurred on the server.",
    error:
      process.env.NODE_ENV === "development"
        ? {
            message: err.message,
            stack: err.stack,
          }
        : {},
  });
};

export default errorHandler;
