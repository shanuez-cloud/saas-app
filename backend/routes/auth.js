const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

router.post("/register", async (req, res) => {
  const { email, password, businessName } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const business = await prisma.business.create({
    data: { name: businessName }
  });

  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      businessId: business.id
    }
  });

  const token = jwt.sign(
    { userId: user.id, businessId: business.id },
    process.env.JWT_SECRET
  );

  res.json({ token });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: "Invalid" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: "Invalid" });

  const token = jwt.sign(
    { userId: user.id, businessId: user.businessId },
    process.env.JWT_SECRET
  );

  res.json({ token });
});

module.exports = router;