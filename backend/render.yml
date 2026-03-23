require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const billingRoutes = require("./routes/billing");
const customerRoutes = require("./routes/customers");

const app = express();

// Stripe webhook needs raw body
app.use("/billing/stripe/webhook", express.raw({ type: "application/json" }));

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/billing", billingRoutes);
app.use("/customers", customerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on", PORT));