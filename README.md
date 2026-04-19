# DIZ EDEN — Luxury Short-Stay Residences

A premium, high-conversion booking platform for luxury short-stay apartments, built with React, Vite, Tailwind CSS, and Supabase.

## 🚀 Quick Start

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Setup Environment:**
   Copy `.env.example` to `.env` and fill in your Supabase and Paystack keys.

3. **Database Schema:**
   Run the contents of `setup_database.sql` and `security_fixes.sql` in your Supabase SQL Editor.

4. **Run Locally:**
   ```bash
   npm run dev
   ```

## 🛠 Features

- **Airbnb-Style UI:** Floating booking pill, sticky mobile bars, and fluid typography.
- **Secure Payments:** Integrated Paystack with server-side amount verification to prevent tampering.
- **Automated Notifications:**
  - **Telegram:** Real-time booking alerts for admins.
  - **Resend:** Branded HTML confirmation and cancellation emails for guests.
- **Admin Dashboard:** Manage bookings, view live availability, and manually log reservations.

## 📦 Deployment

### Vercel (Recommended)
This project is pre-configured for Vercel. Simply connect your GitHub repository and set the environment variables in the Vercel Dashboard.

### Supabase Edge Functions
To deploy the backend logic (Payments & Emails):
```bash
npx supabase functions deploy verify-payment --no-verify-jwt
npx supabase functions deploy send-email --no-verify-jwt
```

## 🔒 Security
- **RLS Enforced:** Database access is strictly controlled via Row-Level Security policies.
- **Environment Secrets:** Sensitive keys (Paystack Secret, Telegram Token) are stored securely as Supabase Edge secrets, never exposed to the client.

---
*Built for excellence by Diz Eden.*
