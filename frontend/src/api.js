services:
  - type: web
    name: saas-backend
    env: node
    plan: free
    rootDir: backend
    buildCommand: npm install && npx prisma generate && npx prisma migrate deploy
    startCommand: node server.js
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false
      - key: PAYSTACK_SECRET_KEY
        sync: false
      - key: FRONTEND_URL
        sync: false