// Import required modules
// npm install express axios body-parser

const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const app = express();

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

/*
 * Webhook Endpoint to Receive Transaction Status
 * This endpoint will receive transaction status updates from the payment gateway platform.
 * Ensure this URL is configured as the webhook in the payment platform dashboard.
 *
 * Using ngrok for exposing your dev local server to the internet (to receive webhooks) for testing.
 * Start ngrok with: ngrok http 9090 (replace 9090 with your port number) https://dashboard.ngrok.com/
 * Example public URL: https://abcd1234.ngrok.io/webhook/transaction-status
 */

app.post("/webhook/transaction-status", (req, res) => {
  console.log("Received Transaction Status:", req.body);

  // Example: You can update the order status in your database here
  // e.g., orderId = req.body.orderId, status = req.body.status

  // Send a 200 OK response to acknowledge receipt of the webhook
  res.sendStatus(200);
});

/*
 * Create Order and Redirect to Payment Page
 * This endpoint makes a backend call to the payment gateway to create an order.
 * After receiving the order details, it redirects the user to the payment URL.
 */
app.get("/order/pay", async (req, res) => {
  try {
    // Define order details
    const orderDetails = {
      vendorKey: "01953cd5-0b01-7853-acd4-df422279891f", // Replace with your vendor key - safely store this in environment variables
      orderId: "1234567890-2", // IMPORTANT: Order ID should be unique for each payment transaction
      amount: 1000, // Amount in the smallest currency unit (e.g., cents for USD)
    };

    // Make a POST request to the order API
    const response = await axios.post(
      "https://api-demo.fiathub.app/order",
      orderDetails
    );

    console.log("Order Response:", response.data);

    // Check if the order was successfully created
    if (response.data.success) {
      // Extract the redirect URL from the response
      const redirectURL = response.data.data.redirectURL;

      // Redirect the user to the payment page
      res.redirect(redirectURL);
    } else {
      // If the order was not successful, show the error message
      res.status(500).send(`Order creation failed: ${response.data.message}`);
    }
  } catch (error) {
    // Handle errors during the API request
    console.error(
      "Error creating order:",
      error.response?.data || error.message
    );
    res.status(500).send("Order creation failed");
  }
});

// Start the server and listen on port 3000
const PORT = 9090;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
