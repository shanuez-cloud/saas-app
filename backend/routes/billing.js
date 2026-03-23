const express = require("express");
const Stripe = require("stripe");
const axios = require("axios");
const auth = require("../middleware/auth");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// STRIPE CHECKOUT
router.post("/stripe/checkout", auth, async (req, res) => {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [
      {
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1
      }
    ],
    success_url: process.env.FRONTEND_URL,
    cancel_url: process.env.FRONTEND_URL
  });

  res.json({ url: session.url });
});

// STRIPE WEBHOOK
router.post("/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];

  const event = stripe.webhooks.constructEvent(
    req.body,
    sig,
    process.env.STRIPE_WEBHOOK_SECRET
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    await prisma.subscription.upsert({
      where: { businessId: session.metadata.businessId },
      update: {
        status: "active",
        provider: "stripe",
        plan: "pro"
      },
      create: {
        businessId: session.metadata.businessId,
        provider: "stripe",
        plan: "pro",
        status: "active"
      }
    });
  }

  res.json({ received: true });
});

// PAYSTACK INIT
router.post("/paystack/initialize", auth, async (req, res) => {
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: req.user.email,
      amount: 5000 * 100
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    }
  );

  res.json(response.data);
});

module.exports = router;