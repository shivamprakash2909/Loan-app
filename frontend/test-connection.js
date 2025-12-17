// Quick test script to verify API connectivity
// Run with: node test-connection.js

const axios = require("axios");

const API_URL = "http://192.168.29.15:3000/api/customers";

console.log("Testing connection to:", API_URL);

axios
  .get(API_URL)
  .then((response) => {
    console.log("✅ SUCCESS!");
    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(response.data, null, 2));
  })
  .catch((error) => {
    console.log("❌ FAILED!");
    console.log("Error:", error.message);
    console.log("Code:", error.code);
    if (error.response) {
      console.log("Status:", error.response.status);
      console.log("Data:", error.response.data);
    }
  });
